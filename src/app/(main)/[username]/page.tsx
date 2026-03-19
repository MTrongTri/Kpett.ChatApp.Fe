import { MOCK_USER_PROFILES } from "@/data/user";
import ProfileAvatarRow from "./components/profile-avatar-row";
import ProfileCover from "./components/profile-cover";
import ProfileInfo from "./components/profile-info";
import ProfileTabs from "./components/profile-tabs";
import { notFound, redirect } from "next/navigation";
import { getPostsByUsername } from "@/services/post.service";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const user = MOCK_USER_PROFILES.find((u) => u.username == username);

  if (!user) {
    notFound();
  }

  return (
    <div className="bg-background min-h-screen pt-14.5">
      <div>
        {/* Profile center column */}
        <div className="min-w-0">
          {/* 1 · Cover image */}
          <ProfileCover cover={user.coverUrl} />

          {/* 2 · Avatar + Follow / Message / More */}
          <ProfileAvatarRow profile={user} />

          {/* 3 · Name, bio, meta, social links, stats */}
          <ProfileInfo profile={user} />

          {/* 5 · Tabs → Grid → Lightbox */}
          <ProfileTabs author={user} />
        </div>
      </div>
    </div>
  );
}
