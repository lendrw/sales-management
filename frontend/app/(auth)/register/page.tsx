"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { usersApi } from "@/lib/api/users";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Minimum 6 characters"),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    try {
      await usersApi.register(data);
      await login(data.email, data.password);
    } catch {
      setError("root", { message: "Failed to create account. Email already in use?" });
    }
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Create account</h1>
        <p className="mt-1 text-sm text-slate-500">Get started for free</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label="Name" placeholder="John Doe" error={errors.name?.message} {...register("name")} />
        <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register("email")} />
        <Input label="Password" type="password" placeholder="••••••••" error={errors.password?.message} hint="Minimum 6 characters" {...register("password")} />

        {errors.root && (
          <p className="text-sm text-red-500 text-center bg-red-50 rounded-lg py-2 px-3">
            {errors.root.message}
          </p>
        )}

        <Button type="submit" loading={isSubmitting} className="w-full mt-1">
          Create account
        </Button>
      </form>

      <p className="mt-5 text-sm text-center text-slate-400">
        Already have an account?{" "}
        <Link href="/login" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
          Sign in
        </Link>
      </p>
    </>
  );
}
