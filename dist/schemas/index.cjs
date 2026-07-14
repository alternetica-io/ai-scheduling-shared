'use strict';

var zod = require('zod');

// src/schemas/schedule.ts
var scheduleAssignmentBreakSchema = zod.z.object({
  id: zod.z.string(),
  startTime: zod.z.string(),
  endTime: zod.z.string(),
  isPaid: zod.z.boolean()
});
var scheduleAssignmentSchema = zod.z.object({
  id: zod.z.string(),
  employeeId: zod.z.string(),
  templateId: zod.z.string(),
  templateName: zod.z.string(),
  date: zod.z.string(),
  actualStartTime: zod.z.string(),
  actualEndTime: zod.z.string(),
  origin: zod.z.enum(["membership", "override", "exception"]),
  breaks: zod.z.array(scheduleAssignmentBreakSchema),
  confirmedAt: zod.z.string().nullable(),
  /** 'employee' (a mano) | 'system' (auto por ventana) | null (sin confirmar).
   *  Defaults tolerantes: si el backend aún no lo manda, el parse no rompe. */
  confirmedBy: zod.z.enum(["employee", "system"]).nullable().default(null),
  locationId: zod.z.string().nullable().default(null),
  locationName: zod.z.string().nullable().default(null),
  /** Estado de fichaje del turno (para pildoras de turnos pasados/en curso). */
  punchStatus: zod.z.enum(["none", "open", "closed", "no_show"]).default("none"),
  /** El empleado llegó tarde (fichaje de entrada con flag late_in). */
  late: zod.z.boolean().default(false),
  /** Inicio/fin PROGRAMADO original si el turno se ajustó a un fichaje real. */
  plannedStartTime: zod.z.string().nullable().default(null),
  plannedEndTime: zod.z.string().nullable().default(null)
});
var scheduleAssignmentsSchema = zod.z.array(scheduleAssignmentSchema);
var myProfileSchema = zod.z.object({
  id: zod.z.string(),
  name: zod.z.string(),
  role: zod.z.string().nullable(),
  phone: zod.z.string().nullable(),
  departmentId: zod.z.string().nullable(),
  email: zod.z.string().nullable(),
  companyName: zod.z.string().nullable(),
  /** IANA tz of the employee's branch (e.g. "America/Argentina/Buenos_Aires"). */
  timezone: zod.z.string().nullable()
});
var clockEventTypeSchema = zod.z.enum([
  "in",
  "out",
  "break_start",
  "break_end",
  "no_show"
]);
var clockGpsSchema = zod.z.object({
  lat: zod.z.number(),
  lng: zod.z.number(),
  accuracy: zod.z.number(),
  photoUrl: zod.z.string().optional()
});
var createClockEventInputSchema = zod.z.object({
  clientUuid: zod.z.string().min(1),
  type: clockEventTypeSchema,
  occurredAt: zod.z.string(),
  shiftAssignmentId: zod.z.string().optional(),
  /** Location to validate the geofence against (Locations feature). */
  locationId: zod.z.string().optional(),
  /** En un break_start: límite en minutos del descanso elegido (para overbreak).
   *  null/omitido = descanso sin límite (turno sin descanso configurado). */
  breakLimitMinutes: zod.z.number().nullable().optional(),
  gps: clockGpsSchema
});
var geoLocationSchema = zod.z.object({
  id: zod.z.string(),
  branchId: zod.z.string(),
  name: zod.z.string(),
  geofenceLat: zod.z.number(),
  geofenceLng: zod.z.number(),
  geofenceRadiusM: zod.z.number()
});
var myLocationsSchema = zod.z.object({
  mode: zod.z.enum(["fixed", "rotate"]),
  locations: zod.z.array(geoLocationSchema)
});
var clockValidationStatusSchema = zod.z.enum(["valid", "pending_review", "disputed"]);
var clockEventSchema = zod.z.object({
  id: zod.z.string(),
  type: clockEventTypeSchema,
  source: zod.z.string(),
  occurredAt: zod.z.string(),
  recordedAt: zod.z.string(),
  validationStatus: clockValidationStatusSchema,
  anomalyReason: zod.z.string().nullable(),
  shiftAssignmentId: zod.z.string().nullable(),
  lat: zod.z.number().nullable(),
  lng: zod.z.number().nullable(),
  accuracy: zod.z.number().nullable(),
  photoUrl: zod.z.string().nullable(),
  /** Límite (min) del descanso, presente en break_start. null = sin límite. */
  breakLimitMinutes: zod.z.number().nullable().default(null)
});
var clockEventsSchema = zod.z.array(clockEventSchema);
var CHAT_MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024;
var CHAT_ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp"
];
var botOptionSchema = zod.z.object({
  /** Localized chip label shown to the manager. */
  label: zod.z.string(),
  /** Stable token echoed back as a user message when tapped. */
  value: zod.z.string()
});
var botSkippedSchema = zod.z.object({
  employeeId: zod.z.string(),
  employeeName: zod.z.string().nullable().default(null),
  date: zod.z.string(),
  reason: zod.z.string()
});
var botPayloadSchema = zod.z.discriminatedUnion("kind", [
  /** Plain assistant text (render `content`). */
  zod.z.object({ kind: zod.z.literal("text") }),
  /** A question with 2–10 tappable chips (hierarchical selection, name disambiguation). */
  zod.z.object({
    kind: zod.z.literal("options"),
    question: zod.z.string(),
    options: zod.z.array(botOptionSchema).min(2).max(10)
  }),
  /** Summary card requiring explicit Confirm / Cancel before a write. */
  zod.z.object({
    kind: zod.z.literal("confirm"),
    title: zod.z.string(),
    lines: zod.z.array(zod.z.string()).default([]),
    warnings: zod.z.array(zod.z.string()).default([]),
    confirmLabel: zod.z.string(),
    cancelLabel: zod.z.string(),
    /** Tokens sent back as the user message on tap. */
    confirmValue: zod.z.string(),
    cancelValue: zod.z.string()
  }),
  /** Job progress, updatable in place (same message row). */
  zod.z.object({
    kind: zod.z.literal("progress"),
    state: zod.z.enum(["queued", "generating"]),
    label: zod.z.string()
  }),
  /** Outcome card for a completed operation. */
  zod.z.object({
    kind: zod.z.literal("result"),
    title: zod.z.string(),
    success: zod.z.boolean().default(true),
    created: zod.z.number().nullable().default(null),
    replaced: zod.z.number().nullable().default(null),
    skipped: zod.z.array(botSkippedSchema).default([]),
    warnings: zod.z.array(zod.z.string()).default([]),
    /** Optional deep link to the schedule grid week (e.g. "/schedule?week=YYYY-MM-DD"). */
    link: zod.z.string().nullable().default(null)
  })
]);
var chatMessageSchema = zod.z.object({
  id: zod.z.string(),
  roomId: zod.z.string(),
  senderId: zod.z.string().nullable(),
  senderName: zod.z.string().nullable(),
  /** 'user' for human messages, 'assistant' for the scheduling bot. */
  senderType: zod.z.enum(["user", "assistant"]).default("user"),
  content: zod.z.string(),
  createdAt: zod.z.string(),
  attachmentUrl: zod.z.string().nullable().default(null),
  attachmentType: zod.z.enum(["image", "file"]).nullable().default(null),
  attachmentName: zod.z.string().nullable().default(null),
  /** Structured assistant payload; null for ordinary messages. */
  botPayload: botPayloadSchema.nullable().default(null),
  /** The quoted message this one replies to (preview), or null. */
  replyTo: zod.z.object({
    id: zod.z.string(),
    content: zod.z.string(),
    senderName: zod.z.string().nullable()
  }).nullable().default(null),
  /** Set when the sender edited the message. */
  editedAt: zod.z.string().nullable().default(null),
  /** Set when the sender soft-deleted the message (content hidden). */
  deletedAt: zod.z.string().nullable().default(null),
  /** Emoji reactions aggregated per emoji (mine = the current user reacted). */
  reactions: zod.z.array(
    zod.z.object({
      emoji: zod.z.string(),
      count: zod.z.number(),
      mine: zod.z.boolean()
    })
  ).default([])
});
var reactionInputSchema = zod.z.object({ emoji: zod.z.string().min(1).max(16) });
var CHAT_QUICK_REACTIONS = ["\u{1F44D}", "\u2764\uFE0F", "\u{1F602}", "\u{1F62E}", "\u{1F622}", "\u{1F64F}"];
var chatContactSchema = zod.z.object({ id: zod.z.string(), name: zod.z.string() });
var chatMemberSchema = zod.z.object({
  id: zod.z.string(),
  name: zod.z.string(),
  role: zod.z.enum(["member", "admin"])
});
var chatRoomSchema = zod.z.object({
  id: zod.z.string(),
  type: zod.z.enum(["dm", "group", "assistant"]),
  title: zod.z.string(),
  memberCount: zod.z.number(),
  lastMessage: zod.z.object({
    content: zod.z.string(),
    createdAt: zod.z.string(),
    senderName: zod.z.string().nullable()
  }).nullable(),
  unreadCount: zod.z.number(),
  updatedAt: zod.z.string()
});
var sendMessageInputSchema = zod.z.object({
  content: zod.z.string().max(4e3).optional(),
  clientUuid: zod.z.string().optional(),
  attachmentPath: zod.z.string().optional(),
  attachmentType: zod.z.enum(["image", "file"]).optional(),
  attachmentName: zod.z.string().optional(),
  /** Assistant rooms: stable token behind a tapped chip / confirm button. */
  botValue: zod.z.string().optional(),
  /** Reply: the message id being quoted. */
  replyToId: zod.z.string().optional()
});
var createRoomInputSchema = zod.z.object({
  type: zod.z.enum(["dm", "group"]),
  memberId: zod.z.string().optional(),
  name: zod.z.string().max(120).optional(),
  memberIds: zod.z.array(zod.z.string()).optional()
});
var chatMessageCreatedEventSchema = zod.z.object({
  roomId: zod.z.string(),
  message: chatMessageSchema
});
var chatMessageUpdatedEventSchema = zod.z.object({
  roomId: zod.z.string(),
  message: chatMessageSchema
});
var chatTypingEventSchema = zod.z.object({
  roomId: zod.z.string(),
  employeeId: zod.z.string(),
  name: zod.z.string()
});
var chatReadSchema = zod.z.object({
  employeeId: zod.z.string(),
  lastReadAt: zod.z.string().nullable()
});
var chatReadEventSchema = zod.z.object({
  roomId: zod.z.string(),
  employeeId: zod.z.string(),
  lastReadAt: zod.z.string()
});
var registerDeviceInputSchema = zod.z.object({
  token: zod.z.string().min(1),
  platform: zod.z.enum(["ios", "android"])
});

