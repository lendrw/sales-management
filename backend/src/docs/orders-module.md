## Orders Module

In this section, we will implement the features related to purchase orders.

Through this module, we will explore more TypeORM features, especially many-to-many relationship functionality between tables.

### Requirements for creating a Purchase Order

Validations that must be implemented while creating a purchase order in the application:

1. Do not allow a purchase order to be created with a customer that does not exist in the application.
2. Do not allow a purchase order to be created with a product that does not exist in the application.
3. Do not allow a purchase order to be created with a product that does not have enough stock quantity.
4. When creating a new order, update the stock quantity of each product.

### Purchase Orders Module

Tables involved in this module:

**- `orders`** - purchase orders table.

**- `customers`** - customers table.

**- `products`** - products table.

**- `orders_products`** - **pivot** table used to store data for the `ManyToMany` relationship between `products` and `orders`, where several products can be included in several purchase orders.

To create a new purchase order in the `orders` table, the data sent in the request body must include: the `customer_id` and a `products` array containing the `id` and `quantity` for each product. Example:

```json
{
  "customer_id": "b5694f2a-4048-63ae-bd42-593860adf6e9",
  "products": [
    {
      "id": "e39595ae-63ae-4048-9a8a-593860adf6e9",
      "quantity": 1
    },
    {
      "id": "b5694f2a-3f31-40c6-803d-593860adf6e9",
      "quantity": 3
    }
  ]
}
```

### Handling request data (POST /orders)

Implement a `ManyToMany` relationship between products and orders, allowing a product to be included in more than one order and allowing an order to contain more than one product.

With this, you must always store the product price and requested quantity at the time of purchase in the `orders_products` pivot table.

This `orders_products` table must have the fields: `id`, `order_id`, `product_id`, `quantity`, `price`, `created_at`, and `updated_at`.

With the received data, we must create a new order in the `orders` table, related to the customer provided in `customer_id`, along with the `created_at` and `updated_at` fields. The data from the products array must be inserted into the `orders_products` table: `product_id`, `order_id`, `price`, `quantity`, `created_at`, and `updated_at`.

> TypeORM GitHub: [Relationships](https://github.com/typeorm/typeorm/blob/master/docs/relations.md)

### Returning Order data (GET /orders/:id)

We will need to return the information for a specific order, including all data that can be retrieved through the relationships between the `orders`, `customers`, and `orders_products` tables. Example:

```json
{
  "id": "b5694f2a-4048-63ae-bd42-593860adf6e9",
  "created_at": "2023-11-28T07:19:12.430Z",
  "updated_at": "2023-11-28T07:19:12.431Z",
  "customer": {
    "id": "c3264f2a-4048-63ae-bd42-593860adf6e9",
    "name": "Leandro Freire",
    "email": "leandrocabral321@gmail.com",
    "created_at": "2025-11-28T07:19:12.430Z",
    "updated_at": "2025-11-28T07:19:12.431Z",
  },
  "order_products": [
    {
      "product_id": "e39595ae-63ae-4048-9a8a-593860adf6e9",
      "price": "400.00",
      "quantity": 1,
      "order_id": "b5694f2a-4048-63ae-bd42-593860adf6e9",
      "id": "e1694f2a-63ae-4048-9a8a-593860adf6e9",
      "created_at": "2025-11-28T07:19:12.430Z",
      "updated_at": "2025-11-28T07:19:12.431Z",
    },
    {
      "product_id": "b5694f2a-3f31-40c6-803d-593860adf6e9",
      "price": "200.00",
      "quantity": 3,
      "order_id": "b5694f2a-4048-63ae-bd42-593860adf6e9",
      "id": "c4694f2a-63ae-4048-9a8a-593860adf6e9",
      "created_at": "2025-11-28T07:19:12.430Z",
      "updated_at": "2025-11-28T07:19:12.431Z",
    }
  ]
}
```

TypeORM provides a practical way to fetch data related to the resource we are querying in the database by using the **relations** option in find methods. You will need to provide the related table name to retrieve the data. Example:

```js
userRepository.find({
  relations: {
    profile: true,
    photos: true,
    videos: {
      videoAttributes: true,
    },
  },
})
```

> TypeORM GitHub: [options for finding data in the database.](https://github.com/typeorm/typeorm/blob/master/docs/find-options.md).
