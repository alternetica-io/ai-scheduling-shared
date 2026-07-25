'use strict';

var axios = require('axios');
var zod = require('zod');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var axios__default = /*#__PURE__*/_interopDefault(axios);

// src/types/approvals.ts
function formatShiftRef(ref, locale) {
  const pad = (n) => String(n).padStart(2, "0");
  const t = (iso) => {
    const d = new Date(iso);
    return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
  };
  return {
    day: (/* @__PURE__ */ new Date(`${ref.date}T00:00:00`)).toLocaleDateString(locale, {
      weekday: "short",
      day: "2-digit",
      month: "short"
    }),
    time: `${t(ref.start)} \u2013 ${t(ref.end)}`
  };
}
function describeApiError(err, t) {
  if (axios__default.default.isAxiosError(err)) {
    const data = err.response?.data ?? {};
    if (data.errorCode) {
      const key = `errors:${data.errorCode}`;
      const translated = t(key, {
        field: data.field ?? "",
        constraint: data.constraint ?? ""
      });
      if (translated !== key && translated !== data.errorCode) return translated;
    }
    if (Array.isArray(data.message)) return data.message.join(" \xB7 ");
    if (data.message) return data.message;
    if (err.response?.status) {
      return t("errors:GENERIC_HTTP", { status: err.response.status });
    }
  }
  if (err instanceof Error && err.message) return err.message;
  return t("errors:UNKNOWN");
}
var DEFAULT_TIMEOUT_MS = 3e4;
function createApiClient(adapters) {
  const api = axios__default.default.create({
    baseURL: adapters.baseURL,
    timeout: adapters.timeoutMs ?? DEFAULT_TIMEOUT_MS
  });
  api.interceptors.request.use(async (cfg) => {
    const url = cfg.url ?? "";
    if (adapters.shouldShortCircuit?.(url)) {
      cfg.adapter = async () => ({
        data: [],
        status: 200,
        statusText: "OK (short-circuit)",
        headers: {},
        config: cfg
      });
      return cfg;
    }
    const lang = adapters.getLanguage?.();
    if (lang) cfg.headers.set("Accept-Language", lang);
    const token = await adapters.getAccessToken();
    if (token) cfg.headers.set("Authorization", `Bearer ${token}`);
    return cfg;
  });
  api.interceptors.response.use(
    (r) => r,
    async (err) => {
      const response = err.response;
      const status = response?.status;
      if (status === 401) {
        await adapters.onUnauthorized?.();
      } else if (status === 402) {
        const code = response?.data?.errorCode;
        const reason = code === "SUBSCRIPTION_CANCELED" ? "SUBSCRIPTION_CANCELED" : "TRIAL_EXPIRED";
        adapters.onPaymentRequired?.(reason);
      }
      return Promise.reject(err);
    }
  );
  return api;
}
var scheduleAssignmentBreakSchema = zod.z.object({
  id: zod.z.string(),
  startTime: zod.z.string(),
  endTime: zod.z.string(),
  isPaid: zod.z.boolean()
});
var scheduleAssignmentSchema = zod.z.object({
  id: zod.z.string(),
  employeeId: zod.z.string(),
  templateId: zod.z.string(),
  templateName: zod.z.string(),
  date: zod.z.string(),
  actualStartTime: zod.z.string(),
  actualEndTime: zod.z.string(),
  origin: zod.z.enum(["membership", "override", "exception"]),
  breaks: zod.z.array(scheduleAssignmentBreakSchema),
  confirmedAt: zod.z.string().nullable(),
  /** 'employee' (a mano) | 'system' (auto por ventana) | null (sin confirmar).
   *  Defaults tolerantes: si el backend aún no lo manda, el parse no rompe. */
  confirmedBy: zod.z.enum(["employee", "system"]).nullable().default(null),
  locationId: zod.z.string().nullable().default(null),
  locationName: zod.z.string().nullable().default(null),
  /** Estado de fichaje del turno (para pildoras de turnos pasados/en curso). */
  punchStatus: zod.z.enum(["none", "not_started", "open", "closed", "no_show"]).default("none"),
  /** El empleado llegó tarde (fichaje de entrada con flag late_in). */
  late: zod.z.boolean().default(false),
  /** Inicio/fin PROGRAMADO original si el turno se ajustó a un fichaje real. */
  plannedStartTime: zod.z.string().nullable().default(null),
  plannedEndTime: zod.z.string().nullable().default(null),
  /** Tags aplicados al turno (catálogo por tenant). Incluye el "Manual"
   *  auto-stampeado en turnos retroactivos. Default tolerante. */
  tagIds: zod.z.array(zod.z.string()).default([])
});
var scheduleAssignmentsSchema = zod.z.array(scheduleAssignmentSchema);
var myProfileSchema = zod.z.object({
  id: zod.z.string(),
  name: zod.z.string(),
  role: zod.z.string().nullable(),
  phone: zod.z.string().nullable(),
  departmentId: zod.z.string().nullable(),
  email: zod.z.string().nullable(),
  companyName: zod.z.string().nullable(),
  /** IANA tz of the employee's branch (e.g. "America/Argentina/Buenos_Aires"). */
  timezone: zod.z.string().nullable()
});
var clockEventTypeSchema = zod.z.enum([
  "in",
  "out",
  "break_start",
  "break_end",
  "no_show"
]);
var clockGpsSchema = zod.z.object({
  lat: zod.z.number(),
  lng: zod.z.number(),
  accuracy: zod.z.number(),
  photoUrl: zod.z.string().optional()
});
var createClockEventInputSchema = zod.z.object({
  clientUuid: zod.z.string().min(1),
  type: clockEventTypeSchema,
  occurredAt: zod.z.string(),
  shiftAssignmentId: zod.z.string().optional(),
  /** Location to validate the geofence against (Locations feature). */
  locationId: zod.z.string().optional(),
  /** En un break_start: límite en minutos del descanso elegido (para overbreak).
   *  null/omitido = descanso sin límite (turno sin descanso configurado). */
  breakLimitMinutes: zod.z.number().nullable().optional(),
  gps: clockGpsSchema
});
var geoLocationSchema = zod.z.object({
  id: zod.z.string(),
  branchId: zod.z.string(),
  name: zod.z.string(),
  geofenceLat: zod.z.number(),
  geofenceLng: zod.z.number(),
  geofenceRadiusM: zod.z.number()
});
var myLocationsSchema = zod.z.object({
  mode: zod.z.enum(["fixed", "rotate"]),
  locations: zod.z.array(geoLocationSchema)
});
var clockValidationStatusSchema = zod.z.enum(["valid", "pending_review", "disputed"]);
var clockEventSchema = zod.z.object({
  id: zod.z.string(),
  type: clockEventTypeSchema,
  source: zod.z.string(),
  occurredAt: zod.z.string(),
  recordedAt: zod.z.string(),
  validationStatus: clockValidationStatusSchema,
  anomalyReason: zod.z.string().nullable(),
  shiftAssignmentId: zod.z.string().nullable(),
  lat: zod.z.number().nullable(),
  lng: zod.z.number().nullable(),
  accuracy: zod.z.number().nullable(),
  photoUrl: zod.z.string().nullable(),
  /** Límite (min) del descanso, presente en break_start. null = sin límite. */
  breakLimitMinutes: zod.z.number().nullable().default(null)
});
var clockEventsSchema = zod.z.array(clockEventSchema);
var tagDomainSchema = zod.z.enum(["schedule", "attendance"]);
var workforceTagSchema = zod.z.object({
  id: zod.z.string(),
  name: zod.z.string(),
  /** Hex del chip. null = usar fallback. */
  color: zod.z.string().nullable().default(null),
  domains: zod.z.array(tagDomainSchema).default([]),
  isSystem: zod.z.boolean().default(false)
});
var workforceTagsSchema = zod.z.array(workforceTagSchema);
var CHAT_MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024;
var CHAT_ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp"
];
var CHAT_ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
  "application/zip"
];
var CHAT_ALLOWED_ATTACHMENT_TYPES = [
  ...CHAT_ALLOWED_IMAGE_TYPES,
  ...CHAT_ALLOWED_FILE_TYPES
];
function attachmentKindForMime(mime) {
  if (!mime) return null;
  if (CHAT_ALLOWED_IMAGE_TYPES.includes(mime)) return "image";
  if (CHAT_ALLOWED_FILE_TYPES.includes(mime)) return "file";
  return null;
}
var botOptionSchema = zod.z.object({
  /** Localized chip label shown to the manager. */
  label: zod.z.string(),
  /** Stable token echoed back as a user message when tapped. */
  value: zod.z.string()
});
var botSkippedSchema = zod.z.object({
  employeeId: zod.z.string(),
  employeeName: zod.z.string().nullable().default(null),
  date: zod.z.string(),
  reason: zod.z.string()
});
var botPayloadSchema = zod.z.discriminatedUnion("kind", [
  /** Plain assistant text (render `content`). */
  zod.z.object({ kind: zod.z.literal("text") }),
  /** A question with 2–10 tappable chips (hierarchical selection, name disambiguation). */
  zod.z.object({
    kind: zod.z.literal("options"),
    question: zod.z.string(),
    options: zod.z.array(botOptionSchema).min(2).max(10)
  }),
  /** Summary card requiring explicit Confirm / Cancel before a write. */
  zod.z.object({
    kind: zod.z.literal("confirm"),
    title: zod.z.string(),
    lines: zod.z.array(zod.z.string()).default([]),
    warnings: zod.z.array(zod.z.string()).default([]),
    confirmLabel: zod.z.string(),
    cancelLabel: zod.z.string(),
    /** Tokens sent back as the user message on tap. */
    confirmValue: zod.z.string(),
    cancelValue: zod.z.string()
  }),
  /** Job progress, updatable in place (same message row). */
  zod.z.object({
    kind: zod.z.literal("progress"),
    state: zod.z.enum(["queued", "generating"]),
    label: zod.z.string()
  }),
  /** Outcome card for a completed operation. */
  zod.z.object({
    kind: zod.z.literal("result"),
    title: zod.z.string(),
    success: zod.z.boolean().default(true),
    created: zod.z.number().nullable().default(null),
    replaced: zod.z.number().nullable().default(null),
    skipped: zod.z.array(botSkippedSchema).default([]),
    warnings: zod.z.array(zod.z.string()).default([]),
    /** Optional deep link to the schedule grid week (e.g. "/schedule?week=YYYY-MM-DD"). */
    link: zod.z.string().nullable().default(null)
  })
]);
var chatMessageSchema = zod.z.object({
  id: zod.z.string(),
  roomId: zod.z.string(),
  senderId: zod.z.string().nullable(),
  senderName: zod.z.string().nullable(),
  /** 'user' for human messages, 'assistant' for the scheduling bot. */
  senderType: zod.z.enum(["user", "assistant"]).default("user"),
  content: zod.z.string(),
  createdAt: zod.z.string(),
  attachmentUrl: zod.z.string().nullable().default(null),
  attachmentType: zod.z.enum(["image", "file"]).nullable().default(null),
  attachmentName: zod.z.string().nullable().default(null),
  /** Attachment size in bytes (for the download card); null when no attachment. */
  attachmentSize: zod.z.number().nullable().default(null),
  /** Structured assistant payload; null for ordinary messages. */
  botPayload: botPayloadSchema.nullable().default(null),
  /** The quoted message this one replies to (preview), or null. */
  replyTo: zod.z.object({
    id: zod.z.string(),
    content: zod.z.string(),
    senderName: zod.z.string().nullable()
  }).nullable().default(null),
  /** Set when the sender edited the message. */
  editedAt: zod.z.string().nullable().default(null),
  /** Set when the sender soft-deleted the message (content hidden). */
  deletedAt: zod.z.string().nullable().default(null),
  /** Emoji reactions aggregated per emoji (mine = the current user reacted). */
  reactions: zod.z.array(
    zod.z.object({
      emoji: zod.z.string(),
      count: zod.z.number(),
      mine: zod.z.boolean()
    })
  ).default([])
});
var reactionInputSchema = zod.z.object({ emoji: zod.z.string().min(1).max(16) });
var CHAT_QUICK_REACTIONS = ["\u{1F44D}", "\u2764\uFE0F", "\u{1F602}", "\u{1F62E}", "\u{1F622}", "\u{1F64F}"];
var chatContactSchema = zod.z.object({ id: zod.z.string(), name: zod.z.string() });
var chatMemberSchema = zod.z.object({
  id: zod.z.string(),
  name: zod.z.string(),
  role: zod.z.enum(["member", "admin"])
});
var chatRoomSchema = zod.z.object({
  id: zod.z.string(),
  type: zod.z.enum(["dm", "group", "assistant"]),
  title: zod.z.string(),
  memberCount: zod.z.number(),
  lastMessage: zod.z.object({
    content: zod.z.string(),
    createdAt: zod.z.string(),
    senderName: zod.z.string().nullable()
  }).nullable(),
  unreadCount: zod.z.number(),
  updatedAt: zod.z.string(),
  /** Member muted push for this room. */
  muted: zod.z.boolean().default(false)
});
var sendMessageInputSchema = zod.z.object({
  content: zod.z.string().max(4e3).optional(),
  clientUuid: zod.z.string().optional(),
  attachmentPath: zod.z.string().optional(),
  attachmentType: zod.z.enum(["image", "file"]).optional(),
  attachmentName: zod.z.string().optional(),
  /** Attachment size in bytes — required when an attachment is sent (quota). */
  attachmentSize: zod.z.number().int().nonnegative().optional(),
  /** Assistant rooms: stable token behind a tapped chip / confirm button. */
  botValue: zod.z.string().optional(),
  /** Reply: the message id being quoted. */
  replyToId: zod.z.string().optional()
});
var createRoomInputSchema = zod.z.object({
  type: zod.z.enum(["dm", "group"]),
  memberId: zod.z.string().optional(),
  name: zod.z.string().max(120).optional(),
  memberIds: zod.z.array(zod.z.string()).optional()
});
var chatMessageCreatedEventSchema = zod.z.object({
  roomId: zod.z.string(),
  message: chatMessageSchema
});
var chatMessageUpdatedEventSchema = zod.z.object({
  roomId: zod.z.string(),
  message: chatMessageSchema
});
var chatTypingEventSchema = zod.z.object({
  roomId: zod.z.string(),
  employeeId: zod.z.string(),
  name: zod.z.string()
});
var chatReadSchema = zod.z.object({
  employeeId: zod.z.string(),
  lastReadAt: zod.z.string().nullable()
});
var chatReadEventSchema = zod.z.object({
  roomId: zod.z.string(),
  employeeId: zod.z.string(),
  lastReadAt: zod.z.string()
});
var registerDeviceInputSchema = zod.z.object({
  token: zod.z.string().min(1),
  platform: zod.z.enum(["ios", "android"])
});

