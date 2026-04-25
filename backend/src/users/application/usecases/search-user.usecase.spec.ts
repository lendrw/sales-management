import "reflect-metadata";
import { SearchUserUseCase } from "./search-user.usecase";
import { UsersInMemoryRepository } from "@/users/infrastructure/in-memory/repositories/users-in-memory.repository";
import { UsersDataBuilder } from "@/users/infrastructure/testing/helpers/users-data-builder";
import { describeSearchUseCaseBehavior } from "@/common/infrastructure/testing/helpers/search-usecase-shared-examples";

describe("SearchUserUseCase Unit Tests", () => {
  describeSearchUseCaseBehavior(() => {
    const repository = new UsersInMemoryRepository();

    return {
      repository,
      sut: new SearchUserUseCase.UseCase(repository),
      build: UsersDataBuilder,
    };
  });
});
