import { OrderModel } from "@/orders/domain/models/orders.model";
import { OrdersRepository } from "@/orders/domain/repositories/orders.repository";
import { inject, injectable } from "tsyringe";
import { SearchInputDto } from "../dtos/search-input.dto";
import {
  PaginationOutputDto,
  PaginationOutputMapper,
} from "../dtos/pagination-output.dto";

export namespace SearchOrderUseCase {
  export type Input = SearchInputDto;

  export type Output = PaginationOutputDto<OrderModel>;

  @injectable()
  export class UseCase {
    constructor(
      @inject("OrdersRepository")
      private ordersRepository: OrdersRepository,
    ) {}

    async execute(input: Input): Promise<Output> {
      const searchResult = await this.ordersRepository.search(input);
      return PaginationOutputMapper.toOutput(searchResult.items, searchResult);
    }
  }
}
