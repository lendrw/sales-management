import {
  SearchInput,
  SearchOutput,
} from "@/common/domain/repositories/repository.interface";
import { OrderModel } from "@/orders/domain/models/orders.model";
import {
  CreateOrderProps,
  OrdersRepository,
} from "@/orders/domain/repositories/orders.repository";
import { inject, injectable } from "tsyringe";
import { DataSource, Repository } from "typeorm";
import { Order } from "../entities/orders.entity";
import { ProductsTypeormRepository } from "@/products/infrastructure/typeorm/repositories/products-typeorm.repository";
import { NotFoundError } from "@/common/domain/errors/not-found-error";
import { BadRequestError } from "@/common/domain/errors/bad-request-error";

@injectable()
export class OrdersTypeormRepository implements OrdersRepository {
  sortableFields: string[] = ["created_at"];

  constructor(
    @inject("OrdersDefaultRepositoryTypeorm")
    private ordersRepository: Repository<Order>,
    @inject("ProductRepository")
    private productsRepository: ProductsTypeormRepository,
  ) {}

  async createOrder(
    connection: DataSource,
    { customer, products: requestedProducts }: CreateOrderProps,
  ): Promise<OrderModel> {
    return connection.manager.transaction(
      async (transactionalEntityManager) => {
        // Criar itens do pedido
        const serializedOrderProducts = requestedProducts.map((product) => ({
          product_id: product.id,
          quantity: product.quantity,
          price: product.price,
        }));

        // Verificar estoque de cada produto
        for (const serializedOrderProduct of serializedOrderProducts) {
          const product = await this.productsRepository.findById(
            serializedOrderProduct.product_id,
          );
          if (serializedOrderProduct.quantity > product.quantity) {
            throw new BadRequestError(`Product ${product.id} is out of stock`);
          }
        }

        // Criar pedido
        const newOrder = transactionalEntityManager.create(Order, {
          customer_id: customer.id,
          order_products: serializedOrderProducts,
        });
        const order = await transactionalEntityManager.save(newOrder);

        // Atualizar estoque de cada produto
        for (const product of requestedProducts) {
          const productUpdate = await this.productsRepository.findById(
            product.id,
          );
          productUpdate.quantity -= product.quantity;
          await transactionalEntityManager.save(productUpdate);
        }

        return order;
      },
    );
  }

  create(props: CreateOrderProps): OrderModel {
    throw new Error("Method not implemented.");
  }

  insert(model: OrderModel): Promise<OrderModel> {
    throw new Error("Method not implemented.");
  }

  findById(id: string): Promise<OrderModel> {
    return this._get(id);
  }

  update(model: OrderModel): Promise<OrderModel> {
    throw new Error("Method not implemented.");
  }

  delete(id: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  search(props: SearchInput): Promise<SearchOutput<OrderModel>> {
    const page = props.page ?? 1;
    const perPage = props.per_page ?? 15;
    const validSort =
      (props.sort && this.sortableFields.includes(props.sort)) || false;
    const dirOps = ["asc", "desc"];
    const validSortDir =
      (props.sort_dir && dirOps.includes(props.sort_dir.toLowerCase())) ||
      false;
    const orderByField = validSort ? props.sort : "created_at";
    const orderByDir = validSortDir ? props.sort_dir : "desc";

    return this.ordersRepository
      .findAndCount({
        order: { [orderByField]: orderByDir },
        relations: {
          order_products: true,
        },
        skip: (page - 1) * perPage,
        take: perPage,
      })
      .then(([orders, total]) => ({
        items: orders,
        per_page: perPage,
        total,
        current_page: page,
        sort: orderByField,
        sort_dir: orderByDir,
        filter: props.filter,
      }));
  }

  protected async _get(id: string): Promise<OrderModel> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: {
        customer: true,
        order_products: true,
      },
    });
    if (!order) {
      throw new NotFoundError(`Order not found using ID ${id}`);
    }
    return order;
  }
}
