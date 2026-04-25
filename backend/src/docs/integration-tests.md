## Integration Tests

Definition taken from [Wikipedia](https://en.wikipedia.org/wiki/Integration_testing).

**Integration testing** is the software testing phase in which modules are combined and tested as a group. It comes after unit testing, where modules are tested individually, and before system testing, where the complete integrated system is tested in an environment that simulates production.

Tasks we need to execute:

1. Create a Jest configuration file specifically for integration tests.
2. Customize the script to run integration tests.
3. Create a specific database for running the tests. We will do this directly in the `package.json` scripts.
4. Create the TypeORM connection specifically for tests.


### Executing each step

1. Configuration file.

File `jest.int.config.ts`:

```js
import { pathsToModuleNameMapper } from 'ts-jest'
import { compilerOptions } from './tsconfig.json'

export default {
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/',
  }),
  testRegex: '.*\\.int-spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
}
```

2. Create the script to run integration tests.

> This integration test script will need to execute the `docker` command to start the test database.

File `package.json`:

```json
"scripts": {
  "pretest:int": "docker run --name testsdb -e POSTGRES_PASSWORD=postgres -p 5433:5432 -d postgres",
  "test:int": "npx dotenv-cli -e .env.test -- jest --runInBand --config ./jest.int.config.ts",
  "posttest:int": "docker stop testsdb && docker rm testsdb"
}
```

3. Create the TypeORM connection specifically for tests.


File `src/common/infrastrcture/typeorm/testing/data-source.ts`:

```js
import { DataSource } from 'typeorm'
import { env } from '@/common/infrastructure/env'

export const testDataSource = new DataSource({
  type: env.DB_TYPE,
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USER,
  password: env.DB_PASS,
  database: env.DB_NAME,
  schema: env.DB_SCHEMA,
  entities: ['**/entities/**/*.ts'],
  migrations: ['**/migrations/**/*.ts'],
  synchronize: true,
  logging: true,
})
```

> IMPORTANT: adjust the connection port for the test database to 5433 in the `.env.test` file.

File `.env.test`:

```shell
PORT=3333
NODE_ENV=test

DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5433
DB_SCHEMA=public
DB_NAME=postgres
DB_USER=postgres
DB_PASS=postgres
```
