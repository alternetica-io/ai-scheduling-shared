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
  /** 'employee' (a mano) | 'system' (auto por ventana) | null (sin confirmar).
   *  Defaults tolerantes: si el backend aún no lo manda, el parse no rompe. */
  confirmedBy: z.enum(['employee', 'system']).nullable().default(null),
  locationId: z.string().nullable().default(null),
  locationName: z.string().nullable().default(null),
  /** Estado de fichaje del turno (para pildoras de turnos pasados/en curso). */
  punchStatus: z
    .enum(['none', 'open', 'closed', 'no_show'])
    .default('none'),
  /** El empleado llegó tarde (fichaje de entrada con flag late_in). */
  late: z.boolean().default(false),
  /** Inicio/fin PROGRAMADO original si el turno se ajustó a un fichaje real. */
  plannedStartTime: z.string().nullable().default(null),
  plannedEndTime: z.string().nullable().default(null),
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
  /** IANA tz of the employee's branch (e.g. "America/Argentina/Buenos_Aires"). */
  timezone: z.string().nullable(),
});

export type MyProfile = z.infer<typeof myProfileSchema>;
