import http from "@/lib/axios";
import axios from "axios";

const CLOUDINARY_REGULAR_UPLOAD_LIMIT = 100 * 1024 * 1024;
const CLOUDINARY_CHUNK_SIZE = 20 * 1024 * 1024;

const cloudinaryClient = axios.create({ timeout: 120000 });

interface CloudinarySignaturePayload {
  publicId: string;
  uploadUrl: string;
  signature: string;
  timestamp: number | string;
  apiKey: string;
  folder: string;
  tags?: string;
}

interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  format?: string;
  resource_type?: string;
  done?: boolean;
}

interface UploadedMediaResponse {
  publicId: string;
  url: string;
  type: "image" | "video";
  mimeType: string;
}

const appendUploadParameters = (
  formData: FormData,
  signaturePayload: CloudinarySignaturePayload
) => {
  formData.append("api_key", signaturePayload.apiKey);
  formData.append("timestamp", String(signaturePayload.timestamp));
  formData.append("public_id", signaturePayload.publicId);
  formData.append("asset_folder", signaturePayload.folder);
  formData.append("signature", signaturePayload.signature);

  if (signaturePayload.tags) {
    formData.append("tags", signaturePayload.tags);
  }
};

const createUploadId = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const toUploadedMediaResponse = (
  uploadData: CloudinaryUploadResponse,
  file: File,
  resourceType: "image" | "video"
): UploadedMediaResponse => {
  const filePrefix = file.type ? file.type.split("/")[0] : resourceType;
  const finalMimeType = uploadData.format
    ? `${filePrefix}/${uploadData.format}`
    : file.type || resourceType;

  return {
    publicId: uploadData.public_id,
    url: uploadData.secure_url,
    type: resourceType,
    mimeType: finalMimeType,
  };
};

const uploadRegularFile = async (
  file: File,
  signaturePayload: CloudinarySignaturePayload,
  onProgress?: (progress: number) => void,
  signal?: AbortSignal
) => {
  const formData = new FormData();
  formData.append("file", file);
  appendUploadParameters(formData, signaturePayload);

  const uploadRes = await cloudinaryClient.post<CloudinaryUploadResponse>(
    signaturePayload.uploadUrl,
    formData,
    {
      signal,
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress?.(percentCompleted);
        }
      },
    }
  );

  return uploadRes.data;
};

const uploadChunkedFile = async (
  file: File,
  signaturePayload: CloudinarySignaturePayload,
  onProgress?: (progress: number) => void,
  signal?: AbortSignal
) => {
  const uploadId = createUploadId();
  let finalResponse: CloudinaryUploadResponse | null = null;

  for (let start = 0; start < file.size; start += CLOUDINARY_CHUNK_SIZE) {
    const end = Math.min(start + CLOUDINARY_CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end, file.type);
    const formData = new FormData();

    formData.append("file", chunk, file.name);
    appendUploadParameters(formData, signaturePayload);

    const uploadRes = await cloudinaryClient.post<CloudinaryUploadResponse>(
      signaturePayload.uploadUrl,
      formData,
      {
        signal,
        headers: {
          "Content-Range": `bytes ${start}-${end - 1}/${file.size}`,
          "X-Unique-Upload-Id": uploadId,
        },
        onUploadProgress: (progressEvent) => {
          const uploadedBytes = Math.min(start + progressEvent.loaded, file.size);
          const percentCompleted = Math.round((uploadedBytes * 100) / file.size);
          onProgress?.(percentCompleted);
        },
      }
    );

    finalResponse = uploadRes.data;
  }

  if (!finalResponse) {
    throw new Error("Cloudinary chunked upload did not return a response.");
  }

  onProgress?.(100);
  return finalResponse;
};

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

    const { publicId, uploadUrl, signature, timestamp, apiKey, folder: folderRes, tags } =
      signatureRes.data as CloudinarySignaturePayload & { folder: string };

    const resourceType = file.type.startsWith("video/") ? "video" : "image";
    const signaturePayload: CloudinarySignaturePayload = {
      publicId,
      uploadUrl,
      signature,
      timestamp,
      apiKey,
      folder: folderRes,
      tags,
    };

    const uploadData =
      file.size > CLOUDINARY_REGULAR_UPLOAD_LIMIT
        ? await uploadChunkedFile(file, signaturePayload, onProgress, signal)
        : await uploadRegularFile(file, signaturePayload, onProgress, signal);

    return toUploadedMediaResponse(uploadData, file, resourceType);
  } catch (error: unknown) {
    if (axios.isCancel(error)) {
      throw error;
    }

    const cloudinaryError = axios.isAxiosError(error)
      ? (error.response?.data as { error?: { message?: string } } | undefined)?.error?.message
      : undefined;
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
