import api from "./client";
import type { Customer } from "@/types/customer";

export const customersApi = {
  list: () => api.get<Customer[]>("/customers").then(r => r.data),
  get: (id: string) => api.get<Customer>(`/customers/${id}`).then(r => r.data),
};
