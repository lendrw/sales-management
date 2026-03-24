import api from "./client";
import type { Order } from "@/types/order";

export const ordersApi = {
  list: () => api.get<Order[]>("/orders").then(r => r.data),
  get: (id: string) => api.get<Order>(`/orders/${id}`).then(r => r.data),
};
