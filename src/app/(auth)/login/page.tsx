import FormLogin from "@/components/auth/form-login";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Đăng nhập",
  description:
    "Đăng nhập Kpett ChatApp để xem bảng tin, nhắn tin và kết nối với bạn bè.",
  path: "/login",
});

function LoginPage() {
  return (
    <div className="bg-background relative flex min-h-screen w-full items-center justify-center p-4">
      <FormLogin />
    </div>
  );
}

export default LoginPage;
