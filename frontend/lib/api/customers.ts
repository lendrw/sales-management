import { api } from "./client";
import type { Customer } from "@/types/customer";
import type { PaginatedResponse } from "@/types/pagination";

export const customersApi = {
  list: (params?: { page?: number; per_page?: number; filter?: string }, signal?: AbortSignal) =>
    api.get<PaginatedResponse<Customer>>("/customers", { params, signal }).then((r) => r.data),

  get: (id: string) => api.get<Customer>(`/customers/${id}`).then((r) => r.data),

  create: (data: { name: string; email: string }) =>
    api.post<Customer>("/customers", data).then((r) => r.data),
};
