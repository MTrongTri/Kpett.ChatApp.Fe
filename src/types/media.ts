export type MediaType = "image" | "video" | "gif" | "audio";

export interface Media {
  id: string;
  type: MediaType;
  url: string;
  thumbnailUrl?: string;
}
