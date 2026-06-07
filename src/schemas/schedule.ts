import { z } from 'zod';

/**
 * Mirrors the orchestrator's CompanyScheduleAssignmentDTO
 * (src/application/handlers/get-company-schedule.handler.ts). Returned by
 * GET /schedules and GET /employees/me/schedule. Times are ISO UTC; `date`
 * is the logical YYYY-MM-DD slot date.
 */
export const scheduleAssignmentBreakSchema = z.object({
  id: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  isPaid: z.boolean(),
});

export const scheduleAssignmentSchema = z.object({
  id: z.string(),
  employeeId: z.string(),
  templateId: z.string(),
  templateName: z.string(),
  date: z.string(),
  actualStartTime: z.string(),
  actualEndTime: z.string(),
  origin: z.enum(['membership', 'override', 'exception']),
  breaks: z.array(scheduleAssignmentBreakSchema),
  confirmedAt: z.string().nullable(),
});

export const scheduleAssignmentsSchema = z.array(scheduleAssignmentSchema);

export type ScheduleAssignmentBreak = z.infer<typeof scheduleAssignmentBreakSchema>;
export type ScheduleAssignment = z.infer<typeof scheduleAssignmentSchema>;

/** Mirrors GET /employees/me. */
export const myProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string().nullable(),
  phone: z.string().nullable(),
  departmentId: z.string().nullable(),
  email: z.string().nullable(),
  companyName: z.string().nullable(),
});

export type MyProfile = z.infer<typeof myProfileSchema>;
