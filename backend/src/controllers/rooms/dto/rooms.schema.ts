import { z } from 'zod'

export const getUserRoomsSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
})

export type GetUserRoomsType = z.infer<typeof getUserRoomsSchema>
