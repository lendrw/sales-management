import "reflect-metadata";
import "dotenv/config";
import { DataSource } from "typeorm";
import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";
import { env } from "../env";

// ── entities (inline to avoid tsyringe decorator issues outside DI context) ──
import { User } from "@/users/infrastructure/typeorm/entities/users.entity";
import { Product } from "@/products/infrastructure/typeorm/entities/products.entity";
import { Customer } from "@/customers/infrastructure/typeorm/entities/customers.entity";
import { Order } from "@/orders/infrastructure/typeorm/entities/orders.entity";
import { OrderProduct } from "@/orders/infrastructure/typeorm/entities/orders-products.entity";

const dataSource = new DataSource({
  type: env.DB_TYPE,
  host: env.DB_HOST,
  port: env.DB_PORT,
  schema: env.DB_SCHEMA,
  database: env.DB_NAME,
  username: env.DB_USER,
  password: env.DB_PASS,
  entities: [User, Product, Customer, Order, OrderProduct],
  synchronize: false,
  logging: false,
});

async function seed() {
  const force = process.argv.includes("--force");
  await dataSource.initialize();
  console.log("🌱 Connected to database");

  const userRepo = dataSource.getRepository(User);
  const productRepo = dataSource.getRepository(Product);
  const customerRepo = dataSource.getRepository(Customer);
  const orderRepo = dataSource.getRepository(Order);

  if (force) {
    console.log("⚠️  --force: clearing existing data...");
    await orderRepo.query("TRUNCATE orders_products, orders, customers, products RESTART IDENTITY CASCADE");
    await userRepo.delete({ email: "admin@apivendas.com" });
  }

  // ── Admin user ────────────────────────────────────────────────────────────
  const existingAdmin = await userRepo.findOneBy({ email: "admin@apivendas.com" });
  if (!existingAdmin) {
    const admin = userRepo.create({
      name: "Admin",
      email: "admin@apivendas.com",
      password: await bcrypt.hash("123456", 8),
    });
    await userRepo.save(admin);
    console.log("👤 Admin user created  →  admin@apivendas.com / 123456");
  } else {
    console.log("👤 Admin user already exists, skipping");
  }

  // ── Products ──────────────────────────────────────────────────────────────
  const productCount = await productRepo.count();
  let products: Product[] = [];

  if (productCount === 0) {
    const productData = Array.from({ length: 20 }, () =>
      productRepo.create({
        name: faker.commerce.productName(),
        price: parseFloat(faker.commerce.price({ min: 5, max: 500 })),
        quantity: faker.number.int({ min: 0, max: 200 }),
      })
    );
    products = await productRepo.save(productData);
    console.log(`📦 ${products.length} products created`);
  } else {
    products = await productRepo.find();
    console.log(`📦 Products already exist (${productCount}), skipping`);
  }

  // ── Customers ─────────────────────────────────────────────────────────────
  const customerCount = await customerRepo.count();
  let customers: Customer[] = [];

  if (customerCount === 0) {
    const customerData = Array.from({ length: 10 }, () =>
      customerRepo.create({
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
      })
    );
    customers = await customerRepo.save(customerData);
    console.log(`🧑 ${customers.length} customers created`);
  } else {
    customers = await customerRepo.find();
    console.log(`🧑 Customers already exist (${customerCount}), skipping`);
  }

  // ── Orders ────────────────────────────────────────────────────────────────
  const orderCount = await orderRepo.count();

  if (orderCount === 0) {
    const orders: Order[] = [];

    for (let i = 0; i < 15; i++) {
      const customer = faker.helpers.arrayElement(customers);

      // Pick 1–4 distinct random products
      const picked = faker.helpers.arrayElements(products, { min: 1, max: 4 });

      const orderProducts: OrderProduct[] = picked.map((product) => {
        const op = new OrderProduct();
        op.product_id = product.id;
        op.price = product.price;
        op.quantity = faker.number.int({ min: 1, max: 5 });
        return op;
      });

      const order = orderRepo.create({
        customer_id: customer.id,
        order_products: orderProducts,
      });

      orders.push(order);
    }

    await orderRepo.save(orders);
    console.log(`🛒 ${orders.length} orders created`);
  } else {
    console.log(`🛒 Orders already exist (${orderCount}), skipping`);
  }

  await dataSource.destroy();
  console.log("✅ Seed complete");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
