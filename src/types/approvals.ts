/**
 * Tipos compartidos del grupo Approvals (Incidents, Swap Requests,
 * Absence Reports, Day Off Requests).
 */

// ─── Contexto de turno para las cards ─────────────────────────────────────────

/**
 * Resumen del turno al que aplica una solicitud (para dar contexto en las
 * cards de approvals: qué día, qué horario, qué rol). Lo devuelve el backend
 * enriquecido en swap/day-off/absence.
 */
export interface ApprovalShiftRef {
  /** YYYY-MM-DD (fecha lógica del slot). */
  date: string;
  /** ISO datetime UTC — inicio real. */
  start: string;
  /** ISO datetime UTC — fin real. */
  end: string;
  /** Nombre del template (rol), o null si fue borrado. */
  role: string | null;
}

/**
 * Formatea un `ApprovalShiftRef` para mostrar — única fuente para web y móvil.
 * Devuelve las partes (día / rango horario) para que cada plataforma componga
 * su layout. Horas en la tz local del dispositivo (consistente con el resto
 * de la UI de turnos).
 */
export function formatShiftRef(
  ref: ApprovalShiftRef,
  locale: string,
): { day: string; time: string } {
  // Los horarios se guardan como wall-clock metido en UTC (07:00 → "07:00Z"),
  // como en el grid. Mostramos los componentes UTC (NO toLocaleTimeString, que
  // convertiría a la tz del dispositivo y desfasaría las horas).
  const pad = (n: number) => String(n).padStart(2, '0');
  const t = (iso: string) => {
    const d = new Date(iso);
    return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
  };
  return {
    day: new Date(`${ref.date}T00:00:00`).toLocaleDateString(locale, {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    }),
    time: `${t(ref.start)} – ${t(ref.end)}`,
  };
}

// ─── Incident ─────────────────────────────────────────────────────────────────

export type IncidentType =
  /** Reporte libre del empleado (sin tipo); el texto va en `message`. */
  | 'GENERAL'
  | 'MEDICAL_LEAVE'
  | 'EMERGENCY_LEAVE'
  | 'SHIFT_SWAP_REQUEST'
  | 'LATE'
  | 'NO_SHOW'
  | 'BIOMETRIC_MISS';

export type IncidentStatus =
  | 'reported'
  | 'document_received'
  | 'pending_ocr'
  | 'processing_ocr'
  | 'pending_validation'
  | 'validated'
  | 'rejected'
  | 'repair_in_progress'
  | 'replacement_pending'
  | 'replacement_assigned'
  | 'resolved';

export interface Incident {
  id: string;
  companyId: string;
  employeeId: string;
  type: IncidentType;
  status: IncidentStatus;
  evidenceUrl: string | null;
  ocrText?: string | null;
  ocrConfidence: number | null;
  validated: boolean;
  startDate: string | null;
  endDate: string | null;
  /** Texto libre que reportó el empleado (Fase 2). */
  message?: string | null;
  /** Turno del empleado el día del incidente (startDate), o null. Backend enriquecido. */
  shift?: ApprovalShiftRef | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIncidentPayload {
  employeeId: string;
  message?: string;
  mediaUrl?: string;
}

// ─── ShiftSwapRequest ─────────────────────────────────────────────────────────

export type ShiftSwapRequestStatus = 'pending' | 'accepted' | 'rejected';

export interface ShiftSwapRequest {
  id: string;
  companyId: string;
  requesterId: string;
  targetId: string;
  assignmentId: string | null;
  status: ShiftSwapRequestStatus;
  createdAt: string;
  /** Turno que se intercambia (del requester). Backend enriquecido. */
  shift?: ApprovalShiftRef | null;
  /** Turno del target ese día, o null = sin turno. Backend enriquecido. */
  targetShift?: ApprovalShiftRef | null;
}

export interface CreateShiftSwapRequestPayload {
  requesterId: string;
  targetId: string;
  assignmentId?: string | null;
}

// ─── AbsenceReport ────────────────────────────────────────────────────────────

export interface AbsenceReport {
  id: string;
  companyId: string;
  employeeId: string;
  assignmentId: string | null;
  reason: string;
  isUrgent: boolean;
  /** Phase 17 — período de la ausencia. Single-day cuando start === end. */
  startDate: string;
  endDate: string;
  reportedAt: string;
  /** Turno al que aplica, o null = sin turno. Backend enriquecido. */
  shift?: ApprovalShiftRef | null;
}

export interface CreateAbsenceReportPayload {
  employeeId: string;
  assignmentId?: string | null;
  reason: string;
  isUrgent?: boolean;
  /** YYYY-MM-DD. Default backend = hoy. */
  startDate?: string;
  /** YYYY-MM-DD. Default backend = startDate. */
  endDate?: string;
}

// ─── DayOffRequest ────────────────────────────────────────────────────────────

export type DayOffRequestStatus = 'pending' | 'approved' | 'rejected';

export interface DayOffRequest {
  id: string;
  companyId: string;
  employeeId: string;
  /** YYYY-MM-DD */
  date: string;
  reason: string;
  status: DayOffRequestStatus;
  createdAt: string;
  /** Turno que el empleado pierde ese día, o null = sin turno. Backend enriquecido. */
  shift?: ApprovalShiftRef | null;
}

export interface CreateDayOffRequestPayload {
  employeeId: string;
  date: string;
  reason: string;
}
