import { z } from 'zod';

/**
 * Las solicitudes que afectan un día del calendario (refs orch #31).
 *
 * Diseño: `docs/design/solicitudes-en-el-horario.md` del orchestrator.
 *
 * Vive acá porque lo consumen la web (la grilla, front #18) y el móvil (el
 * horario, front #19). El backend tiene su propia copia del tipo: no depende de
 * este paquete, y hacerlo depender sería desproporcionado. Las dos copias están
 * cubiertas por tests que afirman el mismo contrato.
 */

/**
 * `catchall` NO es decoración: un tipo nuevo del backend tiene que poder
 * aparecer sin romper el parse. Que se muestre con una etiqueta genérica es
 * recuperable; que haga desaparecer la solicitud del horario es el bug
 * original (un día pedido que se ve como un día libre).
 */
export const requestKindSchema = z
  .enum(['day_off', 'absence', 'swap', 'incident', 'correction'])
  .catch('incident');

export const requestDecisionSchema = z
  .enum(['undecided', 'accepted', 'rejected'])
  .catch('undecided');

export const dayNoteSchema = z.object({
  employeeId: z.string(),
  /** `YYYY-MM-DD`. Una solicitud de cinco días trae cinco notas. */
  date: z.string(),
  kind: requestKindSchema,
  /** Qué decidió el manager. */
  decision: requestDecisionSchema,
  /**
   * El día YA está afectado, con decisión o sin ella.
   *
   * Es el segundo eje, y existe porque una ausencia reportada está en efecto
   * desde el momento en que se reporta —la persona no viene— mientras un día
   * libre pendiente todavía no afecta nada. Mezclarlos haría que la grilla
   * trate una ausencia como "todavía nada".
   */
  inEffect: z.boolean(),
  requestId: z.string(),
  rangeStart: z.string(),
  rangeEnd: z.string(),
  /** El tipo quita o reasigna turnos. Lo decide el backend. */
  blocksShifts: z.boolean(),
});

export type DayNote = z.infer<typeof dayNoteSchema>;
export type RequestKind = z.infer<typeof requestKindSchema>;
export type RequestDecision = z.infer<typeof requestDecisionSchema>;

/** Parse tolerante de la lista: una nota corrupta no tira las demás. */
export function parseDayNotes(data: unknown): DayNote[] {
  if (!Array.isArray(data)) return [];
  return data
    .map((d) => dayNoteSchema.safeParse(d))
    .filter((r): r is { success: true; data: DayNote } => r.success)
    .map((r) => r.data);
}
