import http from "@/lib/axios";

interface UploadedMediaResponse {
  publicId: string;
  url: string;
  type: "image" | "video";
  mimeType: string;
}

export const uploadFile = async (
  file: File,
  folder?: string,
  onProgress?: (progress: number) => void,
  signal?: AbortSignal
): Promise<UploadedMediaResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await http.post("/media/upload", formData, {
    params: { folder },
    signal,
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress?.(percent);
      }
    },
  });

  const data = response.data;
  const type = file.type.startsWith("video/") ? "video" : "image";

  return {
    publicId: data.publicId,
    url: data.secureUrl,
    type,
    mimeType: file.type,
  };
};

export const deleteFile = async (fileUrl: string) => {
  await http.delete("/media/delete", {
    params: { fileUrl },
  });
};
