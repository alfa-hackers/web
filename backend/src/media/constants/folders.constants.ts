export const UPLOAD_FOLDERS = {
  PICTURES: 'pictures',
  VIDEOS: 'videos',
  OTHER: 'other',
} as const

export type UploadFolder = (typeof UPLOAD_FOLDERS)[keyof typeof UPLOAD_FOLDERS]
