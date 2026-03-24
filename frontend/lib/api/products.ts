import api from "./client";
import type { Product } from "@/types/product";

export const productsApi = {
  list: () => api.get<Product[]>("/products").then(r => r.data),
  get: (id: string) => api.get<Product>(`/products/${id}`).then(r => r.data),
};
