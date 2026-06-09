import { z } from 'zod';

/** A chat message (GET /chat/rooms/:id/messages items, POST send response). */
export const chatMessageSchema = z.object({
  id: z.string(),
  roomId: z.string(),
  senderId: z.string().nullable(),
  senderName: z.string().nullable(),
  content: z.string(),
  createdAt: z.string(),
});
export type ChatMessage = z.infer<typeof chatMessageSchema>;

/** A room in the user's chat list (GET /chat/rooms). */
export const chatRoomSchema = z.object({
  id: z.string(),
  type: z.enum(['dm', 'group']),
  title: z.string(),
  memberCount: z.number(),
  lastMessage: z
    .object({
      content: z.string(),
      createdAt: z.string(),
      senderName: z.string().nullable(),
    })
    .nullable(),
  unreadCount: z.number(),
  updatedAt: z.string(),
});
export type ChatRoom = z.infer<typeof chatRoomSchema>;

/** POST /chat/rooms/:id/messages body. */
export const sendMessageInputSchema = z.object({
  content: z.string().min(1).max(4000),
  clientUuid: z.string().optional(),
});
export type SendMessageInput = z.infer<typeof sendMessageInputSchema>;

/** POST /chat/rooms body — create a group or ensure a dm. */
export const createRoomInputSchema = z.object({
  type: z.enum(['dm', 'group']),
  memberId: z.string().optional(),
  name: z.string().max(120).optional(),
  memberIds: z.array(z.string()).optional(),
});
export type CreateRoomInput = z.infer<typeof createRoomInputSchema>;

/** Socket payload for the 'ChatMessageCreated' event. */
export const chatMessageCreatedEventSchema = z.object({
  roomId: z.string(),
  message: chatMessageSchema,
});
export type ChatMessageCreatedEvent = z.infer<typeof chatMessageCreatedEventSchema>;
