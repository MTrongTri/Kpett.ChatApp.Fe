"use client";

import { use, useEffect, useRef } from "react";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import ProfileAvatarRow from "./components/profile-avatar-row";
import ProfileCover from "./components/profile-cover";
import ProfileInfo from "./components/profile-info";
import ProfileTabs from "./components/profile-tabs";
import ProfileSkeleton from "./components/profile-skeleton";
import { getUserProfile } from "@/services/user.service";
import { ApiResponse } from "@/types/common/api";
import { UserProfile } from "@/types/user";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { username } = use(params);
  const searchParams = useSearchParams();
  const tabsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const {
    data: userProfile,
    isLoading,
    error,
    isError
  } = useQuery({
    queryKey: ["user-profile", username],
    queryFn: () => getUserProfile(username),
    enabled: !!username,
    staleTime: 60 * 1000,
  });

  // Xử lý scroll tới tabs nếu có query param
  useEffect(() => {
    if (!isLoading && userProfile) {
      const scrollTo = searchParams.get("scroll-to");
      if (scrollTo === "tabs" && tabsRef.current) {
        setTimeout(() => {
          tabsRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 150);
      }
    }
  }, [isLoading, userProfile, searchParams]);

  // Render Skeleton
  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (isError || !userProfile) {
    router.push("/error/server-error");

    return null;
  }

  return (
    <div className="bg-background min-h-screen pt-14.5">
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
  );
}