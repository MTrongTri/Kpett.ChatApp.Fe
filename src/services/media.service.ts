import axios from "axios";
import http from "./http";

export const uploadFileToCloudinary = async (
  file: File,
  onProgress?: (progress: number) => void,
  signal?: AbortSignal
) => {
  const signatureRes = await http.get("/media/generate-signature", {
    params: { folder: "posts" },
  });

  const { publicId, uploadUrl, signature, timestamp, cloudName, apiKey, folder } = signatureRes.data;

  // Chuẩn bị Payload
  const resourceType = file.type.startsWith("video/") ? "video" : "image";
  const cloudinaryUrl = uploadUrl;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("public_id", publicId);
  formData.append("asset_folder", folder);
  formData.append("signature", signature);

  // Upload trực tiếp bằng Axios (Sử dụng axios thuần, KHÔNG dùng apiClient nội bộ)
  // Lý do: Tránh việc apiClient đính kèm Authorization Header nội bộ gửi sang server Cloudinary gây lỗi CORS
  const uploadRes = await axios.post(cloudinaryUrl, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    signal,
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        if (onProgress) onProgress(percentCompleted);
      }
    },
  });

  return {
    publicId: uploadRes.data.public_id,
    url: uploadRes.data.secure_url,
    type: resourceType as "image" | "video",
  };
};

export const deleteFile = async (publicId: string, resourceType: string) => {
  await http.delete("/media/delete", {
    params: {
      publicId,
      resourceType,
    },
  });
}