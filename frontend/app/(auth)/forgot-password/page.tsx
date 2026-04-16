"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { usersApi } from "@/lib/api/users";
import Link from "next/link";
import { CheckCircle, ArrowLeft } from "lucide-react";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";

const schema = z.object({ email: z.string().email("Invalid email") });
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    try {
      await usersApi.forgotPassword(data.email);
      setSent(true);
    } catch {
      setError("root", { message: "Failed to send email" });
    }
  }

  if (sent) {
    return (
      <div className="text-center flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
          <CheckCircle size={22} className="text-emerald-500" />
        </div>
        <div>
          <p className="font-semibold text-slate-900">Check your inbox</p>
          <p className="text-sm text-slate-500 mt-1">We sent you a link to reset your password.</p>
        </div>
        <Link href="/login" className="text-sm text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1">
          <ArrowLeft size={13} />
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Forgot password</h1>
        <p className="mt-1 text-sm text-slate-500">We'll send you a reset link.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register("email")} />

        {errors.root && (
          <p className="text-sm text-red-500 text-center bg-red-50 rounded-lg py-2 px-3">
            {errors.root.message}
          </p>
        )}

        <Button type="submit" loading={isSubmitting} className="w-full mt-1">
          Send reset link
        </Button>
      </form>

      <p className="mt-5 text-center">
        <Link href="/login" className="text-sm text-slate-500 hover:text-slate-700 flex items-center justify-center gap-1 transition-colors">
          <ArrowLeft size={13} />
          Back to sign in
        </Link>
      </p>
    </>
  );
}
