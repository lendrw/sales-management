## Class transformer

In this module, we will install and configure the `Class Transformer` library in our API.

[Class Transformer](https://github.com/typestack/class-transformer) is a JavaScript library that makes it easier to convert between TypeScript/JavaScript classes and plain objects. It is often used together with frameworks such as NestJS to simplify data serialization and deserialization.

Among other things, Class Transformer will allow us to modify how information from our Entities is returned, including hiding attributes that we do not want to include in responses.

Main features and benefits:

- `Serialization and deserialization`: Makes it easier to transform class objects into formats such as JSON and vice versa. This is especially useful when dealing with REST APIs, where data is usually transmitted as JSON.
- `Property mapping`: Allows class properties to be mapped to different names or formats in plain objects, using decorators such as @Expose, @Type, and @Transform.
- `Validation`: Can be integrated with validation libraries such as class-validator to ensure data integrity during transformation.
- `Code simplification`: Reduces the amount of boilerplate code needed to manually convert objects, making the code cleaner and more readable.

Usage example:

```ts
import { plainToClass, classToPlain } from 'class-transformer';

class User {
  id: number;
  firstName: string;
  lastName: string;
}

const userPlainObject = { id: 1, firstName: 'John', lastName: 'Doe' };
const userClassObject = plainToClass(User, userPlainObject); // Converts to a class object
const plainObjectAgain = classToPlain(userClassObject); // Converts back to a plain object
```
