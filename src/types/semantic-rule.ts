/**
 * SemanticRule — regla en lenguaje natural creada por el manager.
 *
 * - `priorityLevel`: 1=legal (hard), 2=semantic (hard), 3=preference (soft)
 * - `ruleType`: restriction | preference | requirement
 * - `expiresAt`: ISO string opcional; null = sin vencimiento
 */
export type RulePriority = 1 | 2 | 3;
export type RuleType = 'restriction' | 'preference' | 'requirement';

export interface SemanticRule {
  id: string;
  companyId: string;
  ruleText: string;
  priorityLevel: RulePriority;
  ruleType: RuleType;
  isActive: boolean;
  expiresAt: string | null;
  branchId: string | null;
  departmentId: string | null;
  hasEmbedding: boolean;
  hasStructure: boolean;
  structure: Record<string, unknown> | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  createdBy: string | null;
  origin?: SemanticRuleOrigin | null;
}

/**
 * La solicitud de la que nació una regla (orch #32). Una regla con origen es
 * de solo lectura: se cambia la solicitud, y la API responde 409
 * `rule_from_request` a editarla o borrarla.
 */
export interface SemanticRuleOrigin {
  /** 'day_off' | 'absence' | 'shift_swap' hoy; string para tolerar nuevos. */
  kind: string;
  requestId: string;
  employeeId: string | null;
  effectiveFrom: string | null;
  effectiveTo: string | null;
}

/** Item devuelto por GET /rules/semantic (lista; subset del aggregate). */
export interface SemanticRuleListItem {
  id: string;
  ruleText: string;
  priorityLevel: RulePriority;
  ruleType: RuleType;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
  /** true si el LLM generó embedding (regla buscable semánticamente). */
  hasEmbedding: boolean;
  /** true si el LLM extrajo estructura (regla aplicable por el scheduler).
   *  Sin estructura, la regla queda como contexto para humanos. */
  hasStructure: boolean;
  /** De qué solicitud nació, o null si la escribió una persona. Ausente en
   *  APIs anteriores a orch #32. */
  origin?: SemanticRuleOrigin | null;
}

export interface CreateSemanticRulePayload {
  ruleText: string;
  priorityLevel: RulePriority;
  ruleType: RuleType;
  createdBy?: string;
  metadata?: Record<string, unknown>;
  expiresAt?: string | null;
  branchId?: string | null;
  departmentId?: string | null;
}

/** PATCH metadata barato (sin re-embedding). */
export interface UpdateSemanticRuleMetadataPayload {
  priorityLevel?: RulePriority;
  isActive?: boolean;
  expiresAt?: string | null;
  branchId?: string | null;
  departmentId?: string | null;
}

/** PATCH caro: cambia el texto y dispara re-embed + re-extract structure. */
export interface UpdateSemanticRuleTextPayload {
  ruleText: string;
}

/** Sugerencia de reformulación cuando el LLM marcó la regla como
 *  intent=complex y logró proponer alternativas aplicables. */
export interface SemanticRuleSuggestion {
  id: string;
  suggestedText: string;
  explanation: string;
  /** Intent estimado por el LLM. Solo informativo — la verificación real
   *  pasa al re-submitear con el texto elegido. */
  previewIntent?: string;
}

export interface CreateSemanticRuleResult {
  id: string;
  embeddingGenerated: boolean;
  isDuplicate: boolean;
  duplicateOfId?: string;
  structureExtracted: boolean;
  intent?: string;
  /** Si intent='complex' Y el LLM propuso alternativas, la regla NO se
   *  persistió y `suggestions` trae las opciones. El dialog muestra el
   *  suggestion-loop y el manager elige una. Si el LLM no propuso nada,
   *  queda undefined y la regla SÍ se persiste como complex (con badge
   *  "Sin estructura"). */
  suggestions?: SemanticRuleSuggestion[];
}
