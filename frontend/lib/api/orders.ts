import { api } from "./client";
import type { Order } from "@/types/order";
import type { PaginatedResponse } from "@/types/pagination";

export const ordersApi = {
  list: (params?: { page?: number; per_page?: number }, signal?: AbortSignal) =>
    api.get<PaginatedResponse<Order>>("/orders", { params, signal }).then((r) => r.data),

  get: (id: string) => api.get<Order>(`/orders/${id}`).then((r) => r.data),

  create: (data: { customer_id: string; products: { id: string; quantity: number }[] }) =>
    api.post<Order>("/orders", data).then((r) => r.data),
};