// src/i18n/en/common.json
var common_default = {
  app: {
    title: "AI Scheduler",
    scenario: "Scenario 6 Overview",
    managerView: "Manager View"
  },
  languageSwitcher: {
    toggleTo: "Switch to {{lang}}"
  },
  theme: {
    switchToLight: "Switch to light theme",
    switchToDark: "Switch to dark theme"
  },
  notifications: {
    title: "Notifications",
    empty: "You're all caught up.",
    summary_one: "{{count}} item needs your attention",
    summary_other: "{{count}} items need your attention",
    countLabel_one: "{{count}} pending notification",
    countLabel_other: "{{count}} pending notifications",
    sections: {
      swaps: "Shift swaps",
      dayoffs: "Day off requests",
      incidents: "Incidents",
      absences: "Recent absences"
    },
    swapBetween: "Swap: {{a}} \u2194 {{b}}",
    dayOff: "{{employee}} on {{date}}",
    incident: "Incident pending review",
    absence: "Absence reported",
    justNow: "just now",
    minutesAgo_one: "{{count}} min ago",
    minutesAgo_other: "{{count}} min ago",
    hoursAgo_one: "{{count}} hour ago",
    hoursAgo_other: "{{count}} hours ago",
    approved: "Approved",
    rejected: "Rejected"
  },
  trialBanner: {
    active_one: "Free trial \xB7 {{count}} day left",
    active_other: "Free trial \xB7 {{count}} days left",
    endingSoon_one: "Trial ends tomorrow",
    endingSoon_other: "Trial ends in {{count}} days",
    expired: "Your trial has ended. Subscribe to keep using the app.",
    canceled: "Subscription canceled. Renew to continue.",
    cta: "Upgrade"
  },
  billingEnforcer: {
    expiredTitle: "Trial expired",
    expiredBody: "Your free trial has ended. Pick a plan to keep using the app.",
    canceledTitle: "Subscription canceled",
    canceledBody: "Your subscription was canceled. Resubscribe to keep using the app.",
    cta: "Pick a plan",
    logout: "Log out"
  },
  billing: {
    tierPicker: {
      title: "Pick your plan",
      subtitle: "You'll be redirected to Stripe to complete the payment. You can change or cancel any time from your billing settings.",
      select: "Choose this plan",
      redirecting: "Redirecting to Stripe\u2026",
      trust: "Secure checkout by Stripe \xB7 You can cancel any time"
    },
    portal: {
      openLabel: "Manage subscription",
      redirecting: "Opening billing portal\u2026"
    },
    errors: {
      noCustomer: "Complete a checkout first to unlock subscription management."
    }
  },
  actions: {
    create: "Create",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    deleting: "Deleting\u2026",
    saving: "Saving\u2026",
    close: "Close",
    back: "Back",
    confirm: "Confirm",
    search: "Search",
    filter: "Filter",
    clear: "Clear",
    retry: "Retry",
    loading: "Loading\u2026",
    understood: "Got it",
    yes: "Yes",
    no: "No"
  },
  states: {
    active: "Active",
    inactive: "Inactive",
    loading: "Loading\u2026",
    empty: "No items yet.",
    error: "Something went wrong.",
    none: "\u2014"
  },
  table: {
    rowsPerPage: "Rows per page",
    rowsLabel: "Rows:",
    page: "Page {{current}} of {{total}}",
    previous: "Previous",
    next: "Next",
    previousAria: "Previous page",
    nextAria: "Next page",
    noResults: "No results.",
    results_one: "{{count}} result",
    results_other: "{{count}} results",
    showingOf: "Showing {{shown}} of {{total}}",
    sortByAria: "Sort by {{column}}",
    selectAll: "Select all",
    selectRow: "Select row"
  },
  managerFilter: {
    label: "Manager scope",
    all: "All managers",
    valueScopedSuffix: "(their departments + unassigned)"
  },
  scheduleJobBanner: {
    queued: "\u{1F4C5} Schedule generation queued for the week of {{weekStart}}",
    active: "\u2699\uFE0F Generating schedule for the week of {{weekStart}}",
    multi_one: "{{count}} schedule generation in progress",
    multi_other: "{{count}} schedule generations in progress",
    viewLink: "View \u2192",
    cancel: "Cancel",
    cancelling: "Cancelling\u2026",
    cancelSuccess: "Cancellation requested",
    cancelError: "Could not cancel"
  },
  scheduleToast: {
    successTitle: "Schedule generated",
    successBody: "The week of {{weekStart}} is ready. The grid has been refreshed.",
    failTitle: "We couldn't generate the schedule",
    failBody: "Generation failed for the week of {{weekStart}}. Review your rules and try again."
  },
  llmJobs: {
    banner: {
      in_flight: "Processing with AI\u2026",
      in_flight_one: "{{count}} task processing with AI\u2026",
      in_flight_other: "{{count}} tasks processing with AI\u2026",
      success: "Done",
      error: "Failed"
    },
    create_rule: {
      label: "Creating rule",
      successTitle: "Rule created",
      successBody: "The new semantic rule was added.",
      failTitle: "Couldn't create the rule",
      failBody: "AI processing failed. Try again."
    },
    update_rule_text: {
      label: "Updating rule",
      successTitle: "Rule updated",
      successBody: "The rule was re-processed.",
      failTitle: "Couldn't update the rule",
      failBody: "AI processing failed. Try again."
    },
    create_policy: {
      successTitle: "Policy created",
      successBody: "The policy is active and will be applied next time you generate a schedule.",
      failTitle: "Policy couldn't be created",
      failBody: "Try again or check the policy text."
    },
    imports_extract: {
      label: "Extracting data from file",
      successTitle: "Data extracted",
      successBody: "Done. Review the preview and confirm the import.",
      failTitle: "Couldn't extract data",
      failBody: "The vision model failed. Try another file or check the AI integration."
    }
  },
  history: {
    title: "History",
    button: "History",
    empty: "No history yet for this item.",
    action: {
      create: "Created",
      update: "Updated",
      delete: "Deleted"
    }
  }
};

