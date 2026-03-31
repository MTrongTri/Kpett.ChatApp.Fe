import imageCompression from 'browser-image-compression';

// Cấu hình giới hạn
const FILE_LIMITS = {
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_VIDEO_SIZE: 1024 * 1024 * 1024, // 1GB
  ALLOWED_TYPES: [
    "image/jpeg", "image/png", "image/webp",
    "video/mp4", "video/webm", "video/quicktime"
  ]
};

// Hàm Validation
export const validateFile = (file: File): { isValid: boolean; error?: string } => {
  // Check định dạng
  if (!FILE_LIMITS.ALLOWED_TYPES.includes(file.type)) {
    return { isValid: false, error: `Định dạng ${file.type} không được hỗ trợ.` };
  }

  // Check dung lượng
  const isVideo = file.type.startsWith('video/');
  const maxSize = isVideo ? FILE_LIMITS.MAX_VIDEO_SIZE : FILE_LIMITS.MAX_IMAGE_SIZE;

  if (file.size > maxSize) {
    const sizeInMB = (maxSize / (1024 * 1024)).toFixed(0);
    return { isValid: false, error: `File quá lớn. Tối đa cho phép là ${sizeInMB}MB.` };
  }

  return { isValid: true };
};

// 3. Hàm Nén ảnh (Chỉ áp dụng cho Image, Video nén ở client rất nặng và dễ gây treo máy)
export const compressImageClientSide = async (file: File): Promise<File> => {
  if (!file.type.startsWith('image/')) return file; // Bỏ qua nếu là video

  const options = {
    maxSizeMB: 1,          // Ép dung lượng tối đa xuống 1MB
    maxWidthOrHeight: 1080, // Ép kích thước cạnh dài nhất tối đa
    useWebWorker: true,     // Chạy ngầm không làm đơ UI
    fileType: 'image/webp'  // (Tùy chọn) Chuyển hết sang WebP cho nhẹ
  };

  try {
    const compressedBlob = await imageCompression(file, options);
    // Chuyển Blob về lại File object để tương thích với luồng upload cũ
    return new File([compressedBlob], file.name, {
      type: compressedBlob.type,
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error("Lỗi nén ảnh:", error);
    return file; // Nếu lỗi nén, trả về file gốc để upload tiếp
  }
};