"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import Logo from "../layouts/main/logo";
import { isAxiosError } from "axios";

const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email không được để trống")
      .email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng nhập lại mật khẩu"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function FormRegister() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await authService.register({
        email: data.email,
        password: data.password,
      });

      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      router.replace("/login");
    } catch (err: unknown) {
      const errorCode = isAxiosError(err)
        ? (err.response?.data as { errorCode?: string } | undefined)?.errorCode
        : undefined;

      if (
        errorCode === "USER.ALREADY_EXISTS_BY_EMAIL" ||
        errorCode === "AUTH.EMAIL_ALREADY_EXISTS"
      ) {
        setError("email", {
          message: "Email này đã được sử dụng",
        });
        return;
      }

      if (errorCode === "NETWORK_ERROR") {
        toast.error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng.");
        return;
      }

      toast.error("Đã có lỗi xảy ra, vui lòng thử lại"
      );
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
          <div className="flex items-center justify-center">
            <Logo />
          </div>
          <CardTitle className="text-center text-2xl font-black tracking-tighter text-foreground">
            Đăng ký
          </CardTitle>
          <CardDescription className="font-medium text-muted-foreground">
            Nhập thông tin để tạo tài khoản mới và trải nghiệm
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
              className="space-y-1.5"
            >
              <Label
                htmlFor="password"
                className="text-xs font-bold text-foreground/80"
                >Mật khẩu</Label>
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
              className="space-y-1.5"
            >
              <Label
                htmlFor="confirmPassword"
                className="text-xs font-bold text-foreground/80"
              >
                Nhập lại mật khẩu
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
                  {showConfirmPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
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
              transition={{ duration: 0.3, delay: 0.4 }}
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
                  "ĐĂNG KÝ"
                )}
              </Button>
            </motion.div>
          </form>
        </CardContent>

        <CardFooter className="flex-col items-center gap-4 pt-2 pb-8">
          <p className="text-sm font-medium text-muted-foreground">
            Đã có tài khoản?{" "}
            <Link
              href="/login"
              className="font-bold text-primary underline-offset-4 hover:underline"
            >
              Đăng nhập ngay
            </Link>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
