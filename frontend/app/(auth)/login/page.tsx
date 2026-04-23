"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    try {
      await login(data.email, data.password);
    } catch {
      setError("root", { message: "Invalid credentials" });
    }
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500">Sign in to your account</p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        data-testid="login-form"
        noValidate
      >
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          data-testid="email-input"
          {...register("email")}
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          data-testid="password-input"
          {...register("password")}
        />

        {errors.root && (
          <p
            className="text-sm text-red-500 text-center bg-red-50 rounded-lg py-2 px-3"
            data-testid="error-message"
          >
            {errors.root.message}
          </p>
        )}

        <Button
          type="submit"
          loading={isSubmitting}
          className="w-full mt-1"
          data-testid="sign-in-button"
        >
          Sign in
        </Button>
      </form>

      <div className="mt-5 flex flex-col gap-2 text-center text-sm">
        <Link
          href="/forgot-password"
          className="text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          Forgot your password?
        </Link>
        <span className="text-slate-400">
          No account?{" "}
          <Link
            href="/register"
            className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
          >
            Create one
          </Link>
        </span>
      </div>
    </>
  );
}
