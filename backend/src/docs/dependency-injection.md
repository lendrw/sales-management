## Dependency Injection

Now that we already have the first functionality available in the API, we will refactor the product creation process using the [tsyringe](https://github.com/microsoft/tsyringe) library.

`tsyringe` is a dependency injection library designed to be easy to use and integrate into TypeScript projects, providing an effective way to manage dependencies and make modular application development easier.

Main features:

- `Dependency Injection`: Allows dependencies to be injected into classes without manually instantiating them.
- `Decorators`: Uses decorators such as `@injectable`, `@inject`, and `@singleton` to mark classes and manage dependencies.
- `Dependency Container`: Provides a container that manages dependency instances.
- `Automatic Resolution`: Automatically resolves dependencies without requiring explicit configuration.


Install the library:

```shell
npm install tsyringe
```

There are a few ways to register a class in the container.


### registerSingleton

`Usage`: Registers a single instance of a class to be used throughout the application.

`Behavior`: The first time the dependency is resolved, a new instance is created, and then that same instance is reused for all subsequent resolutions.

`Best for`: Services or components that should have a single shared instance throughout the application, such as configuration services or state managers.


### registerInstance

`Usage`: Registers a specific instance of a class or object to be used as a dependency.

`Behavior`: The registered instance is used whenever the dependency is resolved.

`Best for`: When you already have an existing instance of a service or object and want to register it directly in the container.


### register

`Usage`: Allows registering a dependency with a custom configuration.

`Behavior`: Can be configured to register an instance, an instance factory, or a class, and can specify whether the instance should be a singleton. The default behavior does not guarantee a single instance (it is not a singleton).

`Best for`: Situations where you need more control over how the dependency is resolved.


### The container.resolve() method

The `container.resolve()` method is essential for using dependency injection with `tsyringe`, allowing you to easily and efficiently get registered class instances from the container while keeping your code modular and decoupled.


### Decorator @injectable()

`Purpose`: Marks a class as available for dependency injection.

`Usage`: Should be used on any class that you want to make injectable by the dependency injection container.


### @inject()

`Purpose`: Specifies that a dependency should be injected into a constructor parameter or property.

`Usage`: Should be used when you want to inject a specific dependency into a constructor parameter or property of a class.
