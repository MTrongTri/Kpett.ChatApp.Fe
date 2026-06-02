import FormForgotPassword from "@/components/auth/form-forgot-password";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Quên mật khẩu",
  description: "Nhập email để nhận mã OTP đặt lại mật khẩu Kpett ChatApp.",
  path: "/forgot-password",
});

function ForgotPasswordPage() {
  return (
    <div className="bg-background relative flex min-h-screen w-full items-center justify-center p-4">
      <FormForgotPassword />
    </div>
  );
}

export default ForgotPasswordPage;
