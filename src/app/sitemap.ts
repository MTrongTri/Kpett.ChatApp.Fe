import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";

export const revalidate = 3600;

type SitemapRoute = Pick<
  MetadataRoute.Sitemap[number],
  "changeFrequency" | "priority"
> & {
  path: string;
  lastModified?: Date | string;
};

type SitemapUser = {
  username: string;
  updatedAt?: string | null;
  createdAt?: string | null;
};

type SitemapPost = {
  id: string;
  privacy?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
};

type CursorPaginationMeta = {
  nextCursor: string | null;
  hasMore: boolean;
};

type PaginatedUsers = {
  items: SitemapUser[];
  pagination?: CursorPaginationMeta;
};

type PaginatedPosts = {
  items: SitemapPost[];
  pagination?: CursorPaginationMeta;
};

type ApiResponse<T> = {
  data?: T;
};

const publicRoutes: SitemapRoute[] = [
  {
    path: "/",
    changeFrequency: "daily",
    priority: 1,
  },
  {
    path: "/register",
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    path: "/login",
    changeFrequency: "monthly",
    priority: 0.4,
  },
];

function createSitemapEntry({
  path,
  lastModified = new Date(),
  ...route
}: SitemapRoute): MetadataRoute.Sitemap[number] {
  return {
    url: new URL(path, siteConfig.url).toString(),
    lastModified,
    ...route,
  };
}

function unwrapPaginatedUsers(payload: unknown): PaginatedUsers | null {
  const response = payload as ApiResponse<PaginatedUsers> | PaginatedUsers;

  if ("items" in response && Array.isArray(response.items)) {
    return response;
  }

  if (
    "data" in response &&
    response.data &&
    Array.isArray(response.data.items)
  ) {
    return response.data;
  }

  return null;
}

function unwrapPaginatedPosts(payload: unknown): PaginatedPosts | null {
  const response = payload as ApiResponse<PaginatedPosts> | PaginatedPosts;

  if ("items" in response && Array.isArray(response.items)) {
    return response;
  }

  if (
    "data" in response &&
    response.data &&
    Array.isArray(response.data.items)
  ) {
    return response.data;
  }

  return null;
}

async function getProfileRoutes(): Promise<SitemapRoute[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    return [];
  }

  const routes: SitemapRoute[] = [];
  let cursor: string | null = null;

  for (let page = 0; page < 10; page += 1) {
    const url = new URL("/api/users/search", apiUrl);

    url.searchParams.set("keyword", "");
    url.searchParams.set("limit", "100");

    if (cursor) {
      url.searchParams.set("cursor", cursor);
    }

    try {
      const response = await fetch(url, {
        next: { revalidate },
      });

      if (!response.ok) {
        break;
      }

      const users = unwrapPaginatedUsers(await response.json());

      if (!users) {
        break;
      }

      routes.push(
        ...users.items
          .filter((user) => user.username)
          .map((user) => ({
            path: `/${user.username}`,
            lastModified: user.updatedAt || user.createdAt || undefined,
            changeFrequency: "weekly" as const,
            priority: 0.8,
          })),
      );

      if (!users.pagination?.hasMore || !users.pagination.nextCursor) {
        break;
      }

      cursor = users.pagination.nextCursor;
    } catch {
      break;
    }
  }

  return routes;
}

async function getPostRoutes(): Promise<SitemapRoute[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    return [];
  }

  const routes: SitemapRoute[] = [];
  let cursor: string | null = null;

  for (let page = 0; page < 10; page += 1) {
    const url = new URL("/api/posts", apiUrl);

    url.searchParams.set("limit", "100");

    if (cursor) {
      url.searchParams.set("cursor", cursor);
    }

    try {
      const response = await fetch(url, {
        next: { revalidate },
      });

      if (!response.ok) {
        break;
      }

      const posts = unwrapPaginatedPosts(await response.json());

      if (!posts) {
        break;
      }

      routes.push(
        ...posts.items
          .filter((post) => post.id && post.privacy === "public")
          .map((post) => ({
            path: `/post/${post.id}`,
            lastModified: post.updatedAt || post.createdAt || undefined,
            changeFrequency: "weekly" as const,
            priority: 0.7,
          })),
      );

      if (!posts.pagination?.hasMore || !posts.pagination.nextCursor) {
        break;
      }

      cursor = posts.pagination.nextCursor;
    } catch {
      break;
    }
  }

  return routes;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [profileRoutes, postRoutes] = await Promise.all([
    getProfileRoutes(),
    getPostRoutes(),
  ]);

  return [...publicRoutes, ...profileRoutes, ...postRoutes].map(
    createSitemapEntry,
  );
}