// src/i18n/en/errors.json
var errors_default = {
  EMPLOYEE_PHONE_DUPLICATE: "An employee with that phone number already exists.",
  EMPLOYEE_EXTERNAL_ID_DUPLICATE: "An employee with that external ID already exists.",
  MEMBERSHIP_DUPLICATE: "A membership for that employee, template and start date already exists.",
  SKILL_DUPLICATE: "That skill is already in your tenant catalog.",
  POLICY_INTERPRETER_DUPLICATE: "There is already an active policy for that pattern. Edit or deactivate the existing one first.",
  UNIQUE_VIOLATION: "A record with these values already exists.",
  NOT_NULL_VIOLATION: 'The field "{{field}}" is required.',
  FOREIGN_KEY_VIOLATION: "The operation references a record that no longer exists.",
  CHECK_VIOLATION: "The submitted data does not meet a validation rule.",
  INTERNAL_ERROR: "An unexpected error occurred. Please try again or contact support.",
  IMPORT_ALREADY_COMMITTED: "This company already has a recent import. Revert the previous one or wait until the revert window expires (7 days). See Settings \u2192 Importar datos \u2192 Importaciones recientes.",
  GENERIC_HTTP: "Server error ({{status}}). Please try again.",
  UNKNOWN: "Something went wrong."
};

