import { api } from "./client";
import type { User } from "@/types/user";
import type { PaginatedResponse } from "@/types/pagination";

export const usersApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post<User>("/users", data).then((r) => r.data),

  login: (data: { email: string; password: string }) =>
    api.post<{ access_token: string }>("/auth/login", data).then((r) => r.data),

  getProfile: () => api.get<User>("/users/profile").then((r) => r.data),

  updateProfile: (data: {
    name: string;
    email: string;
    password?: string;
    old_password?: string;
  }) => api.put<User>("/users/profile", data).then((r) => r.data),

  updateAvatar: (formData: FormData) =>
    api.patch<User>("/users/avatar", formData).then((r) => r.data),

  list: (params?: { page?: number; per_page?: number; filter?: string }) =>
    api.get<PaginatedResponse<User>>("/users", { params }).then((r) => r.data),

  forgotPassword: (email: string) =>
    api.post("/password/forgot", { email }),

  resetPassword: (data: { token: string; password: string }) =>
    api.post("/password/reset", data),
};
