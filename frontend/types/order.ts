export type OrderProduct = {
  id: string;
  order_id: string;
  product_id: string;
  price: number;
  quantity: number;
  created_at: string;
  updated_at: string;
};

export type Order = {
  id: string;
  customer_id: string;
  order_products: OrderProduct[];
  created_at: string;
  updated_at: string;
};
