import http from "@/lib/axios";
import axios from "axios";

const cloudinaryClient = axios.create();

export const uploadFileToCloudinary = async (
  file: File,
  folder: string = "posts",
  onProgress?: (progress: number) => void,
  signal?: AbortSignal
) => {
  try {
    const signatureRes = await http.get("/media/generate-signature", {
      params: { folder },
    });

    const { publicId, uploadUrl, signature, timestamp, apiKey, folder: folderRes, tags } = signatureRes.data;

    const resourceType = file.type.startsWith("video/") ? "video" : "image";
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", String(timestamp));
    formData.append("public_id", publicId);
    formData.append("asset_folder", folderRes);
    formData.append("signature", signature);
    formData.append("tags", tags);

    const uploadRes = await cloudinaryClient.post(uploadUrl, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      signal,
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          if (onProgress) onProgress(percentCompleted);
        }
      },
    });

    const filePrefix = file.type ? file.type.split('/')[0] : 'image';

    const cloudFormat = uploadRes.data.format;

    let finalMimeType = `${filePrefix}/${cloudFormat}`;

    return {
      publicId: uploadRes.data.public_id,
      url: uploadRes.data.secure_url,
      type: resourceType as "image" | "video",
      mimeType: finalMimeType,
    };
  } catch (error: any) {
    if (axios.isCancel(error)) {
      throw error;
    }

    const cloudinaryError = error.response?.data?.error?.message;
    if (cloudinaryError) {
      throw new Error(`Cloudinary Error: ${cloudinaryError}`);
    }

    throw error;
  }
};

export const deleteFile = async (publicId: string, resourceType: string) => {
  await http.delete("/media/delete", {
    params: {
      publicId,
      resourceType,
    },
  });
};