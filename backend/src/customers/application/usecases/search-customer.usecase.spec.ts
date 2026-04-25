import "reflect-metadata";
import { SearchCustomerUseCase } from "./search-customer.usecase";
import { CustomersInMemoryRepository } from "@/customers/infrastructure/in-memory/repositories/customers-in-memory.repository";
import { CustomersDataBuilder } from "@/customers/infrastructure/testing/helpers/customers-data-builder";
import { describeSearchUseCaseBehavior } from "@/common/infrastructure/testing/helpers/search-usecase-shared-examples";

describe("SearchCustomerUseCase Unit Tests", () => {
  describeSearchUseCaseBehavior(() => {
    const repository = new CustomersInMemoryRepository();

    return {
      repository,
      sut: new SearchCustomerUseCase.UseCase(repository),
      build: CustomersDataBuilder,
    };
  });
});
