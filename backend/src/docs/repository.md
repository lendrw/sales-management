## Interface for Repositories

A Repository is responsible for saving, fetching, updating, and deleting data in a data structure, which may be a DBMS, file, memory, etc.

> IMPORTANT: a repository must NOT contain business rules. Business rules should stay in entities and/or use cases.

Another important point to highlight is that a Repository will need to access external resources, which are located in the outer layers, to access the data structure.

Because of this, we will need to create "contracts" through interfaces to isolate these external resources from the application's domain layer.

In other words, the domain layer will contain the interfaces that define everything we need to manipulate through a repository.

In this lesson, we will create the abstraction with the contract definitions to be followed by each repository implementation in our API.

It is important to remember that this interface should represent any type of model to be manipulated.
