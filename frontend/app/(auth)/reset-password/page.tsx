"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { usersApi } from "@/lib/api/users";
import { useRouter, useSearchParams } from "next/navigation";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";

const schema = z.object({ password: z.string().min(6, "Minimum 6 characters") });
type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

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
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">New password</h1>
        <p className="mt-1 text-sm text-slate-500">Choose a strong password.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" data-testid="reset-password-form">
        <Input
          label="New password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          hint="Minimum 6 characters"
          data-testid="password-input"
          {...register("password")}
        />

        {errors.root && (
          <p className="text-sm text-red-500 text-center bg-red-50 rounded-lg py-2 px-3" data-testid="error-message">
            {errors.root.message}
          </p>
        )}

        <Button type="submit" loading={isSubmitting} className="w-full mt-1" data-testid="reset-password-button">
          Reset password
        </Button>
      </form>
    </>
  );
}
