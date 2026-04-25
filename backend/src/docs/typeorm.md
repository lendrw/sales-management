## Configuring TypeORM

[TypeORM](https://typeorm.io/) is the tool we will use to create the mapping between the API database structure and classes that describe the entities.

An ORM tool allows us to relate records from database tables to an instance of a TypeScript class, an object.

In practice, we will create Entities that represent table data and Repositories so we can manipulate database data: insert, update, remove, etc. All of this will be done through TypeORM.

The Entity defines the data structure. To perform data manipulation operations, we use the Repository pattern, for which TypeORM already implements the main methods, such as `create`, `save`, `find`, `findOne`, `remove`, etc.

Another advantage of using TypeORM is the CLI, which is available to automate several tasks, such as creating migrations.

In our project, we will use a Postgres database running in a Docker container.

Installing TypeORM and Postgres in the project:

```shell
npm install typeorm pg
```

TypeORM provides a CLI tool that allows us to create migration files to define the database structure, along with several other features.

By default, the TypeORM CLI works only with JavaScript files. As an alternative, we can use the `ts-node-dev` package together with TypeORM to run TypeScript files directly through the executable. Example:

We will configure a script in the `package.json` file that will be used to run the TypeORM CLI:

```json
"scripts": {
	"typeorm": "ts-node-dev -r tsconfig-paths/register ./node_modules/typeorm/cli.js"
}
```

To verify that this script works, run:

```shell
npm run typeorm
```
