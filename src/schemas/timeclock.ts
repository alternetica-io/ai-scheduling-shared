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
  gps: clockGpsSchema,
});
export type CreateClockEventInput = z.infer<typeof createClockEventInputSchema>;

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