// src/i18n/es/common.json
var common_default2 = {
  app: {
    title: "Planificador IA",
    scenario: "Resumen Escenario 6",
    managerView: "Vista de Gestor"
  },
  languageSwitcher: {
    toggleTo: "Cambiar a {{lang}}"
  },
  theme: {
    switchToLight: "Cambiar a tema claro",
    switchToDark: "Cambiar a tema oscuro"
  },
  notifications: {
    title: "Notificaciones",
    empty: "Sin pendientes.",
    summary_one: "{{count}} \xEDtem requiere tu atenci\xF3n",
    summary_other: "{{count}} \xEDtems requieren tu atenci\xF3n",
    countLabel_one: "{{count}} notificaci\xF3n pendiente",
    countLabel_other: "{{count}} notificaciones pendientes",
    sections: {
      swaps: "Cambios de turno",
      dayoffs: "D\xEDas libres",
      incidents: "Incidencias",
      absences: "Ausencias recientes"
    },
    swapBetween: "Cambio: {{a}} \u2194 {{b}}",
    dayOff: "{{employee}} el {{date}}",
    incident: "Incidencia para revisar",
    absence: "Ausencia reportada",
    justNow: "ahora",
    minutesAgo_one: "hace {{count}} min",
    minutesAgo_other: "hace {{count}} min",
    hoursAgo_one: "hace {{count}} h",
    hoursAgo_other: "hace {{count}} h",
    approved: "Aprobado",
    rejected: "Rechazado"
  },
  trialBanner: {
    active_one: "Prueba gratis \xB7 {{count}} d\xEDa restante",
    active_other: "Prueba gratis \xB7 {{count}} d\xEDas restantes",
    endingSoon_one: "La prueba termina ma\xF1ana",
    endingSoon_other: "La prueba termina en {{count}} d\xEDas",
    expired: "Tu prueba termin\xF3. Suscribite para seguir usando la app.",
    canceled: "Suscripci\xF3n cancelada. Renov\xE1 para continuar.",
    cta: "Actualizar"
  },
  billingEnforcer: {
    expiredTitle: "Prueba expirada",
    expiredBody: "Tu prueba gratuita termin\xF3. Eleg\xED un plan para seguir usando la app.",
    canceledTitle: "Suscripci\xF3n cancelada",
    canceledBody: "Tu suscripci\xF3n fue cancelada. Volv\xE9 a suscribirte para seguir usando la app.",
    cta: "Elegir plan",
    logout: "Cerrar sesi\xF3n"
  },
  billing: {
    tierPicker: {
      title: "Eleg\xED tu plan",
      subtitle: "Te vamos a redirigir a Stripe para completar el pago. Pod\xE9s cambiar o cancelar cuando quieras desde tu configuraci\xF3n de billing.",
      select: "Elegir este plan",
      redirecting: "Redirigiendo a Stripe\u2026",
      trust: "Checkout seguro por Stripe \xB7 Cancel\xE1s cuando quieras"
    },
    portal: {
      openLabel: "Administrar suscripci\xF3n",
      redirecting: "Abriendo portal de billing\u2026"
    },
    errors: {
      noCustomer: "Complet\xE1 un checkout primero para administrar la suscripci\xF3n."
    }
  },
  actions: {
    create: "Crear",
    save: "Guardar",
    cancel: "Cancelar",
    edit: "Editar",
    delete: "Eliminar",
    deleting: "Eliminando\u2026",
    saving: "Guardando\u2026",
    close: "Cerrar",
    back: "Volver",
    confirm: "Confirmar",
    search: "Buscar",
    filter: "Filtrar",
    clear: "Limpiar",
    retry: "Reintentar",
    loading: "Cargando\u2026",
    understood: "Entendido",
    yes: "S\xED",
    no: "No"
  },
  states: {
    active: "Activo",
    inactive: "Inactivo",
    loading: "Cargando\u2026",
    empty: "Sin elementos todav\xEDa.",
    error: "Algo sali\xF3 mal.",
    none: "\u2014"
  },
  table: {
    rowsPerPage: "Filas por p\xE1gina",
    rowsLabel: "Filas:",
    page: "P\xE1gina {{current}} de {{total}}",
    previous: "Anterior",
    next: "Siguiente",
    previousAria: "P\xE1gina anterior",
    nextAria: "P\xE1gina siguiente",
    noResults: "Sin resultados.",
    results_one: "{{count}} resultado",
    results_other: "{{count}} resultados",
    showingOf: "Mostrando {{shown}} de {{total}}",
    sortByAria: "Ordenar por {{column}}",
    selectAll: "Seleccionar todo",
    selectRow: "Seleccionar fila"
  },
  managerFilter: {
    label: "Manager",
    all: "Todos los managers",
    valueScopedSuffix: "(sus departamentos + sin asignar)"
  },
  scheduleJobBanner: {
    queued: "\u{1F4C5} Generaci\xF3n en cola para la semana del {{weekStart}}",
    active: "\u2699\uFE0F Generando horario para la semana del {{weekStart}}",
    multi_one: "{{count}} generaci\xF3n de horario en curso",
    multi_other: "{{count}} generaciones de horario en curso",
    viewLink: "Ver \u2192",
    cancel: "Cancelar",
    cancelling: "Cancelando\u2026",
    cancelSuccess: "Cancelaci\xF3n solicitada",
    cancelError: "No se pudo cancelar"
  },
  scheduleToast: {
    successTitle: "Horario generado",
    successBody: "La semana del {{weekStart}} est\xE1 lista. La grilla se actualiz\xF3.",
    failTitle: "No pudimos generar el horario",
    failBody: "Fall\xF3 la generaci\xF3n para la semana del {{weekStart}}. Revis\xE1 las reglas y volv\xE9 a intentarlo."
  },
  llmJobs: {
    banner: {
      in_flight: "Procesando con IA\u2026",
      in_flight_one: "Procesando {{count}} tarea con IA\u2026",
      in_flight_other: "Procesando {{count}} tareas con IA\u2026",
      success: "Listo",
      error: "Fall\xF3"
    },
    create_rule: {
      label: "Creando regla",
      successTitle: "Regla creada",
      successBody: "La nueva regla sem\xE1ntica fue agregada.",
      failTitle: "No se pudo crear la regla",
      failBody: "Fall\xF3 el procesamiento con IA. Intent\xE1 de nuevo."
    },
    update_rule_text: {
      label: "Actualizando regla",
      successTitle: "Regla actualizada",
      successBody: "La regla fue re-procesada.",
      failTitle: "No se pudo actualizar la regla",
      failBody: "Fall\xF3 el procesamiento con IA. Intent\xE1 de nuevo."
    },
    create_policy: {
      successTitle: "Pol\xEDtica creada",
      successBody: "La pol\xEDtica ya est\xE1 activa y se aplicar\xE1 la pr\xF3xima vez que generes un horario.",
      failTitle: "No se pudo crear la pol\xEDtica",
      failBody: "Intent\xE1 de nuevo o revis\xE1 el texto de la pol\xEDtica."
    },
    imports_extract: {
      label: "Extrayendo datos del archivo",
      successTitle: "Datos extra\xEDdos",
      successBody: "Listo. Revis\xE1 la preview y confirm\xE1 la importaci\xF3n.",
      failTitle: "No se pudieron extraer los datos",
      failBody: "El modelo de visi\xF3n fall\xF3. Prob\xE1 con otro archivo o revis\xE1 la integraci\xF3n de IA."
    }
  },
  history: {
    title: "Historial",
    button: "Historial",
    empty: "Sin historial todav\xEDa para este \xEDtem.",
    action: {
      create: "Creado",
      update: "Actualizado",
      delete: "Eliminado"
    }
  }
};

