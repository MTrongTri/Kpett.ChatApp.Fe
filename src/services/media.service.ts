import http from "@/lib/axios";
import axios from "axios";

const cloudinaryClient = axios.create();

export const uploadFileToCloudinary = async (
  file: File,
  onProgress?: (progress: number) => void,
  signal?: AbortSignal
) => {
  try {
    const signatureRes = await http.get("/media/generate-signature", {
      params: { folder: "posts" },
    });

    const { publicId, uploadUrl, signature, timestamp, apiKey, folder } = signatureRes.data;

    const resourceType = file.type.startsWith("video/") ? "video" : "image";
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", String(timestamp));
    formData.append("public_id", publicId);
    formData.append("asset_folder", folder);
    formData.append("signature", signature);

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

    return {
      publicId: uploadRes.data.public_id,
      url: uploadRes.data.secure_url,
      type: resourceType as "image" | "video",
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