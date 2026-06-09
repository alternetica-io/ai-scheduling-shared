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
  locationId: zod.z.string().nullable().default(null),
  locationName: zod.z.string().nullable().default(null)
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
var clockEventTypeSchema = zod.z.enum(["in", "out", "break_start", "break_end"]);
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
  photoUrl: zod.z.string().nullable()
});
var clockEventsSchema = zod.z.array(clockEventSchema);
var chatMessageSchema = zod.z.object({
  id: zod.z.string(),
  roomId: zod.z.string(),
  senderId: zod.z.string().nullable(),
  senderName: zod.z.string().nullable(),
  content: zod.z.string(),
  createdAt: zod.z.string(),
  attachmentUrl: zod.z.string().nullable().default(null),
  attachmentType: zod.z.enum(["image", "file"]).nullable().default(null),
  attachmentName: zod.z.string().nullable().default(null)
});
var chatContactSchema = zod.z.object({ id: zod.z.string(), name: zod.z.string() });
var chatMemberSchema = zod.z.object({
  id: zod.z.string(),
  name: zod.z.string(),
  role: zod.z.enum(["member", "admin"])
});
var chatRoomSchema = zod.z.object({
  id: zod.z.string(),
  type: zod.z.enum(["dm", "group"]),
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
  attachmentName: zod.z.string().optional()
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
var chatTypingEventSchema = zod.z.object({
  roomId: zod.z.string(),
  employeeId: zod.z.string(),
  name: zod.z.string()
});
var registerDeviceInputSchema = zod.z.object({
  token: zod.z.string().min(1),
  platform: zod.z.enum(["ios", "android"])
});

exports.chatContactSchema = chatContactSchema;
exports.chatMemberSchema = chatMemberSchema;
exports.chatMessageCreatedEventSchema = chatMessageCreatedEventSchema;
exports.chatMessageSchema = chatMessageSchema;
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
exports.registerDeviceInputSchema = registerDeviceInputSchema;
exports.scheduleAssignmentBreakSchema = scheduleAssignmentBreakSchema;
exports.scheduleAssignmentSchema = scheduleAssignmentSchema;
exports.scheduleAssignmentsSchema = scheduleAssignmentsSchema;
exports.sendMessageInputSchema = sendMessageInputSchema;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map