import { z } from 'zod';

/** Mirrors the orchestrator timeclock controller (Sprint 2, GPS + selfie). */

export const clockEventTypeSchema = z.enum(['in', 'out', 'break_start', 'break_end']);
export type ClockEventType = z.infer<typeof clockEventTypeSchema>;

export const clockGpsSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  accuracy: z.number(),
  photoUrl: z.string().optional(),
});

/** POST /timeclock/events body. */
export const createClockEventInputSchema = z.object({
  clientUuid: z.string().min(1),
  type: clockEventTypeSchema,
  occurredAt: z.string(),
  shiftAssignmentId: z.string().optional(),
  /** Location to validate the geofence against (Locations feature). */
  locationId: z.string().optional(),
  gps: clockGpsSchema,
});
export type CreateClockEventInput = z.infer<typeof createClockEventInputSchema>;

/** A location with its geofence (GET /employees/me/locations items). */
export const geoLocationSchema = z.object({
  id: z.string(),
  branchId: z.string(),
  name: z.string(),
  geofenceLat: z.number(),
  geofenceLng: z.number(),
  geofenceRadiusM: z.number(),
});
export type GeoLocation = z.infer<typeof geoLocationSchema>;

/** GET /employees/me/locations — the employee's allowed locations + mode. */
export const myLocationsSchema = z.object({
  mode: z.enum(['fixed', 'rotate']),
  locations: z.array(geoLocationSchema),
});
export type MyLocations = z.infer<typeof myLocationsSchema>;

export const clockValidationStatusSchema = z.enum(['valid', 'pending_review', 'disputed']);
export type ClockValidationStatus = z.infer<typeof clockValidationStatusSchema>;

/** Timeclock event as returned by the API. */
export const clockEventSchema = z.object({
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
});
export const clockEventsSchema = z.array(clockEventSchema);
export type ClockEvent = z.infer<typeof clockEventSchema>;
