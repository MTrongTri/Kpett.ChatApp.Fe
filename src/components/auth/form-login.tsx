"use client";

import * as z from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Github, Chrome } from "lucide-react";
import { motion } from "framer-motion";

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

const loginSchema = z.object({
  usernameOrEmail: z.string().min(1, "Vui lòng nhập tài khoản"),
  password: z.string().min(1, "Mật khẩu không được để trống"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function FormLogin() {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const loginRes = await authService.login(data)
      toast.success("Đăng nhập thành công!")
    } catch (err: any) {
      const errorCode = err?.erorrCode || err?.response?.status

      if (errorCode === 400 || errorCode === 401) {
        setError("usernameOrEmail", { message: "Tài khoản hoặc mật khẩu không chính xác" })
      } else {
        toast.error("Đã có lỗi xảy ra, vui lòng thử lại!")
      }
    }
  }
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="z-10 w-full max-w-[420px]"
    >
      <Card className="border-zinc-200 shadow-2xl shadow-zinc-200/50 bg-white/80 backdrop-blur-md">
        <CardHeader className="space-y-2 text-center pt-8">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-950">
            <div className="h-4 w-4 bg-white rotate-45" />
          </div>
          <CardTitle className="text-2xl font-black tracking-tighter text-zinc-950 uppercase">
            Sign In
          </CardTitle>
          <CardDescription className="text-zinc-500 font-medium">
            Nhập thông tin để tiếp tục trải nghiệm
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-zinc-700 text-xs font-bold uppercase"
              >
                Tài khoản
              </Label>
              <Input
                id="email"
                placeholder="name@example.com"
                {...register("usernameOrEmail")}
                className={`border-zinc-200 focus:border-zinc-950 focus:ring-0 h-11 transition-all rounded-none ${errors.usernameOrEmail ? "border-red-500" : ""}`}
              />
              {errors.usernameOrEmail && (
                <p className="text-[10px] text-red-500 font-bold uppercase">
                  {errors.usernameOrEmail.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  title="Mật khẩu"
                  className="text-zinc-700 text-xs font-bold uppercase"
                >
                  Mật khẩu
                </Label>
                <a
                  href="#"
                  className="text-[10px] font-bold text-zinc-400 hover:text-zinc-950 transition-colors uppercase"
                >
                  Quên mật khẩu?
                </a>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className={`border-zinc-200 focus:border-zinc-950 focus:ring-0 h-11 pr-10 transition-all rounded-none ${errors.password ? "border-red-500" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-950"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[10px] text-red-500 font-bold uppercase">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-zinc-950 hover:bg-zinc-800 text-white font-bold rounded-none transition-all active:scale-[0.99] uppercase tracking-widest text-xs"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Đăng nhập"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="pb-8 pt-2 flex flex-col items-center gap-4">
          <p className="text-xs text-zinc-400 font-medium">
            Chưa có tài khoản?{" "}
            <button className="text-zinc-950 font-black hover:underline underline-offset-4">
              ĐĂNG KÝ NGAY
            </button>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
