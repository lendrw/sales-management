import "reflect-metadata";
import { ProductsRepository } from "@/products/domain/repositories/products.repository";
import { CreateProductUseCase } from "./create-product.usecase";
import { ProductsInMemoryRepository } from "@/products/infrastructure/in-memory/repositories/products-in-memory.repository";
import { ConflictError } from "@/common/domain/errors/conflict-error";
import { BadRequestError } from "@/common/domain/errors/bad-request-error";

describe("CreateProductUseCase Unit Tests", () => {
  let sut: CreateProductUseCase.UseCase;
  let repository: ProductsRepository;
  const validInput = {
    name: "Product 1",
    price: 10,
    quantity: 5,
  };

  beforeEach(() => {
    repository = new ProductsInMemoryRepository();
    sut = new CreateProductUseCase.UseCase(repository);
  });

  it("should create a product", async () => {
    const spyInsert = jest.spyOn(repository, "insert");

    const result = await sut.execute(validInput);

    expect(result.id).toBeDefined();
    expect(result.created_at).toBeDefined();
    expect(spyInsert).toHaveBeenCalledTimes(1);
  });

  it("should not be possible to register a product with the name of another product", async () => {
    await sut.execute(validInput);

    await expect(sut.execute(validInput)).rejects.toBeInstanceOf(
      ConflictError,
    );
  });

  test.each([
    ["name", { name: null }],
    ["price", { price: 0 }],
    ["quantity", { quantity: 0 }],
  ])("should throws error when %s not provided", async (_field, input) => {
    await expect(
      sut.execute({ ...validInput, ...input }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });
});
