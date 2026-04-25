import "reflect-metadata";
import { ProductsInMemoryRepository } from "@/products/infrastructure/in-memory/repositories/products-in-memory.repository";
import { ProductsDataBuilder } from "@/products/infrastructure/testing/helpers/products-data-builder";
import { SearchProductUseCase } from "./search-product.usecase";
import { describeSearchUseCaseBehavior } from "@/common/infrastructure/testing/helpers/search-usecase-shared-examples";

describe("SearchProductUseCase Unit Tests", () => {
  describeSearchUseCaseBehavior(() => {
    const repository = new ProductsInMemoryRepository();

    return {
      repository,
      sut: new SearchProductUseCase.UseCase(repository),
      build: ProductsDataBuilder,
    };
  });
});
