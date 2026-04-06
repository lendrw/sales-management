import { api } from "./client";
import type { Order } from "@/types/order";

export const ordersApi = {
  get: (id: string) => api.get<Order>(`/orders/${id}`).then((r) => r.data),

  create: (data: { customer_id: string; products: { id: string; quantity: number }[] }) =>
    api.post<Order>("/orders", data).then((r) => r.data),
};
