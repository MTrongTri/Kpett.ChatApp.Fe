"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
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

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Vui lòng không để trống email")
    .email("Email không hợp lệ"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function FormForgotPassword() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      await authService.forgotPassword(data);
      toast.success("Mã OTP đã được gửi đến email của bạn!");
      router.push(`/reset-password?email=${encodeURIComponent(data.email)}`);
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
            Quên mật khẩu
          </CardTitle>
          <CardDescription className="font-medium text-zinc-500 dark:text-zinc-400">
            Nhập email để nhận mã OTP đặt lại mật khẩu
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

            <Button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 h-12 w-full cursor-pointer rounded-md bg-zinc-950 text-xs font-bold tracking-widest text-white transition-all hover:bg-zinc-800 active:scale-[0.99] dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "GỬI OTP"
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
