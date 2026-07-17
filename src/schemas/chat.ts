import { z } from 'zod';

/** Max size for a chat attachment, enforced client-side before upload. */
export const CHAT_MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024; // 25 MB
/** Image MIME types — rendered inline in the bubble. */
export const CHAT_ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
] as const;
/**
 * Non-image file MIME types allowed as attachments — shown as a downloadable
 * card. Excludes executables/scripts on purpose. Single source of truth for
 * web + mobile pickers and backend validation.
 */
export const CHAT_ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  'application/zip',
] as const;
/** Every MIME type accepted as a chat attachment (images ∪ files). */
export const CHAT_ALLOWED_ATTACHMENT_TYPES = [
  ...CHAT_ALLOWED_IMAGE_TYPES,
  ...CHAT_ALLOWED_FILE_TYPES,
] as const;

/** Returns the stored attachment kind for a MIME type, or null if unsupported. */
export function attachmentKindForMime(
  mime: string | undefined | null,
): 'image' | 'file' | null {
  if (!mime) return null;
  if ((CHAT_ALLOWED_IMAGE_TYPES as readonly string[]).includes(mime)) return 'image';
  if ((CHAT_ALLOWED_FILE_TYPES as readonly string[]).includes(mime)) return 'file';
  return null;
}

/**
 * Structured payload authored by the in-app scheduling assistant. Rendered by
 * the chat UI instead of a plain bubble. Discriminated on `kind`. All display
 * strings arrive already localized by the backend (manager's locale); `value`
 * fields are stable tokens sent back verbatim as the next user message when a
 * chip/button is tapped. The message's `content` always carries a plain-text
 * fallback so push and payload-unaware clients degrade gracefully.
 *
 * NOTE: the backend does NOT consume @ai-scheduling/shared — it mirrors this
 * shape in its own TS type. Keep both in sync (see AssistantPayload backend).
 */
export const botOptionSchema = z.object({
  /** Localized chip label shown to the manager. */
  label: z.string(),
  /** Stable token echoed back as a user message when tapped. */
  value: z.string(),
});
export type BotOption = z.infer<typeof botOptionSchema>;

export const botSkippedSchema = z.object({
  employeeId: z.string(),
  employeeName: z.string().nullable().default(null),
  date: z.string(),
  reason: z.string(),
});

export const botPayloadSchema = z.discriminatedUnion('kind', [
  /** Plain assistant text (render `content`). */
  z.object({ kind: z.literal('text') }),
  /** A question with 2–10 tappable chips (hierarchical selection, name disambiguation). */
  z.object({
    kind: z.literal('options'),
    question: z.string(),
    options: z.array(botOptionSchema).min(2).max(10),
  }),
  /** Summary card requiring explicit Confirm / Cancel before a write. */
  z.object({
    kind: z.literal('confirm'),
    title: z.string(),
    lines: z.array(z.string()).default([]),
    warnings: z.array(z.string()).default([]),
    confirmLabel: z.string(),
    cancelLabel: z.string(),
    /** Tokens sent back as the user message on tap. */
    confirmValue: z.string(),
    cancelValue: z.string(),
  }),
  /** Job progress, updatable in place (same message row). */
  z.object({
    kind: z.literal('progress'),
    state: z.enum(['queued', 'generating']),
    label: z.string(),
  }),
  /** Outcome card for a completed operation. */
  z.object({
    kind: z.literal('result'),
    title: z.string(),
    success: z.boolean().default(true),
    created: z.number().nullable().default(null),
    replaced: z.number().nullable().default(null),
    skipped: z.array(botSkippedSchema).default([]),
    warnings: z.array(z.string()).default([]),
    /** Optional deep link to the schedule grid week (e.g. "/schedule?week=YYYY-MM-DD"). */
    link: z.string().nullable().default(null),
  }),
]);
export type BotPayload = z.infer<typeof botPayloadSchema>;