// src/i18n/es/errors.json
var errors_default2 = {
  EMPLOYEE_PHONE_DUPLICATE: "Ya existe un empleado con ese n\xFAmero de tel\xE9fono.",
  EMPLOYEE_EXTERNAL_ID_DUPLICATE: "Ya existe un empleado con ese ID externo.",
  MEMBERSHIP_DUPLICATE: "Ya existe un v\xEDnculo para ese empleado, template y fecha de inicio.",
  SKILL_DUPLICATE: "Esa skill ya est\xE1 en el cat\xE1logo del tenant.",
  POLICY_INTERPRETER_DUPLICATE: "Ya existe una pol\xEDtica activa para ese patr\xF3n. Edit\xE1 o desactiv\xE1 la existente primero.",
  UNIQUE_VIOLATION: "Ya existe un registro con esos datos.",
  NOT_NULL_VIOLATION: 'El campo "{{field}}" es obligatorio.',
  FOREIGN_KEY_VIOLATION: "La operaci\xF3n referencia un registro que ya no existe.",
  CHECK_VIOLATION: "Los datos enviados no cumplen una regla de validaci\xF3n.",
  INTERNAL_ERROR: "Ocurri\xF3 un error inesperado. Prob\xE1 de nuevo o contact\xE1 al soporte.",
  IMPORT_ALREADY_COMMITTED: "Esta empresa ya tiene una importaci\xF3n reciente. Revert\xED la anterior o esper\xE1 hasta que expire la ventana de revert (7 d\xEDas). Mir\xE1 Settings \u2192 Importar datos \u2192 Importaciones recientes.",
  GENERIC_HTTP: "Error del servidor ({{status}}). Prob\xE1 de nuevo.",
  UNKNOWN: "Algo sali\xF3 mal."
};

