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
  confirmedAt: zod.z.string().nullable()
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

exports.clockEventSchema = clockEventSchema;
exports.clockEventTypeSchema = clockEventTypeSchema;
exports.clockEventsSchema = clockEventsSchema;
exports.clockGpsSchema = clockGpsSchema;
exports.clockValidationStatusSchema = clockValidationStatusSchema;
exports.createClockEventInputSchema = createClockEventInputSchema;
exports.geoLocationSchema = geoLocationSchema;
exports.myLocationsSchema = myLocationsSchema;
exports.myProfileSchema = myProfileSchema;
exports.scheduleAssignmentBreakSchema = scheduleAssignmentBreakSchema;
exports.scheduleAssignmentSchema = scheduleAssignmentSchema;
exports.scheduleAssignmentsSchema = scheduleAssignmentsSchema;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map