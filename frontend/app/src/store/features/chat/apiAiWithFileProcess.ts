import { addAssistantMessage } from './chatSlice'
import { getPresignedUrl, fetchFileAsBase64, getMimeTypeFromUrl } from './utils'
import { FileAttachment } from './chatTypes'
import { addAttachmentToMessage } from './chatSlice'
import { Chat } from './chatTypes'

export const processAssistantMessageWithFile =
  (content: string, fileUrl?: string) =>
  async (dispatch: any, getState: any) => {
    dispatch(addAssistantMessage({ content, fileUrl }))

    if (!fileUrl) return

    try {
      const presignedUrl = await getPresignedUrl(fileUrl)
      if (!presignedUrl) throw new Error('Could not get presigned URL')

      const base64Data = await fetchFileAsBase64(presignedUrl)
      if (!base64Data) throw new Error('Could not fetch file')

      const mimeType = getMimeTypeFromUrl(fileUrl)
      const filename = fileUrl.split('/').pop() || 'file'
      const size = Math.ceil((base64Data.length * 3) / 4)

      const allowedMimeTypes: FileAttachment['mimeType'][] = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.oasis.opendocument.spreadsheet',
        'application/octet-stream',
      ]

      if (!allowedMimeTypes.includes(mimeType as FileAttachment['mimeType']))
        return

      const attachment: FileAttachment = {
        filename,
        mimeType: mimeType as FileAttachment['mimeType'],
        data: base64Data,
        size,
      }

      const state = getState()
      const activeChat = state.chat.chats.find(
        (c: Chat) => c.id === state.chat.activeChat
      )

      if (activeChat && activeChat.messages.length > 0) {
        const lastMessage = activeChat.messages[activeChat.messages.length - 1]
        dispatch(
          addAttachmentToMessage({
            messageId: lastMessage.id,
            attachment,
          })
        )
      }
    } catch (error) {
      console.error('Error processing assistant file:', error)
    }
  }
