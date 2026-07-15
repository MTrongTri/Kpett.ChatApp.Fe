"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
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
import { useAuth } from "../providers/auth-provider";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Vui lòng không để trống email")
    .email("Email không hợp lệ"),
  password: z.string().min(1, "Mật khẩu không được để trống"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function FormLogin() {
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (dataLogin: LoginFormValues) => {
    try {
      const dataRes = await authService.login(dataLogin);

      if (!dataRes.user || !dataRes?.token) {
        toast.error('Dữ liệu phản hồi từ máy chủ không hợp lệ!');
        return;
      }

      const { user, token } = dataRes;

      login(token.accessToken, user, user.isProfileCompleted);

      if (user.isProfileCompleted) {
        toast.success('Đăng nhập thành công!');
        router.replace("/");
      } else {
        router.replace("/account-setup");
      }
    } catch (err) {
      const apiError = err as ApiResponse;
      const errorCode = apiError.errorCode;
      const errorMessage =
        apiError.message || 'Đã có lỗi xảy ra, vui lòng thử lại!';

      if (errorCode === 'AUTH.UNAUTHORIZED') {
        setError('email', { message: "Email hoặc mật khẩu không đúng" });
        setError('password', { message: "Email hoặc mật khẩu không đúng" });
      } else {
        toast.error(errorMessage);
      }
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
            Đăng nhập
          </CardTitle>
          <CardDescription className="font-medium text-muted-foreground">
            Nhập thông tin để tiếp tục trải nghiệm
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
                Tài khoản
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
              className="space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  title="Mật khẩu"
                  className="text-xs font-bold text-foreground/80"
                >
                  Mật khẩu
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  className={`h-11 pr-10 ${errors.password ? "border-destructive" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs font-medium text-destructive">
                  {errors.password.message}
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
                "ĐĂNG NHẬP"
              )}
            </Button>
            </motion.div>
          </form>
        </CardContent>

        <CardFooter className="flex-col items-center gap-4 pt-2 pb-8">
          <p className="text-sm font-medium text-muted-foreground">
            Chưa có tài khoản?{" "}
            <Link
              href="/register"
              className="font-bold text-primary underline-offset-4 hover:underline"
            >
              Đăng ký ngay
            </Link>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