/** A chat message (GET /chat/rooms/:id/messages items, POST send response). */
export const chatMessageSchema = z.object({
  id: z.string(),
  roomId: z.string(),
  senderId: z.string().nullable(),
  senderName: z.string().nullable(),
  /** 'user' for human messages, 'assistant' for the scheduling bot. */
  senderType: z.enum(['user', 'assistant']).default('user'),
  content: z.string(),
  createdAt: z.string(),
  attachmentUrl: z.string().nullable().default(null),
  attachmentType: z.enum(['image', 'file']).nullable().default(null),
  attachmentName: z.string().nullable().default(null),
  /** Attachment size in bytes (for the download card); null when no attachment. */
  attachmentSize: z.number().nullable().default(null),
  /** Structured assistant payload; null for ordinary messages. */
  botPayload: botPayloadSchema.nullable().default(null),
  /** The quoted message this one replies to (preview), or null. */
  replyTo: z
    .object({
      id: z.string(),
      content: z.string(),
      senderName: z.string().nullable(),
    })
    .nullable()
    .default(null),
  /** Set when the sender edited the message. */
  editedAt: z.string().nullable().default(null),
  /** Set when the sender soft-deleted the message (content hidden). */
  deletedAt: z.string().nullable().default(null),
  /** Emoji reactions aggregated per emoji (mine = the current user reacted). */
  reactions: z
    .array(
      z.object({
        emoji: z.string(),
        count: z.number(),
        mine: z.boolean(),
      }),
    )
    .default([]),
});
export type ChatMessage = z.infer<typeof chatMessageSchema>;

/** POST /chat/rooms/:id/messages/:msgId/reactions body — toggles the emoji. */
export const reactionInputSchema = z.object({ emoji: z.string().min(1).max(16) });
export type ReactionInput = z.infer<typeof reactionInputSchema>;

/** Curated quick-react set (WhatsApp-style). */
export const CHAT_QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'] as const;

/** A coworker to start a chat with (GET /chat/contacts). */
export const chatContactSchema = z.object({ id: z.string(), name: z.string() });
export type ChatContact = z.infer<typeof chatContactSchema>;

/** A group member (GET /chat/rooms/:id/members). */
export const chatMemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.enum(['member', 'admin']),
});
export type ChatMember = z.infer<typeof chatMemberSchema>;

/** A room in the user's chat list (GET /chat/rooms). */
export const chatRoomSchema = z.object({
  id: z.string(),
  type: z.enum(['dm', 'group', 'assistant']),
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
  /** Member muted push for this room. */
  muted: z.boolean().default(false),
});
export type ChatRoom = z.infer<typeof chatRoomSchema>;

/** POST /chat/rooms/:id/messages body. */
export const sendMessageInputSchema = z.object({
  content: z.string().max(4000).optional(),
  clientUuid: z.string().optional(),
  attachmentPath: z.string().optional(),
  attachmentType: z.enum(['image', 'file']).optional(),
  attachmentName: z.string().optional(),
  /** Attachment size in bytes — required when an attachment is sent (quota). */
  attachmentSize: z.number().int().nonnegative().optional(),
  /** Assistant rooms: stable token behind a tapped chip / confirm button. */
  botValue: z.string().optional(),
  /** Reply: the message id being quoted. */
  replyToId: z.string().optional(),
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

/** Socket payload for 'ChatMessageUpdated' (edit / delete). */
export const chatMessageUpdatedEventSchema = z.object({
  roomId: z.string(),
  message: chatMessageSchema,
});
export type ChatMessageUpdatedEvent = z.infer<typeof chatMessageUpdatedEventSchema>;

/** Socket payload for the 'ChatTyping' event. */
export const chatTypingEventSchema = z.object({
  roomId: z.string(),
  employeeId: z.string(),
  name: z.string(),
});
export type ChatTypingEvent = z.infer<typeof chatTypingEventSchema>;

/** A member's read cursor (GET /chat/rooms/:id/reads). */
export const chatReadSchema = z.object({
  employeeId: z.string(),
  lastReadAt: z.string().nullable(),
});
export type ChatRead = z.infer<typeof chatReadSchema>;

/** Socket payload for the 'ChatRead' event (someone read a room). */
export const chatReadEventSchema = z.object({
  roomId: z.string(),
  employeeId: z.string(),
  lastReadAt: z.string(),
});
export type ChatReadEvent = z.infer<typeof chatReadEventSchema>;
