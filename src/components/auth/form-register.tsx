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
      <Card className="border-zinc-200 bg-white/80 shadow-2xl shadow-zinc-200/50 backdrop-blur-md transition-colors dark:border-zinc-800 dark:bg-zinc-900/90 dark:shadow-black/50">
        <CardHeader className="space-y-2 pt-8 text-center">
          <div className="flex items-center justify-center">
            <Logo />
          </div>
          <CardTitle className="text-center text-2xl font-black tracking-tighter text-zinc-950 dark:text-zinc-50">
            Đăng ký
          </CardTitle>
          <CardDescription className="font-medium text-zinc-500 dark:text-zinc-400">
            Nhập thông tin để tạo tài khoản mới và trải nghiệm
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
                className={`h-11 rounded-md border-zinc-200 bg-transparent text-zinc-900 transition-all placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-0 focus-visible:ring-0 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-primary/60 ${errors.email ? "border-red-500 dark:border-red-500" : ""
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
                htmlFor="password"
                className="text-xs font-bold text-zinc-700 dark:text-zinc-300"
              >
                Mật khẩu
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  className={`h-11 rounded-md border-zinc-200 bg-transparent pr-10 text-zinc-900 transition-all placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-0 focus-visible:ring-0 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-primary/60 ${errors.password ? "border-red-500 dark:border-red-500" : ""
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-950 dark:hover:text-zinc-50"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[10px] font-bold text-red-500 dark:text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="confirmPassword"
                className="text-xs font-bold text-zinc-700 dark:text-zinc-300"
              >
                Nhập lại mật khẩu
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("confirmPassword")}
                  className={`h-11 rounded-md border-zinc-200 bg-transparent pr-10 text-zinc-900 transition-all placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-0 focus-visible:ring-0 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-primary/60 ${errors.confirmPassword
                    ? "border-red-500 dark:border-red-500"
                    : ""
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-950 dark:hover:text-zinc-50"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
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
                "ĐĂNG KÝ"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col items-center gap-4 pt-2 pb-8">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Đã có tài khoản?{" "}
            <Link
              href="/login"
              className="cursor-pointer font-black text-zinc-950 underline-offset-4 dark:text-zinc-50"
            >
              Đăng nhập ngay
            </Link>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