exports.CHAT_ALLOWED_IMAGE_TYPES = CHAT_ALLOWED_IMAGE_TYPES;
exports.CHAT_MAX_ATTACHMENT_BYTES = CHAT_MAX_ATTACHMENT_BYTES;
exports.CHAT_QUICK_REACTIONS = CHAT_QUICK_REACTIONS;
exports.botOptionSchema = botOptionSchema;
exports.botPayloadSchema = botPayloadSchema;
exports.botSkippedSchema = botSkippedSchema;
exports.chatContactSchema = chatContactSchema;
exports.chatMemberSchema = chatMemberSchema;
exports.chatMessageCreatedEventSchema = chatMessageCreatedEventSchema;
exports.chatMessageSchema = chatMessageSchema;
exports.chatMessageUpdatedEventSchema = chatMessageUpdatedEventSchema;
exports.chatReadEventSchema = chatReadEventSchema;
exports.chatReadSchema = chatReadSchema;
exports.chatRoomSchema = chatRoomSchema;
exports.chatTypingEventSchema = chatTypingEventSchema;
exports.clockEventSchema = clockEventSchema;
exports.clockEventTypeSchema = clockEventTypeSchema;
exports.clockEventsSchema = clockEventsSchema;
exports.clockGpsSchema = clockGpsSchema;
exports.clockValidationStatusSchema = clockValidationStatusSchema;
exports.createClockEventInputSchema = createClockEventInputSchema;
exports.createRoomInputSchema = createRoomInputSchema;
exports.geoLocationSchema = geoLocationSchema;
exports.myLocationsSchema = myLocationsSchema;
exports.myProfileSchema = myProfileSchema;
exports.reactionInputSchema = reactionInputSchema;
exports.registerDeviceInputSchema = registerDeviceInputSchema;
exports.scheduleAssignmentBreakSchema = scheduleAssignmentBreakSchema;
exports.scheduleAssignmentSchema = scheduleAssignmentSchema;
exports.scheduleAssignmentsSchema = scheduleAssignmentsSchema;
exports.sendMessageInputSchema = sendMessageInputSchema;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map