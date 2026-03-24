import { testDataSource } from "@/common/infrastructure/typeorm/testing/data-source";
import { ProductsTypeormRepository } from "./products-typeorm.repository";
import { Product } from "../entities/products.entity";
import { NotFoundError } from "@/common/domain/errors/not-found-error";
import { randomUUID } from "node:crypto";
import { ProductsDataBuilder } from "../../testing/helpers/products-data-builder";
import { ConflictError } from "@/common/domain/errors/conflict-error";
import { ProductModel } from "@/products/domain/models/products.model";

describe("ProductsTypeormRepository integration tests", () => {
  let ormRepository: ProductsTypeormRepository;
  let typeormEntityManager: any;

  beforeAll(async () => {
    await testDataSource.initialize();
    typeormEntityManager = testDataSource.createEntityManager();
  });

  afterAll(async () => {
    await testDataSource.destroy();
  });

  beforeEach(async () => {
    await testDataSource.manager.query("DELETE FROM products");
    ormRepository = new ProductsTypeormRepository(
      typeormEntityManager.getRepository(Product),
    );
  });

  describe("findById", () => {
    it("should generate an error when the product is not found", async () => {
      const id = randomUUID();
      await expect(ormRepository.findById(id)).rejects.toThrow(
        new NotFoundError(`Product not found using ID ${id}`),
      );
    });

    it("should find a product by ID", async () => {
      const data = ProductsDataBuilder({});
      const product = testDataSource.manager.create(Product, data);
      await testDataSource.manager.save(product);

      const result = await ormRepository.findById(product.id);
      expect(result.id).toEqual(product.id);
      expect(result.name).toEqual(product.name);
    });
  });

  describe("create", () => {
    it("should create a new product object", () => {
      const data = ProductsDataBuilder({ name: "Product 1" });
      const result = ormRepository.create(data);
      expect(result.name).toEqual(data.name);
    });
  });

  describe("insert", () => {
    it("should insert a new product", async () => {
      const data = ProductsDataBuilder({ name: "Product 1" });
      const result = await ormRepository.insert(data);
      expect(result.name).toEqual(data.name);
    });
  });

  describe("update", () => {
    it("should generate an error when the product is not found", async () => {
      const data = ProductsDataBuilder({});
      await expect(ormRepository.update(data)).rejects.toThrow(
        new NotFoundError(`Product not found using ID ${data.id}`),
      );
    });

    it("should update a product", async () => {
      const data = ProductsDataBuilder({});
      const product = testDataSource.manager.create(Product, data);
      await testDataSource.manager.save(product);
      product.name = "nome atualizado";

      const result = await ormRepository.update(product);
      expect(result.name).toEqual("nome atualizado");
    });
  });

  describe("delete", () => {
    it("should generate an error when the product is not found", async () => {
      const id = randomUUID();
      await expect(ormRepository.delete(id)).rejects.toThrow(
        new NotFoundError(`Product not found using ID ${id}`),
      );
    });

    it("should delete a product", async () => {
      const data = ProductsDataBuilder({});
      const product = testDataSource.manager.create(Product, data);
      await testDataSource.manager.save(product);

      await ormRepository.delete(data.id);

      const result = await testDataSource.manager.findOneBy(Product, {
        id: data.id,
      });
      expect(result).toBeNull();
    });
  });

  describe("findByName", () => {
    it("should generate an error when the product is not found", async () => {
      const name = "Product 1";
      await expect(ormRepository.findByName(name)).rejects.toThrow(
        new NotFoundError(`Product not found using name ${name}`),
      );
    });

    it("should find a product by name", async () => {
      const data = ProductsDataBuilder({ name: "Product 1" });
      const product = testDataSource.manager.create(Product, data);
      await testDataSource.manager.save(product);

      const result = await ormRepository.findByName(data.name);
      expect(result.name).toEqual("Product 1");
    });
  });

  describe("conflictingName", () => {
    it("should generate an error when the product is found", async () => {
      const data = ProductsDataBuilder({ name: "Product 1" });
      const product = testDataSource.manager.create(Product, data);
      await testDataSource.manager.save(product);

      await expect(ormRepository.conflictingName("Product 1")).rejects.toThrow(
        new ConflictError(`Name already used by another product`),
      );
    });
  });

  describe("findAllByIds", () => {
    it("should return an empty array when not find the products", async () => {
      const productsIds = [{ id: randomUUID() }, { id: randomUUID() }];
      const result = await ormRepository.findAllByIds(productsIds);
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it("should find the products by ids", async () => {
      const productsIds = [{ id: randomUUID() }, { id: randomUUID() }];

      const data = ProductsDataBuilder({ id: productsIds[0].id });
      const product = testDataSource.manager.create(Product, data);
      await testDataSource.manager.save(product);

      const result = await ormRepository.findAllByIds(productsIds);
      expect(result).toHaveLength(1);
      expect(result[0].id).toEqual(productsIds[0].id);
    });
  });

  describe("search", () => {
    it("should apply only pagination when the other params are null", async () => {
      const arrange = Array(16).fill(ProductsDataBuilder({}));
      arrange.map((element) => delete element.id);
      const data = testDataSource.manager.create(Product, arrange);
      await testDataSource.manager.save(data);

      const result = await ormRepository.search({
        page: 1,
        per_page: 15,
        sort: null,
        sort_dir: null,
        filter: null,
      });

      expect(result.items).toHaveLength(15);
      expect(result.total).toBe(16);
      expect(result.sort).toEqual("created_at");
    });

    it("should order by created_at DESC when search params are null", async () => {
      const created_at = new Date();
      const models: ProductModel[] = [];
      const arrange = Array(16).fill(ProductsDataBuilder({}));
      arrange.forEach((element, index) => {
        delete element.id;
        models.push({
          ...element,
          name: `Product ${index}`,
          created_at: new Date(created_at.getTime() + index),
        });
      });
      const data = testDataSource.manager.create(Product, models);
      await testDataSource.manager.save(data);

      const result = await ormRepository.search({
        page: 1,
        per_page: 15,
        sort: null,
        sort_dir: null,
        filter: null,
      });

      expect(result.items[0].name).toEqual("Product 15");
      expect(result.items[14].name).toEqual("Product 1");
    });

    it("should apply paginate and sort", async () => {
      const created_at = new Date();
      const models: ProductModel[] = [];
      "badec".split("").forEach((element, index) => {
        models.push({
          ...ProductsDataBuilder({}),
          name: element,
          created_at: new Date(created_at.getTime() + index),
        });
      });
      const data = testDataSource.manager.create(Product, models);
      await testDataSource.manager.save(data);

      let result = await ormRepository.search({
        page: 1,
        per_page: 2,
        sort: "name",
        sort_dir: "ASC",
        filter: null,
      });

      expect(result.items[0].name).toEqual("a");
      expect(result.items[1].name).toEqual("b");
      expect(result.items.length).toEqual(2);

      result = await ormRepository.search({
        page: 1,
        per_page: 2,
        sort: "name",
        sort_dir: "DESC",
        filter: null,
      });

      expect(result.items[0].name).toEqual("e");
      expect(result.items[1].name).toEqual("d");
      expect(result.items.length).toEqual(2);
    });

    it("should search using filter, sort and paginate", async () => {
      const created_at = new Date();
      const models: ProductModel[] = [];
      const values = ["test", "a", "TEST", "b", "TeSt"];
      values.forEach((element, index) => {
        models.push({
          ...ProductsDataBuilder({}),
          name: element,
          created_at: new Date(created_at.getTime() + index),
        });
      });
      const data = testDataSource.manager.create(Product, models);
      await testDataSource.manager.save(data);

      let result = await ormRepository.search({
        page: 1,
        per_page: 2,
        sort: "name",
        sort_dir: "ASC",
        filter: "TEST",
      });

      expect(result.items[0].name).toEqual("test");
      expect(result.items[1].name).toEqual("TeSt");
      expect(result.items.length).toEqual(2);
      expect(result.total).toEqual(3);

      result = await ormRepository.search({
        page: 2,
        per_page: 2,
        sort: "name",
        sort_dir: "ASC",
        filter: "TEST",
      });

      expect(result.items[0].name).toEqual("TEST");
      expect(result.items.length).toEqual(1);
      expect(result.total).toEqual(3);
    });
  });
});