// src/i18n/index.ts
var sharedResources = {
  en: { common: common_default, errors: errors_default },
  es: { common: common_default2, errors: errors_default2 }
};
var SUPPORTED_LANGUAGES = ["en", "es"];
var FALLBACK_LANGUAGE = "en";

exports.CHAT_ALLOWED_ATTACHMENT_TYPES = CHAT_ALLOWED_ATTACHMENT_TYPES;
exports.CHAT_ALLOWED_FILE_TYPES = CHAT_ALLOWED_FILE_TYPES;
exports.CHAT_ALLOWED_IMAGE_TYPES = CHAT_ALLOWED_IMAGE_TYPES;
exports.CHAT_MAX_ATTACHMENT_BYTES = CHAT_MAX_ATTACHMENT_BYTES;
exports.CHAT_QUICK_REACTIONS = CHAT_QUICK_REACTIONS;
exports.FALLBACK_LANGUAGE = FALLBACK_LANGUAGE;
exports.SUPPORTED_LANGUAGES = SUPPORTED_LANGUAGES;
exports.attachmentKindForMime = attachmentKindForMime;
exports.botOptionSchema = botOptionSchema;
exports.botPayloadSchema = botPayloadSchema;
exports.botSkippedSchema = botSkippedSchema;
exports.chatContactSchema = chatContactSchema;
exports.chatMemberSchema = chatMemberSchema;
exports.chatMessageCreatedEventSchema = chatMessageCreatedEventSchema;
exports.chatMessageSchema = chatMessageSchema;
exports.chatMessageUpdatedEventSchema = chatMessageUpdatedEventSchema;
exports.chatReadEventSchema = chatReadEventSchema;
exports.chatReadSchema = chatReadSchema;
exports.chatRoomSchema = chatRoomSchema;
exports.chatTypingEventSchema = chatTypingEventSchema;
exports.clockEventSchema = clockEventSchema;
exports.clockEventTypeSchema = clockEventTypeSchema;
exports.clockEventsSchema = clockEventsSchema;
exports.clockGpsSchema = clockGpsSchema;
exports.clockValidationStatusSchema = clockValidationStatusSchema;
exports.createApiClient = createApiClient;
exports.createClockEventInputSchema = createClockEventInputSchema;
exports.createRoomInputSchema = createRoomInputSchema;
exports.describeApiError = describeApiError;
exports.formatShiftRef = formatShiftRef;
exports.geoLocationSchema = geoLocationSchema;
exports.myLocationsSchema = myLocationsSchema;
exports.myProfileSchema = myProfileSchema;
exports.reactionInputSchema = reactionInputSchema;
exports.registerDeviceInputSchema = registerDeviceInputSchema;
exports.scheduleAssignmentBreakSchema = scheduleAssignmentBreakSchema;
exports.scheduleAssignmentSchema = scheduleAssignmentSchema;
exports.scheduleAssignmentsSchema = scheduleAssignmentsSchema;
exports.sendMessageInputSchema = sendMessageInputSchema;
exports.sharedResources = sharedResources;
exports.tagDomainSchema = tagDomainSchema;
exports.workforceTagSchema = workforceTagSchema;
exports.workforceTagsSchema = workforceTagsSchema;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map