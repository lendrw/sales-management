import { api } from "./client";
import type { Product } from "@/types/product";
import type { PaginatedResponse } from "@/types/pagination";

export const productsApi = {
  list: (params?: { page?: number; per_page?: number; filter?: string; sort?: string; sort_dir?: string }) =>
    api.get<PaginatedResponse<Product>>("/products", { params }).then((r) => r.data),

  get: (id: string) => api.get<Product>(`/products/${id}`).then((r) => r.data),

  create: (data: { name: string; price: number; quantity: number }) =>
    api.post<Product>("/products", data).then((r) => r.data),

  update: (id: string, data: { name: string; price: number; quantity: number }) =>
    api.put<Product>(`/products/${id}`, data).then((r) => r.data),

  remove: (id: string) => api.delete(`/products/${id}`),
};
