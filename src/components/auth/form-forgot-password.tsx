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
      <Card className="border-border bg-card/80 shadow-xl backdrop-blur-md transition-colors dark:bg-card/90">
        <CardHeader className="space-y-2 pt-8 text-center">
          <div className="mx-auto flex items-center justify-center">
            <Logo />
          </div>
          <CardTitle className="text-2xl font-black tracking-tighter text-foreground">
            Quên mật khẩu
          </CardTitle>
          <CardDescription className="font-medium text-muted-foreground">
            Nhập email để nhận mã OTP đặt lại mật khẩu
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
              transition={{ duration: 0.3, delay: 0.2 }}
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
                  "GỬI OTP"
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
