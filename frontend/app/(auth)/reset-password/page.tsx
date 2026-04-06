"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { usersApi } from "@/lib/api/users";
import { useRouter, useSearchParams } from "next/navigation";

const schema = z.object({
  password: z.string().min(6, "Minimum 6 characters"),
});

type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    try {
      await usersApi.resetPassword({ token, password: data.password });
      router.push("/login");
    } catch {
      setError("root", { message: "Invalid or expired token" });
    }
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-6 text-center">New password</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">New password</label>
          <input {...register("password")} type="password" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>
        {errors.root && <p className="text-red-500 text-sm text-center">{errors.root.message}</p>}
        <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
          {isSubmitting ? "Saving..." : "Reset password"}
        </button>
      </form>
    </>
  );
}
