export { AbsenceReport, ApprovalShiftRef, CompanyPolicy, CompanySkill, CreateAbsenceReportPayload, CreateCompanyPolicyPayload, CreateCompanyPolicyResult, CreateCompanySkillPayload, CreateDayOffRequestPayload, CreateEmployeePayload, CreateIncidentPayload, CreateSemanticRulePayload, CreateSemanticRuleResult, CreateShiftMembershipPayload, CreateShiftSwapRequestPayload, DayOffRequest, DayOffRequestStatus, Employee, FairnessHistoryRow, Incident, IncidentStatus, IncidentType, PolicyScope, PolicyScopeType, PolicySeverity, PolicySource, RulePriority, RuleType, SemanticRule, SemanticRuleListItem, SemanticRuleSuggestion, ShiftMembership, ShiftMembershipFilter, ShiftSwapRequest, ShiftSwapRequestStatus, UpdateCompanyPolicyPayload, UpdateEmployeePayload, UpdateSemanticRuleMetadataPayload, UpdateSemanticRuleTextPayload, WorkingTimePolicyOverrides, WorkingTimePolicyView, formatShiftRef } from './types/index.js';
export { BackendErrorBody, TranslateFn, describeApiError } from './errors/index.js';
export { ApiClientAdapters, PaymentRequiredReason, createApiClient } from './api/index.js';
export { BotOption, BotPayload, CHAT_ALLOWED_ATTACHMENT_TYPES, CHAT_ALLOWED_FILE_TYPES, CHAT_ALLOWED_IMAGE_TYPES, CHAT_MAX_ATTACHMENT_BYTES, CHAT_QUICK_REACTIONS, ChatContact, ChatMember, ChatMessage, ChatMessageCreatedEvent, ChatMessageUpdatedEvent, ChatRead, ChatReadEvent, ChatRoom, ChatTypingEvent, ClockEvent, ClockEventType, ClockValidationStatus, CreateClockEventInput, CreateRoomInput, GeoLocation, MyLocations, MyProfile, ReactionInput, RegisterDeviceInput, ScheduleAssignment, ScheduleAssignmentBreak, SendMessageInput, TagDomain, WorkforceTag, attachmentKindForMime, botOptionSchema, botPayloadSchema, botSkippedSchema, chatContactSchema, chatMemberSchema, chatMessageCreatedEventSchema, chatMessageSchema, chatMessageUpdatedEventSchema, chatReadEventSchema, chatReadSchema, chatRoomSchema, chatTypingEventSchema, clockEventSchema, clockEventTypeSchema, clockEventsSchema, clockGpsSchema, clockValidationStatusSchema, createClockEventInputSchema, createRoomInputSchema, geoLocationSchema, myLocationsSchema, myProfileSchema, reactionInputSchema, registerDeviceInputSchema, scheduleAssignmentBreakSchema, scheduleAssignmentSchema, scheduleAssignmentsSchema, sendMessageInputSchema, tagDomainSchema, workforceTagSchema, workforceTagsSchema } from './schemas/index.js';
export { FALLBACK_LANGUAGE, SUPPORTED_LANGUAGES, SupportedLanguage, sharedResources } from './i18n/index.js';
import 'axios';
import 'zod';

/**
 * Cálculos de fecha y hora en la zona de la SUCURSAL.
 *
 * Regla del producto: todo "hoy", inicio de semana, ventana de fichaje,
 * no-show y auto-clock-out se calcula en la zona IANA de la sucursal. La zona
 * del navegador o del dispositivo solo sirve para mostrarle al usuario su
 * propia hora actual — nunca para decidir.
 *
 * Dos convenciones de almacenamiento conviven en el sistema y confundirlas es
 * la causa de la mayoría de los bugs de este subsistema:
 *
 *   - **wall-clock codificado como UTC** — los horarios (`actual_start_time`,
 *     `actual_end_time`). Un turno que empieza a las 21:00 en Lima se guarda
 *     como `21:00Z`. El sufijo Z miente a propósito: son componentes de pared.
 *   - **instante real en UTC** — los fichajes (`occurred_at`). Ahí la Z es de
 *     verdad.
 *
 * Comparar uno contra otro sin convertir es el error; estas funciones son el
 * puente.
 */
type FirstDayOfWeek = 'sunday' | 'monday';
/** `YYYY-MM-DD` de HOY en la zona dada. */
declare function todayInZone(tz: string, now?: Date): string;
/** Minutos desde la medianoche (0–1439) de un instante, en la zona dada. */
declare function wallMinutesInZone(instant: Date | string, tz: string): number;
/**
 * Instante real → ISO con los componentes de PARED de la zona, codificados
 * como UTC. Es la convención con la que se guardan los horarios.
 */
declare function instantToWallClock(instant: Date | string, tz: string): string;
/**
 * Inverso: un ISO wall-clock-como-UTC → el instante real en esa zona, en ms.
 *
 * DOS PASADAS, y no es un detalle: el desfase hay que medirlo en el instante
 * RESULTANTE, no en la hora de pared tratada como si fuera UTC. En un cambio
 * de horario de verano los dos difieren y una sola pasada se equivoca por una
 * hora justo el día del cambio.
 *
 * Horas que no existen (la madrugada que el reloj se saltea al adelantar) o
 * que ocurren dos veces (al atrasar) se resuelven de forma determinística:
 * la segunda pasada fija un único instante, y para la hora repetida devuelve
 * la primera ocurrencia.
 */
declare function wallClockToInstantMs(wallClockIso: string, tz: string): number;
/** Igual que `wallClockToInstantMs` pero devuelve el ISO del instante real. */
declare function wallClockToInstantIso(wallClockIso: string, tz: string): string;
/**
 * Primer día de la semana que contiene a `ymd`, como `YYYY-MM-DD`.
 *
 * Aritmética de calendario pura: no interviene ninguna zona porque las dos
 * puntas son fechas, no instantes.
 */
declare function weekStartOfDate(ymd: string, firstDay: FirstDayOfWeek): string;
/** `YYYY-MM-DD` del primer día de la semana EN CURSO, en la zona dada. */
declare function weekStartInZone(tz: string, firstDay: FirstDayOfWeek, now?: Date): string;
/** Suma días a una fecha `YYYY-MM-DD`. Aritmética de calendario pura. */
declare function addDaysToDate(ymd: string, days: number): string;

export { type FirstDayOfWeek, addDaysToDate, instantToWallClock, todayInZone, wallClockToInstantIso, wallClockToInstantMs, wallMinutesInZone, weekStartInZone, weekStartOfDate };
