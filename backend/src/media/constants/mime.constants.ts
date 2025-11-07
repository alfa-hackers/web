export const FILE_TYPES = {
  IMAGE: {
    MIME_TYPES: ['image/jpeg', 'image/png'] as const,
    EXTENSIONS: ['.jpeg', '.jpg', '.png'] as const,
  },
  VIDEO: {
    MIME_TYPES: ['video/mp4', 'video/webm', 'video/x-msvideo'] as const,
    EXTENSIONS: ['.mp4', '.webm', '.avi'] as const,
  },
} as const

export type ImageMimeType = (typeof FILE_TYPES.IMAGE.MIME_TYPES)[number]
export type VideoMimeType = (typeof FILE_TYPES.VIDEO.MIME_TYPES)[number]
export type AllowedMimeType = ImageMimeType | VideoMimeType

export type ImageExtension = (typeof FILE_TYPES.IMAGE.EXTENSIONS)[number]
export type VideoExtension = (typeof FILE_TYPES.VIDEO.EXTENSIONS)[number]
export type AllowedExtension = ImageExtension | VideoExtension
