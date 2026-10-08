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
    .enum(['none', 'not_started', 'open', 'closed', 'no_show'])
    .default('none'),
  /** El empleado llegó tarde (fichaje de entrada con flag late_in). */
  late: z.boolean().default(false),
  /** Inicio/fin PROGRAMADO original si el turno se ajustó a un fichaje real. */
  plannedStartTime: z.string().nullable().default(null),
  plannedEndTime: z.string().nullable().default(null),
  /** Tags aplicados al turno (catálogo por tenant). Incluye el "Manual"
   *  auto-stampeado en turnos retroactivos. Default tolerante. */
  tagIds: z.array(z.string()).default([]),
});

export const scheduleAssignmentsSchema = z.array(scheduleAssignmentSchema);

export type ScheduleAssignmentBreak = z.infer<typeof scheduleAssignmentBreakSchema>;
export type ScheduleAssignment = z.infer<typeof scheduleAssignmentSchema>;

/** Mirrors GET /employees/me. */
export const myProfileSchema = z.object({
  id: z.string(),
  // nullish por transición: un backend viejo (sin companyId) no debe romper el
  // parse del perfil en el móvil. El backend nuevo siempre lo devuelve.
  companyId: z.string().nullish(),
  name: z.string(),
  role: z.string().nullable(),
  phone: z.string().nullable(),
  departmentId: z.string().nullable(),
  email: z.string().nullable(),
  companyName: z.string().nullable(),
  /**
   * Nombre de la sucursal del empleado. El móvil lo muestra en el encabezado
   * del horario, donde antes había un nombre escrito a mano en el archivo de
   * traducción (móvil #10).
   *
   * `nullish` por dos motivos distintos, y los dos importan: un backend viejo
   * no lo manda —el móvil se actualiza por OTA y conviven versiones— y un
   * empleado sin departamento no tiene sucursal que mostrar.
   */
  branchName: z.string().nullish(),
  /** IANA tz of the employee's branch (e.g. "America/Argentina/Buenos_Aires"). */
  timezone: z.string().nullable(),
  /**
   * Zona de la EMPRESA: respaldo cuando la sucursal del empleado no tiene la
   * suya. Nullish por transición con backends viejos.
   */
  companyTimezone: z.string().nullish(),
  /**
   * Primer día de la semana del tenant. Con default para que un backend viejo
   * (que todavía no lo devuelve) no rompa el parse del perfil — el móvil lo
   * necesita para no hardcodear el lunes.
   */
  weekStartsOn: z.enum(['sunday', 'monday']).default('monday'),
});

export type MyProfile = z.infer<typeof myProfileSchema>;
