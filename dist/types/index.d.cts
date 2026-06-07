/**
 * Employee — shape compartido entre la UI y la API.
 *
 * Refleja el JSON que devuelve el orchestrator (`GET /employees`,
 * `GET /employees/:id`). Los campos opcionales pueden venir `null` o
 * faltar según el endpoint.
 */
interface Employee {
    id: string;
    companyId?: string;
    name: string;
    /** Email opcional. Si está set, el manager puede mandar invitación de
     * login al employee desde la tabla (sino solo existe como registro HR). */
    email?: string | null;
    role: string;
    /** Algunos endpoints exponen `phone`, otros `phone_number`. */
    phone?: string;
    /** Identificador de la empresa en su sistema de nómina/asistencia. */
    externalId?: string | null;
    experienceMonths?: number;
    locale?: string;
    departmentId?: string | null;
    /** true si el employee tiene auth_user_id (puede loguearse). Derivado
     * en el backend desde `employees.auth_user_id IS NOT NULL`. */
    hasAccount?: boolean;
    /** Estado de la cuenta de login:
     *   - active   = ya aceptó invitación y puede loguearse
     *   - pending  = tiene invitación en curso, esperando que la acepte
     *   - none     = no tiene email o no se mandó invitación todavía
     * Backend lo computa en GET /employees. */
    accountStatus?: 'active' | 'pending' | 'none';
    /**
     * Skills cargadas via join (puede no venir en list endpoints). El backend
     * devuelve cada skill resuelta — id, nombre y nivel — no solo el id.
     * (La grilla de horarios usa un tipo paralelo en `store/scheduleStore.ts`
     * con shape mock; ese sigue siendo `string[]` hasta que se conecte a
     * datos reales.)
     */
    skills?: Array<{
        id: string;
        name: string;
        level: string;
    }>;
    isActive?: boolean;
}
/**
 * Body de POST /employees. El UUID interno lo genera el backend; aquí
 * sólo enviamos los datos visibles al manager.
 */
interface CreateEmployeePayload {
    name: string;
    email?: string;
    phone: string;
    experienceMonths: number;
    externalId?: string;
    /** Departamento asignado (define la sucursal vía department→branch). */
    departmentId?: string | null;
}
/** Body de PATCH /employees/:id (todos opcionales — partial update). */
interface UpdateEmployeePayload {
    name?: string;
    email?: string | null;
    role?: string;
    phoneNumber?: string;
    experienceMonths?: number;
    departmentId?: string | null;
    locale?: string;
    contractType?: string | null;
    maxHoursPerDay?: number | null;
    maxHoursPerWeek?: number | null;
    isActive?: boolean;
    externalId?: string | null;
}

/**
 * Tipos compartidos del grupo Approvals (Incidents, Swap Requests,
 * Absence Reports, Day Off Requests).
 */
type IncidentType = 'MEDICAL_LEAVE' | 'EMERGENCY_LEAVE' | 'SHIFT_SWAP_REQUEST' | 'LATE' | 'NO_SHOW' | 'BIOMETRIC_MISS';
type IncidentStatus = 'reported' | 'document_received' | 'pending_ocr' | 'processing_ocr' | 'pending_validation' | 'validated' | 'rejected' | 'repair_in_progress' | 'replacement_pending' | 'replacement_assigned' | 'resolved';
interface Incident {
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
    createdAt: string;
    updatedAt: string;
}
interface CreateIncidentPayload {
    employeeId: string;
    message?: string;
    mediaUrl?: string;
}
type ShiftSwapRequestStatus = 'pending' | 'accepted' | 'rejected';
interface ShiftSwapRequest {
    id: string;
    companyId: string;
    requesterId: string;
    targetId: string;
    assignmentId: string | null;
    status: ShiftSwapRequestStatus;
    createdAt: string;
}
interface CreateShiftSwapRequestPayload {
    requesterId: string;
    targetId: string;
    assignmentId?: string | null;
}
interface AbsenceReport {
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
}
interface CreateAbsenceReportPayload {
    employeeId: string;
    assignmentId?: string | null;
    reason: string;
    isUrgent?: boolean;
    /** YYYY-MM-DD. Default backend = hoy. */
    startDate?: string;
    /** YYYY-MM-DD. Default backend = startDate. */
    endDate?: string;
}
type DayOffRequestStatus = 'pending' | 'approved' | 'rejected';
interface DayOffRequest {
    id: string;
    companyId: string;
    employeeId: string;
    /** YYYY-MM-DD */
    date: string;
    reason: string;
    status: DayOffRequestStatus;
    createdAt: string;
}
interface CreateDayOffRequestPayload {
    employeeId: string;
    date: string;
    reason: string;
}

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
type PolicySeverity = 'hard' | 'soft';
/**
 * Phase 14.1 — alcance de la policy. Una policy aplica a:
 *   - company   : toda la empresa (default).
 *   - branch    : una sucursal.
 *   - department: un departamento.
 *   - employee  : una persona.
 */
