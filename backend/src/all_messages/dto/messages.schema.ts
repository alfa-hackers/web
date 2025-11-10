import { z } from 'zod'

export const getMessagesQuerySchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  roomId: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
  offset: z.coerce.number().int().nonnegative().optional().default(0),
})

export const getUserRoomsQuerySchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
})

export const createMessageSchema = z.object({
  text: z.string().min(1).max(5000).optional(),
  audioAddress: z.string().url().optional(),
  voiceAddress: z.string().url().optional(),
  roomId: z.string().min(1),
  userId: z.string().uuid(),
  messageType: z.enum(['user', 'assistant', 'system']).default('user'),
  isAi: z.boolean().default(false),
})

export const getRoomMessagesSchema = z.object({
  roomId: z.string().min(1, 'Room ID is required'),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
  offset: z.coerce.number().int().nonnegative().optional().default(0),
})

export type GetRoomMessagesType = z.infer<typeof getRoomMessagesSchema>
export type GetMessagesQueryType = z.infer<typeof getMessagesQuerySchema>
export type GetUserRoomsQueryType = z.infer<typeof getUserRoomsQuerySchema>
export type CreateMessageType = z.infer<typeof createMessageSchema>
