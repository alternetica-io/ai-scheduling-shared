import { z } from 'zod';

// src/schemas/schedule.ts
var scheduleAssignmentBreakSchema = z.object({
  id: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  isPaid: z.boolean()
});
var scheduleAssignmentSchema = z.object({
  id: z.string(),
  employeeId: z.string(),
  templateId: z.string(),
  templateName: z.string(),
  date: z.string(),
  actualStartTime: z.string(),
  actualEndTime: z.string(),
  origin: z.enum(["membership", "override", "exception"]),
  breaks: z.array(scheduleAssignmentBreakSchema),
  confirmedAt: z.string().nullable(),
  /** 'employee' (a mano) | 'system' (auto por ventana) | null (sin confirmar).
   *  Defaults tolerantes: si el backend aún no lo manda, el parse no rompe. */
  confirmedBy: z.enum(["employee", "system"]).nullable().default(null),
  locationId: z.string().nullable().default(null),
  locationName: z.string().nullable().default(null),
  /** Estado de fichaje del turno (para pildoras de turnos pasados/en curso). */
  punchStatus: z.enum(["none", "open", "closed", "no_show"]).default("none"),
  /** El empleado llegó tarde (fichaje de entrada con flag late_in). */
  late: z.boolean().default(false),
  /** Inicio/fin PROGRAMADO original si el turno se ajustó a un fichaje real. */
  plannedStartTime: z.string().nullable().default(null),
  plannedEndTime: z.string().nullable().default(null)
});
var scheduleAssignmentsSchema = z.array(scheduleAssignmentSchema);
var myProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string().nullable(),
  phone: z.string().nullable(),
  departmentId: z.string().nullable(),
  email: z.string().nullable(),
  companyName: z.string().nullable(),
  /** IANA tz of the employee's branch (e.g. "America/Argentina/Buenos_Aires"). */
  timezone: z.string().nullable()
});
var clockEventTypeSchema = z.enum([
  "in",
  "out",
  "break_start",
  "break_end",
  "no_show"
]);
var clockGpsSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  accuracy: z.number(),
  photoUrl: z.string().optional()
});
var createClockEventInputSchema = z.object({
  clientUuid: z.string().min(1),
  type: clockEventTypeSchema,
  occurredAt: z.string(),
  shiftAssignmentId: z.string().optional(),
  /** Location to validate the geofence against (Locations feature). */
  locationId: z.string().optional(),
  /** En un break_start: límite en minutos del descanso elegido (para overbreak).
   *  null/omitido = descanso sin límite (turno sin descanso configurado). */
  breakLimitMinutes: z.number().nullable().optional(),
  gps: clockGpsSchema
});
var geoLocationSchema = z.object({
  id: z.string(),
  branchId: z.string(),
  name: z.string(),
  geofenceLat: z.number(),
  geofenceLng: z.number(),
  geofenceRadiusM: z.number()
});
var myLocationsSchema = z.object({
  mode: z.enum(["fixed", "rotate"]),
  locations: z.array(geoLocationSchema)
});
var clockValidationStatusSchema = z.enum(["valid", "pending_review", "disputed"]);
var clockEventSchema = z.object({
  id: z.string(),
  type: clockEventTypeSchema,
  source: z.string(),
  occurredAt: z.string(),
  recordedAt: z.string(),
  validationStatus: clockValidationStatusSchema,
  anomalyReason: z.string().nullable(),
  shiftAssignmentId: z.string().nullable(),
  lat: z.number().nullable(),
  lng: z.number().nullable(),
  accuracy: z.number().nullable(),
  photoUrl: z.string().nullable(),
  /** Límite (min) del descanso, presente en break_start. null = sin límite. */
  breakLimitMinutes: z.number().nullable().default(null)
});
var clockEventsSchema = z.array(clockEventSchema);
var CHAT_MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024;
var CHAT_ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp"
];
var botOptionSchema = z.object({
  /** Localized chip label shown to the manager. */
  label: z.string(),
  /** Stable token echoed back as a user message when tapped. */
  value: z.string()
});
var botSkippedSchema = z.object({
  employeeId: z.string(),
  employeeName: z.string().nullable().default(null),
  date: z.string(),
  reason: z.string()
});
var botPayloadSchema = z.discriminatedUnion("kind", [
  /** Plain assistant text (render `content`). */
  z.object({ kind: z.literal("text") }),
  /** A question with 2–10 tappable chips (hierarchical selection, name disambiguation). */
  z.object({
    kind: z.literal("options"),
    question: z.string(),
    options: z.array(botOptionSchema).min(2).max(10)
  }),
  /** Summary card requiring explicit Confirm / Cancel before a write. */
  z.object({
    kind: z.literal("confirm"),
    title: z.string(),
    lines: z.array(z.string()).default([]),
    warnings: z.array(z.string()).default([]),
    confirmLabel: z.string(),
    cancelLabel: z.string(),
    /** Tokens sent back as the user message on tap. */
    confirmValue: z.string(),
    cancelValue: z.string()
  }),
  /** Job progress, updatable in place (same message row). */
  z.object({
    kind: z.literal("progress"),
    state: z.enum(["queued", "generating"]),
    label: z.string()
  }),
  /** Outcome card for a completed operation. */
  z.object({
    kind: z.literal("result"),
    title: z.string(),
    success: z.boolean().default(true),
    created: z.number().nullable().default(null),
    replaced: z.number().nullable().default(null),
    skipped: z.array(botSkippedSchema).default([]),
    warnings: z.array(z.string()).default([]),
    /** Optional deep link to the schedule grid week (e.g. "/schedule?week=YYYY-MM-DD"). */
    link: z.string().nullable().default(null)
  })
]);
var chatMessageSchema = z.object({
  id: z.string(),
  roomId: z.string(),
  senderId: z.string().nullable(),
  senderName: z.string().nullable(),
  /** 'user' for human messages, 'assistant' for the scheduling bot. */
  senderType: z.enum(["user", "assistant"]).default("user"),
  content: z.string(),
  createdAt: z.string(),
  attachmentUrl: z.string().nullable().default(null),
  attachmentType: z.enum(["image", "file"]).nullable().default(null),
  attachmentName: z.string().nullable().default(null),
  /** Structured assistant payload; null for ordinary messages. */
  botPayload: botPayloadSchema.nullable().default(null),
  /** The quoted message this one replies to (preview), or null. */
  replyTo: z.object({
    id: z.string(),
    content: z.string(),
    senderName: z.string().nullable()
  }).nullable().default(null),
  /** Set when the sender edited the message. */
  editedAt: z.string().nullable().default(null),
  /** Set when the sender soft-deleted the message (content hidden). */
  deletedAt: z.string().nullable().default(null)
});
var chatContactSchema = z.object({ id: z.string(), name: z.string() });
var chatMemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.enum(["member", "admin"])
});
var chatRoomSchema = z.object({
  id: z.string(),
  type: z.enum(["dm", "group", "assistant"]),
  title: z.string(),
  memberCount: z.number(),
  lastMessage: z.object({
    content: z.string(),
    createdAt: z.string(),
    senderName: z.string().nullable()
  }).nullable(),
  unreadCount: z.number(),
  updatedAt: z.string()
});
var sendMessageInputSchema = z.object({
  content: z.string().max(4e3).optional(),
  clientUuid: z.string().optional(),
  attachmentPath: z.string().optional(),
  attachmentType: z.enum(["image", "file"]).optional(),
  attachmentName: z.string().optional(),
  /** Assistant rooms: stable token behind a tapped chip / confirm button. */
  botValue: z.string().optional(),
  /** Reply: the message id being quoted. */
  replyToId: z.string().optional()
});
var createRoomInputSchema = z.object({
  type: z.enum(["dm", "group"]),
  memberId: z.string().optional(),
  name: z.string().max(120).optional(),
  memberIds: z.array(z.string()).optional()
});
var chatMessageCreatedEventSchema = z.object({
  roomId: z.string(),
  message: chatMessageSchema
});
var chatMessageUpdatedEventSchema = z.object({
  roomId: z.string(),
  message: chatMessageSchema
});
var chatTypingEventSchema = z.object({
  roomId: z.string(),
  employeeId: z.string(),
  name: z.string()
});
var chatReadSchema = z.object({
  employeeId: z.string(),
  lastReadAt: z.string().nullable()
});
var chatReadEventSchema = z.object({
  roomId: z.string(),
  employeeId: z.string(),
  lastReadAt: z.string()
});
var registerDeviceInputSchema = z.object({
  token: z.string().min(1),
  platform: z.enum(["ios", "android"])
});

export { CHAT_ALLOWED_IMAGE_TYPES, CHAT_MAX_ATTACHMENT_BYTES, botOptionSchema, botPayloadSchema, botSkippedSchema, chatContactSchema, chatMemberSchema, chatMessageCreatedEventSchema, chatMessageSchema, chatMessageUpdatedEventSchema, chatReadEventSchema, chatReadSchema, chatRoomSchema, chatTypingEventSchema, clockEventSchema, clockEventTypeSchema, clockEventsSchema, clockGpsSchema, clockValidationStatusSchema, createClockEventInputSchema, createRoomInputSchema, geoLocationSchema, myLocationsSchema, myProfileSchema, registerDeviceInputSchema, scheduleAssignmentBreakSchema, scheduleAssignmentSchema, scheduleAssignmentsSchema, sendMessageInputSchema };
//# sourceMappingURL=chunk-RS46EGPX.js.map
//# sourceMappingURL=chunk-RS46EGPX.js.map