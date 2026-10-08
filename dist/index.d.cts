export { AbsenceReport, ApprovalShiftRef, CompanyPolicy, CompanySkill, CreateAbsenceReportPayload, CreateCompanyPolicyPayload, CreateCompanyPolicyResult, CreateCompanySkillPayload, CreateDayOffRequestPayload, CreateEmployeePayload, CreateIncidentPayload, CreateSemanticRulePayload, CreateSemanticRuleResult, CreateShiftMembershipPayload, CreateShiftSwapRequestPayload, DayOffRequest, DayOffRequestStatus, Employee, FairnessHistoryRow, Incident, IncidentStatus, IncidentType, PolicyScope, PolicyScopeType, PolicySeverity, PolicySource, RulePriority, RuleType, SemanticRule, SemanticRuleListItem, SemanticRuleSuggestion, ShiftMembership, ShiftMembershipFilter, ShiftSwapRequest, ShiftSwapRequestStatus, UpdateCompanyPolicyPayload, UpdateEmployeePayload, UpdateSemanticRuleMetadataPayload, UpdateSemanticRuleTextPayload, WorkingTimePolicyOverrides, WorkingTimePolicyView, formatShiftRef } from './types/index.cjs';
export { BackendErrorBody, TranslateFn, describeApiError } from './errors/index.cjs';
export { ApiClientAdapters, PaymentRequiredReason, createApiClient } from './api/index.cjs';
export { BotOption, BotPayload, CHAT_ALLOWED_ATTACHMENT_TYPES, CHAT_ALLOWED_FILE_TYPES, CHAT_ALLOWED_IMAGE_TYPES, CHAT_MAX_ATTACHMENT_BYTES, CHAT_QUICK_REACTIONS, ChatContact, ChatMember, ChatMessage, ChatMessageCreatedEvent, ChatMessageUpdatedEvent, ChatRead, ChatReadEvent, ChatRoom, ChatTypingEvent, ClockEvent, ClockEventType, ClockValidationStatus, CreateClockEventInput, CreateRoomInput, GeoLocation, MyLocations, MyProfile, ReactionInput, RegisterDeviceInput, ScheduleAssignment, ScheduleAssignmentBreak, SendMessageInput, TagDomain, WorkforceTag, attachmentKindForMime, botOptionSchema, botPayloadSchema, botSkippedSchema, chatContactSchema, chatMemberSchema, chatMessageCreatedEventSchema, chatMessageSchema, chatMessageUpdatedEventSchema, chatReadEventSchema, chatReadSchema, chatRoomSchema, chatTypingEventSchema, clockEventSchema, clockEventTypeSchema, clockEventsSchema, clockGpsSchema, clockValidationStatusSchema, createClockEventInputSchema, createRoomInputSchema, geoLocationSchema, myLocationsSchema, myProfileSchema, reactionInputSchema, registerDeviceInputSchema, scheduleAssignmentBreakSchema, scheduleAssignmentSchema, scheduleAssignmentsSchema, sendMessageInputSchema, tagDomainSchema, workforceTagSchema, workforceTagsSchema } from './schemas/index.cjs';
export { FALLBACK_LANGUAGE, SUPPORTED_LANGUAGES, SupportedLanguage, sharedResources } from './i18n/index.cjs';
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
 * Los cambios de horario de verano hacen que esto NO sea una resta: dos veces
 * al año hay horas de pared que no existen y horas que ocurren dos veces. La
 * desambiguación sigue la convención **`compatible` de Temporal**, que es el
 * estándar de hecho y la que usan los tres repos:
 *
 *  - **Hueco** (al adelantar, el reloj salta de 02:00 a 03:00): la hora
 *    inexistente se empuja HACIA ADELANTE. 02:30 → 03:30.
 *  - **Repetida** (al atrasar, la 01:30 ocurre dos veces): se toma la
 *    PRIMERA ocurrencia.
 *
 * Cómo: se sondean los desfases a ambos lados, se construye un instante
 * candidato con cada uno y se valida cuál reproduce la hora de pared pedida.
 * Si los dos valen, la hora es ambigua → el menor (la primera). Si ninguno
 * vale, la hora está en el hueco → se usa el desfase ANTERIOR al cambio, que
 * es justamente lo que empuja el resultado hacia adelante.
 *
 * Una sola resta con el desfase "actual" se equivoca por una hora el día del
 * cambio, y dos pasadas encadenadas caen dentro del hueco en vez de saltarlo.
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

