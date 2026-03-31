export type MediaType = "image" | "video" | "gif" | "audio";

export interface Media {
  publicId: string;
  type: MediaType;
  url: string;
  thumbnailUrl?: string;
}
