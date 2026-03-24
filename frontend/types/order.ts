export type OrderProduct = {
  product_id: string;
  price: number;
  quantity: number;
};

export type Order = {
  id: string;
  customer_id: string;
  products: OrderProduct[];
  created_at: string;
};
