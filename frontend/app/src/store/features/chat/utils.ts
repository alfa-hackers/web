import { FileAttachment } from './chatTypes'

export const fetchFileAsBase64 = async (fileUrl: string): Promise<string> => {
  try {
    const response = await fetch(fileUrl)
    if (!response.ok) throw new Error('Failed to fetch file')
    const blob = await response.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        resolve(base64.split(',')[1])
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error('Error fetching file:', error)
    return ''
  }
}

export const getApiUrl = (): string => {
  return process.env.NODE_ENV === 'production'
    ? 'https://api.whirav.ru'
    : 'http://localhost:3000'
}

export const getMimeTypeFromUrl = (
  url: string
): FileAttachment['mimeType'] | 'application/octet-stream' => {
  const extension = url.split('.').pop()?.toLowerCase()
  switch (extension) {
    case 'pdf':
      return 'application/pdf'
    case 'doc':
      return 'application/msword'
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    case 'xls':
      return 'application/vnd.ms-excel'
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    case 'ods':
      return 'application/vnd.oasis.opendocument.spreadsheet'
    default:
      return 'application/octet-stream'
  }
}
