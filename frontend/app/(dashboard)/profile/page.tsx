"use client";

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera } from "lucide-react";
import { usersApi } from "@/lib/api/users";
import { useAuth } from "@/contexts/auth-context";
import PageHeader from "@/components/ui/page-header";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

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
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (user) reset({ name: user.name, email: user.email });
  }, [user, reset]);

  async function onSubmit(data: FormData) {
    try {
      await usersApi.updateProfile(data);
      toast("Profile updated successfully");
    } catch {
      toast("Failed to update profile", "error");
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const formData = new FormData();
    formData.append("user_id", user.id);
    formData.append("file", file);
    try {
      await usersApi.updateAvatar(formData);
      toast("Avatar updated");
    } catch {
      toast("Failed to update avatar", "error");
    }
  }

  const initials = user?.name?.charAt(0).toUpperCase() ?? "U";

  return (
    <>
      <PageHeader title="Profile" description="Manage your account settings" />

      <div className="max-w-lg">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Avatar section */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-4">
            <div className="relative group">
              <div
                onClick={() => fileRef.current?.click()}
                className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-xl cursor-pointer overflow-hidden"
              >
                {user?.avatar ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_R2_URL}/${user.avatar}`}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors"
              >
                <Camera size={11} />
              </button>
            </div>
            <div>
              <p className="font-medium text-slate-900">{user?.name}</p>
              <p className="text-sm text-slate-500">{user?.email}</p>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Name" error={errors.name?.message} {...register("name")} />
              <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
            </div>

            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Change password</p>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Current password"
                  type="password"
                  placeholder="••••••••"
                  error={errors.old_password?.message}
                  {...register("old_password")}
                />
                <Input
                  label="New password"
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <Button type="submit" loading={isSubmitting}>
                Save changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