/**
 * Los dos horarios de un turno: el programado y el trabajado.
 *
 * ─── Por qué hace falta una regla ───────────────────────────────────────────
 *
 * Un turno guarda dos intervalos, y las columnas no se llaman como uno
 * esperaría:
 *
 *  - `planned_start_time` / `planned_end_time` → el **programado** original.
 *  - `actual_start_time` / `actual_end_time`   → el **trabajado**… y, mientras
 *    no haya un fichaje aprobado, también el programado.
 *
 * Ahí está la trampa: la columna del trabajado **arranca conteniendo el
 * programado**. Cuando se aprueba un fichaje, `syncShiftToPunch` copia la hora
 * real sobre `actual_*` y preserva el valor anterior en `planned_*`, pero solo
 * la primera vez.
 *
 * Así que `planned_* = null` NO significa "no hay programado": significa
 * "nunca se pisó, el programado sigue estando en `actual_*`". De ahí que la
 * coalescencia **sea** la regla y no un descuido defensivo.
 *
 * ─── Qué salió mal sin esto ─────────────────────────────────────────────────
 *
 * La pantalla de Asistencia mostraba `actual_end_time` con la etiqueta
 * "Horario" y juzgaba la puntualidad contra eso. En un turno hasta las 23:00
 * con salida fichada 22:17 decía "Horario 10:17 p. m. · a tiempo": comparaba
 * lo trabajado contra sí mismo (front #2). El móvil hacía lo mismo
 * (móvil #11).
 *
 * Vive en el paquete compartido porque el error se cometió dos veces, en la
 * web y en el móvil, leyendo la misma fila.
 */
interface ShiftTimes {
    /** `planned_start_time`. `null` = nunca se pisó. */
    plannedStart?: string | null;
    /** `planned_end_time`. `null` = nunca se pisó. */
    plannedEnd?: string | null;
    /** `actual_start_time`. Ojo: es el programado si `plannedStart` es `null`. */
    actualStart?: string | null;
    /** `actual_end_time`. Ojo: es el programado si `plannedEnd` es `null`. */
    actualEnd?: string | null;
}
interface Interval {
    start: string | null;
    end: string | null;
}
/**
 * El horario **programado**: lo que se le asignó al empleado.
 *
 * Es lo que hay que mostrar con la etiqueta "Horario" y contra lo que hay que
 * juzgar si llegó tarde o se fue temprano.
 */
declare function scheduledInterval(t: ShiftTimes): Interval;
/**
 * El horario **trabajado**: lo que quedó después de los fichajes aprobados.
 *
 * Siempre es `actual_*`. Devuelve lo mismo que el programado cuando no hubo
 * fichaje aprobado, y eso es correcto: sin fichaje, lo trabajado que conoce el
 * sistema es lo que estaba previsto.
 */
declare function workedInterval(t: ShiftTimes): Interval;
/**
 * `true` si el fichaje aprobado movió el horario, o sea si vale la pena mostrar
 * los dos.
 *
 * Sirve para no repetir la misma hora dos veces en la pantalla: cuando nadie
 * pisó nada, programado y trabajado son el mismo valor.
 */
declare function shiftTimesDiffer(t: ShiftTimes): boolean;

/**
 * ¿Hay que pedirle el segundo factor a esta sesión?
 *
 * ─── Por qué esto es compartido y no una línea en cada app ──────────────────
 *
 * Supabase NO pide el código por su cuenta. `signInWithPassword` devuelve una
 * sesión en `aal1` incluso si el usuario tiene un TOTP verificado y activo: el
 * desafío lo tiene que hacer la aplicación. Mientras no lo hacíamos, un factor
 * enrolado no protegía nada — con la contraseña se entraba igual.
 *
 * La condición vive acá porque la necesitan la web y el móvil, y es una
 * decisión de SEGURIDAD: si una de las dos copias se separa, esa plataforma
 * deja de pedir el código y nadie se entera hasta que alguien lo prueba. No es
 * un caso de "dos usos que probablemente divergen": acá divergir es el bug.
 *
 * `nextLevel` es el nivel que Supabase considera que esa sesión DEBERÍA
 * alcanzar: vale `aal2` cuando el usuario tiene al menos un factor verificado.
 * Si no tiene factores vale `aal1`, y por eso no alcanza con mirar
 * `currentLevel === 'aal1'` — eso le pediría un código a todo el mundo y nadie
 * podría entrar.
 */
declare function needsMfaChallenge(aal: {
    currentLevel: string | null;
    nextLevel: string | null;
}): boolean;

export { type FirstDayOfWeek, type Interval, type ShiftTimes, addDaysToDate, instantToWallClock, needsMfaChallenge, scheduledInterval, shiftTimesDiffer, todayInZone, wallClockToInstantIso, wallClockToInstantMs, wallMinutesInZone, weekStartInZone, weekStartOfDate, workedInterval };
