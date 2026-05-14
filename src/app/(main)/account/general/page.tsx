import { createPageMetadata } from "@/lib/seo";
import ProfileGeneralForm from "./components/general-form";

export const metadata = createPageMetadata({
  title: "Chỉnh sửa trang cá nhân",
  description:
    "Cập nhật thông tin hồ sơ công khai và thiết lập cá nhân trên Kpett ChatApp.",
  path: "/account/general",
  noIndex: true,
});

export default function EditProfilePage() {
  return (
    <div>
      <ProfileGeneralForm />
    </div>
  );
}