type PolicyScopeType = 'company' | 'branch' | 'department' | 'employee';
interface PolicyScope {
    type: PolicyScopeType;
    /** UUID del target. NULL sii type='company'. */
    id: string | null;
}
interface CompanyPolicy {
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
interface CreateCompanyPolicyPayload {
    text: string;
    severity: PolicySeverity;
    scope?: PolicyScope;
    effectiveFrom?: string;
    createdBy?: string;
}
interface UpdateCompanyPolicyPayload {
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
type CreateCompanyPolicyResult = {
    status: 'queued';
    jobId: string;
};

/**
 * CompanySkill — skill del catálogo del tenant.
 * Reflejo del JSON de `GET /company-skills`.
 */
interface CompanySkill {
    id: string;
    companyId: string;
    name: string;
}
interface CreateCompanySkillPayload {
    name: string;
}

/**
 * FairnessHistory — contadores acumulados por empleado para una semana.
 * Reflejo del JSON de `GET /fairness-history`.
 */
interface FairnessHistoryRow {
    employeeId: string;
    companyId: string;
    weekStart: string;
    hoursWorked: number;
    undesirableCount: number;
    nightShiftCount: number;
    weekendCount: number;
    voluntaryExtraShifts: number;
}

/**
 * SemanticRule — regla en lenguaje natural creada por el manager.
 *
 * - `priorityLevel`: 1=legal (hard), 2=semantic (hard), 3=preference (soft)
 * - `ruleType`: restriction | preference | requirement
 * - `expiresAt`: ISO string opcional; null = sin vencimiento
 */
type RulePriority = 1 | 2 | 3;
type RuleType = 'restriction' | 'preference' | 'requirement';
interface SemanticRule {
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
}
/** Item devuelto por GET /rules/semantic (lista; subset del aggregate). */
interface SemanticRuleListItem {
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
}
interface CreateSemanticRulePayload {
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
interface UpdateSemanticRuleMetadataPayload {
    priorityLevel?: RulePriority;
    isActive?: boolean;
    expiresAt?: string | null;
    branchId?: string | null;
    departmentId?: string | null;
}
/** PATCH caro: cambia el texto y dispara re-embed + re-extract structure. */
interface UpdateSemanticRuleTextPayload {
    ruleText: string;
}
/** Sugerencia de reformulación cuando el LLM marcó la regla como
 *  intent=complex y logró proponer alternativas aplicables. */
interface SemanticRuleSuggestion {
    id: string;
    suggestedText: string;
    explanation: string;
    /** Intent estimado por el LLM. Solo informativo — la verificación real
     *  pasa al re-submitear con el texto elegido. */
    previewIntent?: string;
}
interface CreateSemanticRuleResult {
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

/**
 * ShiftMembership — vínculo estable empleado ↔ shift_template con effective
 * dates. Reflejo del JSON de `GET /shift-memberships`.
 */
interface ShiftMembership {
    id: string;
    companyId: string;
    employeeId: string;
    templateId: string;
    /** YYYY-MM-DD */
    effectiveFrom: string;
    /** YYYY-MM-DD o null = abierto */
    effectiveUntil: string | null;
    createdAt: string;
}
interface CreateShiftMembershipPayload {
    employeeId: string;
    templateId: string;
    effectiveFrom: string;
    effectiveUntil?: string | null;
}
interface ShiftMembershipFilter {
    employeeId?: string;
    templateId?: string;
    /** YYYY-MM-DD — devuelve memberships activas en esa fecha. */
    date?: string;
}

/**
 * Reflejo del JSON de `GET /employees/:id/working-time-policy`.
 *
 * - `effective`: caps resueltos por el resolver (employee → department →
 *   company → system-fallback). Es lo que el scheduler usa.
 * - `source`: de qué nivel viene cada cap.
 * - `overrides`: valores puros por nivel (employee, department, company)
 *   para mostrar la jerarquía en la UI.
 */
type PolicySource = 'employee' | 'department' | 'company' | 'system-fallback';
interface WorkingTimePolicyOverrides {
    maxHoursPerDay: number | null;
    maxHoursPerWeek: number | null;
}
interface WorkingTimePolicyView {
    employeeId: string;
    companyId: string;
    departmentId: string | null;
    effective: {
        maxHoursPerDay: number;
        maxHoursPerWeek: number;
    };
    source: {
        maxHoursPerDay: PolicySource;
        maxHoursPerWeek: PolicySource;
    };
    overrides: {
        employee: WorkingTimePolicyOverrides;
        department: WorkingTimePolicyOverrides | null;
        company: WorkingTimePolicyOverrides;
    };
}

export type { AbsenceReport, CompanyPolicy, CompanySkill, CreateAbsenceReportPayload, CreateCompanyPolicyPayload, CreateCompanyPolicyResult, CreateCompanySkillPayload, CreateDayOffRequestPayload, CreateEmployeePayload, CreateIncidentPayload, CreateSemanticRulePayload, CreateSemanticRuleResult, CreateShiftMembershipPayload, CreateShiftSwapRequestPayload, DayOffRequest, DayOffRequestStatus, Employee, FairnessHistoryRow, Incident, IncidentStatus, IncidentType, PolicyScope, PolicyScopeType, PolicySeverity, PolicySource, RulePriority, RuleType, SemanticRule, SemanticRuleListItem, SemanticRuleSuggestion, ShiftMembership, ShiftMembershipFilter, ShiftSwapRequest, ShiftSwapRequestStatus, UpdateCompanyPolicyPayload, UpdateEmployeePayload, UpdateSemanticRuleMetadataPayload, UpdateSemanticRuleTextPayload, WorkingTimePolicyOverrides, WorkingTimePolicyView };
