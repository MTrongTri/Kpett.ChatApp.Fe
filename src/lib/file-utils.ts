import imageCompression, { Options as CompressionOptions } from 'browser-image-compression';

export interface ValidationOptions {
  allowedTypes?: string[];
  maxSize?: number;
  maxImageSize?: number;
  maxVideoSize?: number;
  customErrors?: {
    invalidType?: string;
    tooLarge?: string;
  };
}

export type FileErrorCode = 'INVALID_TYPE' | 'FILE_TOO_LARGE';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  errorCode?: FileErrorCode;
}

// Cấu hình mặc định (fallback nếu không truyền options)
export const DEFAULT_FILE_LIMITS = {
  MAX_IMAGE_SIZE: 5 * 1024 * 1024,     // 5MB
  MAX_VIDEO_SIZE: 500 * 1024 * 1024,   // 500MB (Post video)
  MAX_REEL_SIZE: 250 * 1024 * 1024,    // 250MB (Reel video)
  ALLOWED_TYPES: [
    "image/jpeg", "image/png", "image/webp",
    "video/mp4", "video/webm", "video/quicktime"
  ]
};

export const validateFile = (
  file: File,
  options?: ValidationOptions
): ValidationResult => {
  const allowedTypes = options?.allowedTypes || DEFAULT_FILE_LIMITS.ALLOWED_TYPES;

  // Kiểm tra định dạng (Type Validation)
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: options?.customErrors?.invalidType || `Định dạng ${file.type || 'này'} không được hỗ trợ.`,
      errorCode: 'INVALID_TYPE'
    };
  }

  // Xác định dung lượng tối đa cho phép (Size Resolution)
  let maxSize = options?.maxSize;

  // Nếu không set maxSize chung, tự động nhận diện theo loại file
  if (!maxSize) {
    if (file.type.startsWith('video/')) {
      maxSize = options?.maxVideoSize || DEFAULT_FILE_LIMITS.MAX_VIDEO_SIZE;
    } else if (file.type.startsWith('image/')) {
      maxSize = options?.maxImageSize || DEFAULT_FILE_LIMITS.MAX_IMAGE_SIZE;
    } else {
      maxSize = 5 * 1024 * 1024; // 5MB
    }
  }

  if (file.size > maxSize) {
    const sizeInMB = (maxSize / (1024 * 1024)).toFixed(1);
    const formattedSize = sizeInMB.endsWith('.0') ? sizeInMB.slice(0, -2) : sizeInMB;

    return {
      isValid: false,
      error: options?.customErrors?.tooLarge || `File quá lớn. Tối đa cho phép là ${formattedSize}MB.`,
      errorCode: 'FILE_TOO_LARGE'
    };
  }

  return { isValid: true };
};

export const DEFAULT_COMPRESS_OPTIONS: CompressionOptions = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1080,
  useWebWorker: true,
  fileType: 'image/webp'
};

export const compressImageClientSide = async (
  file: File,
  options?: CompressionOptions
): Promise<File> => {
  if (!file.type.startsWith('image/')) return file;

  if (file.type === 'image/gif') return file;

  const mergedOptions = { ...DEFAULT_COMPRESS_OPTIONS, ...options };

  try {
    const compressedBlob = await imageCompression(file, mergedOptions);

    let fileName = file.name;
    if (mergedOptions.fileType) {
      const targetExtension = mergedOptions.fileType.split('/')[1];
      const originalNameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;

      if (!fileName.toLowerCase().endsWith(`.${targetExtension}`)) {
        fileName = `${originalNameWithoutExt}.${targetExtension}`;
      }
    }

    return new File([compressedBlob], fileName, {
      type: compressedBlob.type,
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error("Lỗi nén ảnh:", error);
    return file;
  }
};