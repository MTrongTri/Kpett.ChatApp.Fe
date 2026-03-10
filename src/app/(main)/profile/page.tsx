import ProfileAvatarRow from "./_components/profile-avatar-row";
import ProfileCover from "./_components/profile-cover";
import ProfileHighlights from "./_components/profile-hight-light";
import ProfileInfo from "./_components/profile-info";
import ProfileTabs from "./_components/profile-tabs";
import { MOCK_PROFILE } from "./_data/data";


interface ProfilePageProps {
  params: { username: string };
}

export default function ProfilePage({ params }: ProfilePageProps) {
  // In production: fetch profile by params.username from your API
  const profile = MOCK_PROFILE;
  const isOwner = params.username === "tuan.dev";

  return (
    <div className="min-h-screen bg-background pt-[58px]">
      <div>
        {/* Profile center column */}
        <div className="min-w-0">
          {/* 1 · Cover image */}
          <ProfileCover gradient={profile.coverGradient} isOwner={isOwner} />

          {/* 2 · Avatar + Follow / Message / More */}
          <ProfileAvatarRow profile={profile} isOwner={isOwner} />

          {/* 3 · Name, bio, meta, social links, stats */}
          <ProfileInfo profile={profile} />

          {/* 4 · Highlights strip */}
          {/* <ProfileHighlights highlights={profile.highlights} isOwner={isOwner} /> */}

          {/* 5 · Tabs → Grid → Lightbox */}
          <ProfileTabs author={profile} isOwner={isOwner} />
        </div>

      </div>
    </div>
  );
}