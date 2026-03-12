import { redirect } from "next/navigation";
import EditProfileShell from "./_components/edit-profile-shell";

interface EditProfilePageProps {
  params: Promise<{ username: string }>;
}

export default async function EditProfilePage({ params }: EditProfilePageProps) {
  
  const { username } = await params;

  const currentUser = "tuan.dev"; 

  if (username !== currentUser) {
    redirect(`/profile/${username}`);
  }

  return <EditProfileShell username={username} />;
}

// ── Metadata ─────────────────────────────────────────────────────────
export const metadata = {
  title: "Chỉnh sửa trang cá nhân · KPET",
};