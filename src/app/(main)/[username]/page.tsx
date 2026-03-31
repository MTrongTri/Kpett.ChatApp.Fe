"use client";

// Thêm useEffect và useRef vào import
import { use, useEffect, useRef } from "react";
import { getProfileUser } from "@/services/user.service";
// Thêm useSearchParams từ next/navigation
import { notFound, useSearchParams } from "next/navigation";
import useSWR from "swr";
import ProfileAvatarRow from "./components/profile-avatar-row";
import ProfileCover from "./components/profile-cover";
import ProfileInfo from "./components/profile-info";
import ProfileTabs from "./components/profile-tabs";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { username } = use(params);

  // 1. Khởi tạo hook đọc URL query params
  const searchParams = useSearchParams();

  // 2. Tạo ref để neo vị trí cần scroll tới
  const tabsRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, error } = useSWR([`/users/profile`, username], () =>
    getProfileUser(username),
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

  if (isLoading) {
    return (
      <div className="flex min-h-screen justify-center pt-14.5">Loading...</div>
    );
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