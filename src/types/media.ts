export type MediaType = "image" | "video" | "gif" | "audio";

export interface Media {
  publicId: string;
  type: string;
  url: string;
  thumbnailUrl?: string;
}
