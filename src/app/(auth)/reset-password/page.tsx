import FormResetPassword from "@/components/auth/form-reset-password";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Đặt lại mật khẩu",
  description: "Nhập mã OTP và mật khẩu mới để đặt lại mật khẩu Kpett ChatApp.",
  path: "/reset-password",
});

function ResetPasswordPage() {
  return (
    <div className="bg-background relative flex min-h-screen w-full items-center justify-center p-4">
      <FormResetPassword />
    </div>
  );
}

export default ResetPasswordPage;
