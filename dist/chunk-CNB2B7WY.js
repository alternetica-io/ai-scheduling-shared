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
  confirmedAt: z.string().nullable()
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
var clockEventTypeSchema = z.enum(["in", "out", "break_start", "break_end"]);
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
  photoUrl: z.string().nullable()
});
var clockEventsSchema = z.array(clockEventSchema);
var chatMessageSchema = z.object({
  id: z.string(),
  roomId: z.string(),
  senderId: z.string().nullable(),
  senderName: z.string().nullable(),
  content: z.string(),
  createdAt: z.string(),
  attachmentUrl: z.string().nullable().default(null),
  attachmentType: z.enum(["image", "file"]).nullable().default(null),
  attachmentName: z.string().nullable().default(null)
});
var chatContactSchema = z.object({ id: z.string(), name: z.string() });
var chatRoomSchema = z.object({
  id: z.string(),
  type: z.enum(["dm", "group"]),
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
  attachmentName: z.string().optional()
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

export { chatContactSchema, chatMessageCreatedEventSchema, chatMessageSchema, chatRoomSchema, clockEventSchema, clockEventTypeSchema, clockEventsSchema, clockGpsSchema, clockValidationStatusSchema, createClockEventInputSchema, createRoomInputSchema, geoLocationSchema, myLocationsSchema, myProfileSchema, scheduleAssignmentBreakSchema, scheduleAssignmentSchema, scheduleAssignmentsSchema, sendMessageInputSchema };
//# sourceMappingURL=chunk-CNB2B7WY.js.map
//# sourceMappingURL=chunk-CNB2B7WY.js.map