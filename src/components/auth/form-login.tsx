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
import Logo from "../layouts/main/logo";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/store/features/auth-slice";
import { useRouter } from "next/navigation";
import { useSignalR } from "../providers/signalr-provider";
import { sessionStorage } from "@/lib/cookie-storage-utils";
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

  // app/(auth)/login/page.tsx
  const onSubmit = async (dataLogin: LoginFormValues) => {
    try {
      const loginRes = await authService.login(dataLogin);
      const dataRes = loginRes.data;

      if (!dataRes?.user || !dataRes?.token) {
        toast.error('Dữ liệu phản hồi từ máy chủ không hợp lệ!');
        return;
      }

      const { user, token } = dataRes;

      login(token.accessToken, user, user.isProfileCompleted);

      if (user.isProfileCompleted) {
        toast.success('Đăng nhập thành công!');
        window.location.href = "/";
      } else {
        window.location.href = "/account-setup";
      }
    } catch (err: any) {
      const errorCode = err?.errorCode;

      console.log(err)

      if (errorCode === 'AUTH.UNAUTHORIZED') {
        setError('email', { message: 'Tài khoản hoặc mật khẩu không chính xác' });
        setError('password', { message: 'Tài khoản hoặc mật khẩu không chính xác' });
      } else {
        toast.error('Đã có lỗi xảy ra, vui lòng thử lại!');
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
      <Card className="border-zinc-200 bg-white/80 shadow-2xl shadow-zinc-200/50 backdrop-blur-md transition-colors dark:border-zinc-800 dark:bg-zinc-900/90 dark:shadow-black/50">
        <CardHeader className="space-y-2 pt-8 text-center">
          {/* Mock Logo hỗ trợ Dark mode */}
          <div className="mx-auto flex items-center justify-center">
            <Logo />
          </div>
          <CardTitle className="text-2xl font-black tracking-tighter text-zinc-950 dark:text-zinc-50">
            Đăng nhập
          </CardTitle>
          <CardDescription className="font-medium text-zinc-500 dark:text-zinc-400">
            Nhập thông tin để tiếp tục trải nghiệm
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-xs font-bold text-zinc-700 dark:text-zinc-300"
              >
                Tài khoản
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

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  title="Mật khẩu"
                  className="text-xs font-bold text-zinc-700 dark:text-zinc-300"
                >
                  Mật khẩu
                </Label>
                <a
                  href="#"
                  className="text-[10px] font-bold text-zinc-400 transition-colors hover:text-zinc-950 dark:text-zinc-500 dark:hover:text-zinc-300"
                >
                  Quên mật khẩu?
                </a>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  className={`h-11 rounded-md border-zinc-200 bg-transparent pr-10 text-zinc-900 transition-all placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-0 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-50 ${errors.password ? "border-red-500 dark:border-red-500" : ""
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

            <Button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 h-12 w-full cursor-pointer rounded-md bg-zinc-950 text-xs font-bold tracking-widest text-white transition-all hover:bg-zinc-800 active:scale-[0.99] dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "ĐĂNG NHẬP"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col items-center gap-4 pt-2 pb-8">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Chưa có tài khoản?{" "}
            <Link
              href="/register"
              className="cursor-pointer font-black text-zinc-950 underline-offset-4 hover:underline dark:text-zinc-50"
            >
              Đăng ký ngay
            </Link>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
