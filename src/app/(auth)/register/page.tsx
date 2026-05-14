import FormRegister from "@/components/auth/form-register";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Đăng ký",
  description:
    "Tạo tài khoản Kpett ChatApp để chia sẻ bài viết, trò chuyện và kết nối với cộng đồng.",
  path: "/register",
});

function RegisterPage() {
  return (
    <div className="bg-background relative flex min-h-screen w-full items-center justify-center p-4">
      <FormRegister />
    </div>
  );
}

export default RegisterPage;
