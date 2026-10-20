/**
 * The sentence an employee reads, in "My attendance", about how a supervisor
 * resolved one of their punches (orch #2, phase 4). Design:
 * ai-scheduling-orchestrator docs/design/attendance-anomalies-redesign.md,
 * "El empleado lo ve, con una frase".
 *
 * Never the bare number ("effective minutes: 480"): the sentence says what
 * happened, in the first person, with the times in it. The manager sees a
 * different text when deciding ("Count from the scheduled time"); this one is
 * the employee's, afterwards. Web and mobile share it, so the wording lives in
 * the shared `common` namespace under `resolutionExplained`.
 */

/** One decision that moved a punch's time, as GET /timeclock/me/attendance sends it. */
export interface ShiftResolutionNote {
  /** The verb chosen (`count_from_schedule`, `count_as_overtime`…). */
  action: string;
  /** The punch resolved: `in`, `out`, `break_start`, `break_end`. */
  punchType: string;
  /** The punch as recorded, wall-clock ISO. */
  punchAt: string;
  /** The time that counts instead, wall-clock ISO; `null` = the punch counts. */
  countedAt: string | null;
  overtimeMinutes: number;
  /** Positive: break minutes that are paid; negative: deducted. */
  breakAdjustMinutes: number;
}

export interface ResolutionExplanation {
  /** i18n key in the `common` namespace. */
  key: string;
  /** Interpolation values; `count` drives the plural. */
  values: { punch?: string; counted?: string; count?: number };
}

/**
 * The i18n key and values for a decision, or `null` for an action this version
 * does not know how to explain (an app older than the backend): showing nothing
 * beats showing a wrong sentence.
 *
 * `formatTime` turns a wall-clock ISO into the time the app shows ("8:20").
 */
export function explainResolution(
  note: ShiftResolutionNote,
  formatTime: (wallClockIso: string) => string,
): ResolutionExplanation | null {
  const k = (key: string) => `resolutionExplained.${key}`;
  const entrada = note.punchType === "in";
  const punch = formatTime(note.punchAt);
  const counted = note.countedAt ? formatTime(note.countedAt) : null;
  // When the decision left the punch as it was (the punch was already inside
  // the schedule), the honest sentence is that it counted as recorded.
  const comoSeRegistro = (): ResolutionExplanation => ({
    key: k(entrada ? "asWorkedIn" : "asWorkedOut"),
    values: { punch },
  });

  switch (note.action) {
    case "count_from_schedule":
      return counted
        ? { key: k("fromSchedule"), values: { punch, counted } }
        : comoSeRegistro();
    case "count_to_schedule":
      return counted
        ? { key: k("toSchedule"), values: { punch, counted } }
        : comoSeRegistro();
    case "count_as_worked":
      return comoSeRegistro();
    case "count_as_overtime":
      return {
        key: k(entrada ? "overtimeBefore" : "overtimeAfter"),
        values: { count: note.overtimeMinutes },
      };
    case "accept_as_is":
      return {
        key: k(entrada ? "acceptedLateIn" : "acceptedEarlyOut"),
        values: { punch },
      };
    case "excuse_to_schedule":
      return counted
        ? {
            key: k(entrada ? "excusedIn" : "excusedOut"),
            values: { punch, counted },
          }
        : comoSeRegistro();
    case "allow":
      return {
        key: k("breakAllowed"),
        values: { count: Math.abs(note.breakAdjustMinutes) },
      };
    case "deduct_excess":
      return { key: k("breakExcessDeducted"), values: {} };
    case "pay_as_worked":
      return { key: k("breakPaidAsWorked"), values: {} };
    case "deduct_planned":
      return {
        key: k("breakPlannedDeducted"),
        values: { count: Math.abs(note.breakAdjustMinutes) },
      };
    default:
      return null;
  }
}
