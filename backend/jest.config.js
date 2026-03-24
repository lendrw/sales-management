/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs')
const { pathsToModuleNameMapper } = require('ts-jest')

const tsconfig = JSON.parse(fs.readFileSync('./tsconfig.json', 'utf-8'))

module.exports = {
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: pathsToModuleNameMapper(tsconfig.compilerOptions.paths, {
    prefix: '<rootDir>/',
  }),
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  testEnvironment: 'node',
  transformIgnorePatterns: [
    'node_modules/(?!(@faker-js/faker)/)',
  ],
}
