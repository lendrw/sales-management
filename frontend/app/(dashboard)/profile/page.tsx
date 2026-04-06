"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { usersApi } from "@/lib/api/users";
import { useAuth } from "@/contexts/auth-context";
import PageHeader from "@/components/ui/page-header";

const schema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    old_password: z.string().optional(),
    password: z.string().optional(),
  })
  .refine((d) => !(d.password && !d.old_password), {
    message: "Current password is required",
    path: ["old_password"],
  });

type FormData = z.infer<typeof schema>;

export default function ProfilePage() {
  const { user } = useAuth();
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (user) reset({ name: user.name, email: user.email });
  }, [user, reset]);

  async function onSubmit(data: FormData) {
    await usersApi.updateProfile(data);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const formData = new FormData();
    formData.append("user_id", user.id);
    formData.append("file", file);
    await usersApi.updateAvatar(formData);
  }

  return (
    <>
      <PageHeader title="Profile" />
      <div className="max-w-lg bg-white rounded-xl border p-6">
        <div className="flex items-center gap-4 mb-6">
          <div
            onClick={() => fileRef.current?.click()}
            className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl cursor-pointer hover:opacity-80"
          >
            {user?.avatar ? (
              <img src={`${process.env.NEXT_PUBLIC_R2_URL}/${user.avatar}`} alt="avatar" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              user?.name?.[0]?.toUpperCase()
            )}
          </div>
          <div>
            <p className="font-medium">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <button onClick={() => fileRef.current?.click()} className="text-xs text-blue-600 hover:underline mt-1">
              Change photo
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input {...register("name")} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input {...register("email")} type="email" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <hr />
          <div>
            <label className="block text-sm font-medium mb-1">Current password</label>
            <input {...register("old_password")} type="password" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {errors.old_password && <p className="text-red-500 text-xs mt-1">{errors.old_password.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">New password</label>
            <input {...register("password")} type="password" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          {success && <p className="text-green-600 text-sm">Profile updated successfully!</p>}
          <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {isSubmitting ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>
    </>
  );
}
