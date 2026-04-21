"use client";

import { use, useEffect, useRef } from "react";
import { notFound, useSearchParams } from "next/navigation";
import useSWR from "swr";
import ProfileAvatarRow from "./components/profile-avatar-row";
import ProfileCover from "./components/profile-cover";
import ProfileInfo from "./components/profile-info";
import ProfileTabs from "./components/profile-tabs";
import ProfileSkeleton from "./components/profile-skeleton";
import { getUserProfile } from "@/services/user.service";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { username } = use(params);
  const searchParams = useSearchParams();
  const tabsRef = useRef<HTMLDivElement>(null);


  const { data, isLoading, error } = useSWR([`/users/profile`, username], () =>
    getUserProfile(username),
  );

  useEffect(() => {
    if (!isLoading && data?.data) {
      const scrollTo = searchParams.get("scroll-to");

      if (scrollTo === "tabs" && tabsRef.current) {
        setTimeout(() => {
          tabsRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }, 150);
      }
    }
  }, [isLoading, data, searchParams]);

  // Cập nhật phần Loading tại đây
  if (isLoading) {
    return <ProfileSkeleton />;
  }

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

          <div ref={tabsRef} id="profile-tabs-section">
            <ProfileTabs author={userProfile} />
          </div>
        </div>
      </div>
    </div>
  );
}