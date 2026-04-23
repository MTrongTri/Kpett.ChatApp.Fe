import { Media } from "@/types/media";
import MediaUploader from "./media-uploader";

export interface StepMediaProps {
  media: Media[];
  setMedia: (media: Media[]) => void;
  onLoadingChange?: (isLoading: boolean) => void;
}

export default function StepMedia({ media, setMedia, onLoadingChange }: StepMediaProps) {
  return (
    <div className="flex flex-col gap-6">
      <MediaUploader media={media} onChange={setMedia} onLoadingChange={onLoadingChange} />
    </div>
  );
}
