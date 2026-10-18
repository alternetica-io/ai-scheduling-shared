/**
 * En qué paso va una generación de horario (orch #50). Lo emite el backend
 * por el socket (`ScheduleGenerationProgress`) y lo traduce cada cliente.
 * Misma forma que `GenerationStep` del orquestador.
 */
export type GenerationStep =
  | { kind: 'loading' }
  | { kind: 'translating-rules' }
  | { kind: 'proposing'; attempt: number; totalAttempts: number }
  | { kind: 'verifying'; attempt: number; totalAttempts: number }
  | { kind: 'repairing'; attempt: number; totalAttempts: number }
  | { kind: 'persisting' };

export interface ScheduleGenerationProgressEvent {
  companyId: string;
  weekStart: string;
  jobId: string;
  step: GenerationStep;
}
