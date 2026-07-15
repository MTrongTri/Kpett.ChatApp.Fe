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
      <Card className="border-border bg-card/80 shadow-xl backdrop-blur-md transition-colors dark:bg-card/90">
        <CardHeader className="space-y-2 pt-8 text-center">
          <div className="mx-auto flex items-center justify-center">
            <Logo />
          </div>
          <CardTitle className="text-2xl font-black tracking-tighter text-foreground">
            Đặt lại mật khẩu
          </CardTitle>
          <CardDescription className="font-medium text-muted-foreground">
            Nhập mã OTP và mật khẩu mới
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="space-y-1.5"
            >
              <Label
                htmlFor="email"
                className="text-xs font-bold text-foreground/80"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                {...register("email")}
                className={`h-11 ${errors.email ? "border-destructive" : ""}`}
              />
              {errors.email && (
                <p className="text-xs font-medium text-destructive">
                  {errors.email.message}
                </p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="space-y-1.5"
            >
              <Label
                htmlFor="otp"
                className="text-xs font-bold text-foreground/80"
              >
                Mã OTP
              </Label>
              <Input
                id="otp"
                type="text"
                placeholder="123456"
                maxLength={6}
                {...register("otp")}
                className={`h-11 ${errors.otp ? "border-destructive" : ""}`}
              />
              {errors.otp && (
                <p className="text-xs font-medium text-destructive">
                  {errors.otp.message}
                </p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="space-y-1.5"
            >
              <Label
                htmlFor="newPassword"
                className="text-xs font-bold text-foreground/80"
              >
                Mật khẩu mới
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("newPassword")}
                  className={`h-11 pr-10 ${errors.newPassword ? "border-destructive" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-xs font-medium text-destructive">
                  {errors.newPassword.message}
                </p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.25 }}
              className="space-y-1.5"
            >
              <Label
                htmlFor="confirmPassword"
                className="text-xs font-bold text-foreground/80"
              >
                Xác nhận mật khẩu
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("confirmPassword")}
                  className={`h-11 pr-10 ${errors.confirmPassword ? "border-destructive" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs font-medium text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Button
                type="submit"
                disabled={isSubmitting}
                size="lg"
                className="mt-2 w-full font-bold tracking-widest active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "ĐẶT LẠI MẬT KHẨU"
                )}
              </Button>
            </motion.div>
          </form>
        </CardContent>

        <CardFooter className="flex-col items-center gap-4 pt-2 pb-8">
          <p className="text-sm font-medium text-muted-foreground">
            Đã nhớ mật khẩu?{" "}
            <Link
              href="/login"
              className="font-bold text-primary underline-offset-4 hover:underline"
            >
              Đăng nhập
            </Link>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
