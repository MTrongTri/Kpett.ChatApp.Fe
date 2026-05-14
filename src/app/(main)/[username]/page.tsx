import { redirect } from "next/navigation";
import { Metadata } from "next";
import ProfileAvatarRow from "./components/profile-avatar-row";
import ProfileCover from "./components/profile-cover";
import ProfileInfo from "./components/profile-info";
import ProfileTabs from "./components/profile-tabs";
import ScrollHandler from "./components/scroll-handler";
import { UserProfile } from "@/types/user";
import { createPageMetadata } from "@/lib/seo";
import { cookies } from "next/headers";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getUserProfile(username: string): Promise<UserProfile | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return null;

  const cookieStore = await cookies();
  const authToken = cookieStore.get("access_token")?.value;
  try {
    const response = await fetch(
      `${apiUrl}/api/users/profile/${encodeURIComponent(username)}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        next: {
          revalidate: 300
        }
      }
    );
    if (!response.ok) return null;
    const body = await response.json();
    return body?.data ?? body;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const userProfile = await getUserProfile(username);

  if (!userProfile) return { title: 'User Not Found' };

  return createPageMetadata({
    title: `${userProfile.displayName} (@${userProfile.username}) - Kpett ChatApp`,
    description: userProfile.biography || `Xem trang cá nhân của ${userProfile.displayName} trên Kpett ChatApp.`,
    path: `/${userProfile.username}`,
    images: userProfile.avatarUrl ? [{ url: userProfile.avatarUrl, alt: `${userProfile.displayName}'s avatar` }] : undefined,
  })
}

export default async function ProfilePage({ params, searchParams }: ProfilePageProps) {
  const { username } = await params;
  const { "scroll-to": scrollTo } = await searchParams;

  const userProfile = await getUserProfile(username);

  if (!userProfile) {
    redirect("/error/server-error");
  }

  return (
    <div className="bg-background min-h-screen pt-14.5">
      {scrollTo === "tabs" && <ScrollHandler targetId="profile-tabs-section" />}

      <div className="min-w-0">
        <ProfileCover
          cover={userProfile.coverUrl}
          isOwner={userProfile.viewerContext.isOwner}
        />
        <ProfileAvatarRow
          profile={userProfile}
          isOwner={userProfile.viewerContext.isOwner}
        />
        <ProfileInfo profile={userProfile} />

        <div id="profile-tabs-section">
          <ProfileTabs author={userProfile} />
        </div>
      </div>
    </div>
  );
}