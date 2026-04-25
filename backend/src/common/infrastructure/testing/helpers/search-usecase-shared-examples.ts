type SearchableModel = {
  name: string;
  created_at: Date;
  [key: string]: any;
};

type SearchUseCaseContext<Model extends SearchableModel> = {
  sut: {
    execute(input: Record<string, any>): Promise<Record<string, any>>;
  };
  repository: {
    items: Model[];
  };
  build: (props: Partial<Model>) => Model;
};

type SearchUseCaseContextFactory<Model extends SearchableModel> =
  () => SearchUseCaseContext<Model>;

export function describeSearchUseCaseBehavior<Model extends SearchableModel>(
  makeContext: SearchUseCaseContextFactory<Model>,
) {
  let context: SearchUseCaseContext<Model>;

  beforeEach(() => {
    context = makeContext();
  });

  test("should return items ordered by created_at", async () => {
    const createdAt = new Date();
    const items = [
      context.build({} as Partial<Model>),
      context.build({
        created_at: new Date(createdAt.getTime() + 100),
      } as Partial<Model>),
      context.build({
        created_at: new Date(createdAt.getTime() + 200),
      } as Partial<Model>),
    ];
    context.repository.items = items;

    const result = await context.sut.execute({});

    expect(result).toStrictEqual({
      items: [...items].reverse(),
      total: 3,
      current_page: 1,
      per_page: 15,
      last_page: 1,
    });
  });

  test("should return output using pagination, sort and filter", async () => {
    const items = [
      context.build({ name: "a" } as Partial<Model>),
      context.build({ name: "AA" } as Partial<Model>),
      context.build({ name: "Aa" } as Partial<Model>),
      context.build({ name: "b" } as Partial<Model>),
      context.build({ name: "c" } as Partial<Model>),
    ];
    context.repository.items = items;

    const cases = [
      {
        sort_dir: "asc",
        expectedItems: [items[1], items[2]],
      },
      {
        sort_dir: "desc",
        expectedItems: [items[0], items[2]],
      },
    ];

    for (const { sort_dir, expectedItems } of cases) {
      const output = await context.sut.execute({
        page: 1,
        per_page: 2,
        sort: "name",
        sort_dir,
        filter: "a",
      });

      expect(output).toStrictEqual({
        items: expectedItems,
        total: 3,
        current_page: 1,
        per_page: 2,
        last_page: 2,
      });
    }
  });
}
