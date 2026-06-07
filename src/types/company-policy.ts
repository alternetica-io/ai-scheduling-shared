/**
 * CompanyPolicy — invariante tenant-wide del scheduler.
 *
 * Distinto de SemanticRule (caso particular tipo "Pablo no trabaja los
 * lunes"). Una policy aplica a todos los empleados ("11h descanso entre
 * turnos", "2 días libres por semana").
 *
 * El backend la matchea contra un catálogo de "interpreters" en código.
 * Si encuentra uno, persiste con `interpreterId` poblado y el solver la
 * aplica deterministicamente. Si no, queda LLM-only (interpreterId null,
 * params {}) y solo se pasa al prompt de schedule generation.
 */
export type PolicySeverity = 'hard' | 'soft';

/**
 * Phase 14.1 — alcance de la policy. Una policy aplica a:
 *   - company   : toda la empresa (default).
 *   - branch    : una sucursal.
 *   - department: un departamento.
 *   - employee  : una persona.
 */
export type PolicyScopeType = 'company' | 'branch' | 'department' | 'employee';
export interface PolicyScope {
  type: PolicyScopeType;
  /** UUID del target. NULL sii type='company'. */
  id: string | null;
}

export interface CompanyPolicy {
  id: string;
  companyId: string;
  text: string;
  severity: PolicySeverity;
  scope: PolicyScope;
  params: Record<string, unknown>;
  interpreterId: string | null;
  /** True si el sistema tiene un interpreter en código que aplica esta
   *  policy en el solver. False = LLM-only (se pasa al prompt). */
  hasInterpreter: boolean;
  isActive: boolean;
  effectiveFrom: string;
  createdAt: string;
  createdBy: string | null;
}

export interface CreateCompanyPolicyPayload {
  text: string;
  severity: PolicySeverity;
  scope?: PolicyScope;
  effectiveFrom?: string;
  createdBy?: string;
}

export interface UpdateCompanyPolicyPayload {
  text?: string;
  severity?: PolicySeverity;
  isActive?: boolean;
  /** Override manual de los params extraídos por el interpreter. */
  params?: Record<string, unknown>;
}

/**
 * Respuesta del POST /company-policies — 202 ACCEPTED con jobId del
 * pg-boss. El backend procesa async (CompanyPolicyCreator en worker);
 * el frontend escucha el WS event `LlmJobCompleted` con type=
 * 'create_policy' para invalidar la lista. Sprint async-policies
 * (2026-05-26).
 */
export type CreateCompanyPolicyResult = {
  status: 'queued';
  jobId: string;
};
