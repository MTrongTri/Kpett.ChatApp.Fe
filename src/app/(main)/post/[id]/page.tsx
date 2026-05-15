import type { Metadata } from "next";
import { cookies } from "next/headers";
import { createPageMetadata } from "@/lib/seo";
import type { Post } from "@/types/post";
import PostDetailClient from "./components/post-detail-client";
import { ApiResponse } from "@/types/common/api";

type PostDetailPageProps = {
  params: Promise<{ id: string }>;
};


function unwrapPost(payload: unknown): Post | null {
  const response = payload as ApiResponse<Post> | Post;

  if ("data" in response && response.data) {
    return response.data;
  }

  if ("id" in response) {
    return response as Post;
  }

  return null;
}

function stripContent(content: string) {
  return content
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncateText(text: string, maxLength = 155) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1).trim()}…`;
}

async function getPostById(postId: string): Promise<Post | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    return null;
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const headers: HeadersInit = {};

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  try {
    const response = await fetch(`${apiUrl}/api/posts/${postId}`, {
      headers,
      next: accessToken ? undefined : { revalidate: 120 },
      cache: accessToken ? "no-store" : undefined,
    });

    if (!response.ok) {
      return null;
    }

    return unwrapPost(await response.json());
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: PostDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    return createPageMetadata({
      title: "Không tìm thấy bài viết",
      description:
        "Bài viết này có thể đã bị xóa, bị ẩn hoặc không còn khả dụng trên Kpett ChatApp.",
      path: `/post/${id}`,
      noIndex: true,
    });
  }

  const authorName = post.author.displayName || post.author.username;
  const content = stripContent(post.content);
  const description = truncateText(
    content || `Xem bài viết của ${authorName} trên Kpett ChatApp.`,
  );
  const firstImage = post.media.find(
    (item) => item.type.toLowerCase() === "image",
  );

  return createPageMetadata({
    title: post.title || `Bài viết của ${authorName}`,
    description,
    path: `/post/${post.id}`,
    images: firstImage
      ? [
        {
          url: firstImage.url,
          alt: post.title || `Bài viết của ${authorName}`,
        },
      ]
      : undefined,
    noIndex: post.privacy !== "public",
  });
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = await params;
  const initialPost = await getPostById(id);

  return <PostDetailClient initialPost={initialPost} postId={id} />;
}
