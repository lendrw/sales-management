"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { usersApi } from "@/lib/api/users";
import Link from "next/link";
import { useState } from "react";

const schema = z.object({
  email: z.string().email("Invalid email"),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

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
      <div className="text-center">
        <p className="text-green-600 font-medium mb-4">Email sent! Check your inbox.</p>
        <Link href="/login" className="text-blue-600 hover:underline text-sm">Back to sign in</Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-2 text-center">Forgot password</h1>
      <p className="text-sm text-gray-500 text-center mb-6">We will send you a link to reset your password.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input {...register("email")} type="email" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>
        {errors.root && <p className="text-red-500 text-sm text-center">{errors.root.message}</p>}
        <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
          {isSubmitting ? "Sending..." : "Send link"}
        </button>
      </form>
      <p className="mt-4 text-sm text-center">
        <Link href="/login" className="text-blue-600 hover:underline">Back to sign in</Link>
      </p>
    </>
  );
}
