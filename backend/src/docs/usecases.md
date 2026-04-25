## What are Use Cases?

Use cases are the services in our application responsible for operating entities and repositories in order to meet specific business rules.

In the book "Clean Architecture", the author defines entities as the crucial business rules, but there are other rules to be implemented, which are application rules.

Crucial rules are the purest ones, which do not suffer interference from anything external, such as libraries or frameworks.

Application rules, on the other hand, will usually use other libraries to provide the expected functionality. For example, to "save a product", we will use an ORM to store the data in the database.

Use cases will be responsible for resolving these application rules.

Through use cases, we can see the reason the software exists. They expose each need to be met and can be seen as a usage manual for the software.

All external resources (HTTP, messaging, email, database, etc.) interact with our application through use cases.

The idea is to create use cases in the `application` layer precisely because this structure is responsible for handling application rules.

> Some developers prefer to create use cases in the domain layer.


## Configuring product services

We will create each use case following SOLID's `Single Responsibility` principle, which means creating classes with only one responsibility.

Another important point when implementing a use case is defining which data must be received for processing to happen. We must consider the same thing for returning the created information. We should convert the created entity into a specific structure to be sent as response data.

### Implementing use cases for products

*Requirements that must be met:*

- The product name is required.
- The product price is required.
- The product quantity is required.
- A product cannot be created with the same name as another product.

To persist the data, we will need a repository. Since we must consider any type of data structure being used for this operation (memory, MySQL, MongoDB, etc.), we will use the constructor method to inject the repository as a dependency of our use case class.

## Configuring user services

### Implementing use cases for users

*Requirements that must be met:*

- The name is required.
- The email is required.
- A user cannot be created with the same email as another user.
- The password is required.
- The password must be stored encrypted.
- The avatar field is optional and will be filled through a specific update route.
