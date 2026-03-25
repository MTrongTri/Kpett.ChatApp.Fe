"use client";

import { use } from "react"; // <-- Import 'use' from react
import { getProfileUser } from "@/services/user.service";
import { notFound } from "next/navigation";
import useSWR from "swr";
import ProfileAvatarRow from "./components/profile-avatar-row";
import ProfileCover from "./components/profile-cover";
import ProfileInfo from "./components/profile-info";
import ProfileTabs from "./components/profile-tabs";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

// 1. Remove 'async'
export default function ProfilePage({ params }: ProfilePageProps) {
  // 2. Unwrap the params promise using React's use() hook
  const { username } = use(params);

  const { data, isLoading, error } = useSWR([`/users/profile`, username], () =>
    getProfileUser(username),
  );

  // 3. Handle the loading state so it doesn't instantly 404
  if (isLoading) {
    return (
      <div className="flex min-h-screen justify-center pt-14.5">Loading...</div>
    );
  }

  // 4. Handle errors or missing data
  if (error || !data || !data.data) {
    notFound();
  }

  const userProfile = data.data;

  return (
    <div className="bg-background min-h-screen pt-14.5">
      <div>
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
          <ProfileTabs author={userProfile} />
        </div>
      </div>
    </div>
  );
}
