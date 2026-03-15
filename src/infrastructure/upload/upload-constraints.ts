// Единые ограничения загрузки файлов

export const UPLOAD_IMAGE = {
  allowedMimeTypes: [
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/svg+xml",
    "image/heif",
    "image/heic",
  ],
  maxSizeBytes: 5 * 1024 * 1024, // 5 MB
} as const;

export const UPLOAD_VIDEO = {
  allowedMimeTypes: ["video/mp4", "video/webm", "video/hevc"],
  maxSizeBytes: 50 * 1024 * 1024, // 50 MB
} as const;

export const UPLOAD_ORDER_FILE = {
  allowedMimeTypes: [
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/svg+xml",
    "image/heif",
    "image/heic",
    "application/pdf",
    "application/msword", // .doc
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  ],
  maxSizeBytes: 10 * 1024 * 1024, // 10 MB
} as const;

export const UPLOAD_LOGO = {
  allowedMimeTypes: [
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/svg+xml",
    "image/heif",
    "image/heic",
  ],
  maxSizeBytes: 2 * 1024 * 1024, // 2 MB
  minWidth: 16,
  maxWidth: 512,
  minHeight: 16,
  maxHeight: 512,
} as const;
