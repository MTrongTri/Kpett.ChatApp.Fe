"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import authService from "@/services/auth.service";
import { ApiResponse } from "@/types/common/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "../layouts/main/logo";

const resetPasswordSchema = z
  .object({
    email: z
      .string()
      .min(1, "Vui lòng không để trống email")
      .email("Email không hợp lệ"),
    otp: z
      .string()
      .min(1, "Vui lòng nhập mã OTP")
      .length(6, "Mã OTP phải gồm 6 ký tự"),
    newPassword: z
      .string()
      .min(1, "Mật khẩu không được để trống")
      .min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
    confirmPassword: z
      .string()
      .min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function FormResetPassword() {
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get("email") || "";
  const router = useRouter();

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: emailFromQuery,
    },
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    try {
      await authService.resetPassword({
        email: data.email,
        otp: data.otp,
        newPassword: data.newPassword,
      });
      toast.success("Đặt lại mật khẩu thành công!");
      router.push("/login");
    } catch (err) {
      const apiError = err as ApiResponse;
      const errorMessage =
        apiError.message || "Đã có lỗi xảy ra, vui lòng thử lại!";
      toast.error(errorMessage);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="z-10 w-full max-w-md"
    >
      <Card className="border-zinc-200 bg-white/80 shadow-2xl shadow-zinc-200/50 backdrop-blur-md transition-colors dark:border-zinc-800 dark:bg-zinc-900/90 dark:shadow-black/50">
        <CardHeader className="space-y-2 pt-8 text-center">
          <div className="mx-auto flex items-center justify-center">
            <Logo />
          </div>
          <CardTitle className="text-2xl font-black tracking-tighter text-zinc-950 dark:text-zinc-50">
            Đặt lại mật khẩu
          </CardTitle>
          <CardDescription className="font-medium text-zinc-500 dark:text-zinc-400">
            Nhập mã OTP và mật khẩu mới
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-xs font-bold text-zinc-700 dark:text-zinc-300"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                {...register("email")}
                className={`h-11 rounded-md border-zinc-200 bg-transparent text-zinc-900 transition-all placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-0 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-50 ${errors.email ? "border-red-500 dark:border-red-500" : ""
                  }`}
              />
              {errors.email && (
                <p className="text-[10px] font-bold text-red-500 dark:text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="otp"
                className="text-xs font-bold text-zinc-700 dark:text-zinc-300"
              >
                Mã OTP
              </Label>
              <Input
                id="otp"
                type="text"
                placeholder="123456"
                maxLength={6}
                {...register("otp")}
                className={`h-11 rounded-md border-zinc-200 bg-transparent text-zinc-900 transition-all placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-0 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-50 ${errors.otp ? "border-red-500 dark:border-red-500" : ""
                  }`}
              />
              {errors.otp && (
                <p className="text-[10px] font-bold text-red-500 dark:text-red-400">
                  {errors.otp.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="newPassword"
                className="text-xs font-bold text-zinc-700 dark:text-zinc-300"
              >
                Mật khẩu mới
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("newPassword")}
                  className={`h-11 rounded-md border-zinc-200 bg-transparent pr-10 text-zinc-900 transition-all placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-0 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-50 ${errors.newPassword ? "border-red-500 dark:border-red-500" : ""
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-950 dark:hover:text-zinc-50"
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-[10px] font-bold text-red-500 dark:text-red-400">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="confirmPassword"
                className="text-xs font-bold text-zinc-700 dark:text-zinc-300"
              >
                Xác nhận mật khẩu
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("confirmPassword")}
                  className={`h-11 rounded-md border-zinc-200 bg-transparent pr-10 text-zinc-900 transition-all placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-0 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-50 ${errors.confirmPassword ? "border-red-500 dark:border-red-500" : ""
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-950 dark:hover:text-zinc-50"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-[10px] font-bold text-red-500 dark:text-red-400">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 h-12 w-full cursor-pointer rounded-md bg-zinc-950 text-xs font-bold tracking-widest text-white transition-all hover:bg-zinc-800 active:scale-[0.99] dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "ĐẶT LẠI MẬT KHẨU"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col items-center gap-4 pt-2 pb-8">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Đã nhớ mật khẩu?{" "}
            <Link
              href="/login"
              className="cursor-pointer font-black text-zinc-950 underline-offset-4 hover:underline dark:text-zinc-50"
            >
              Đăng nhập
            </Link>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
