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
  gps: clockGpsSchema
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

export { clockEventSchema, clockEventTypeSchema, clockEventsSchema, clockGpsSchema, clockValidationStatusSchema, createClockEventInputSchema, myProfileSchema, scheduleAssignmentBreakSchema, scheduleAssignmentSchema, scheduleAssignmentsSchema };
//# sourceMappingURL=chunk-XDMNBBV5.js.map
//# sourceMappingURL=chunk-XDMNBBV5.js.map