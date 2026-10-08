export { formatShiftRef } from './chunk-HMODOVN7.js';
export { createApiClient } from './chunk-ALEQ5QUT.js';
export { describeApiError } from './chunk-4F6AZ26W.js';
export { CHAT_ALLOWED_ATTACHMENT_TYPES, CHAT_ALLOWED_FILE_TYPES, CHAT_ALLOWED_IMAGE_TYPES, CHAT_MAX_ATTACHMENT_BYTES, CHAT_QUICK_REACTIONS, attachmentKindForMime, botOptionSchema, botPayloadSchema, botSkippedSchema, chatContactSchema, chatMemberSchema, chatMessageCreatedEventSchema, chatMessageSchema, chatMessageUpdatedEventSchema, chatReadEventSchema, chatReadSchema, chatRoomSchema, chatTypingEventSchema, clockEventSchema, clockEventTypeSchema, clockEventsSchema, clockGpsSchema, clockValidationStatusSchema, createClockEventInputSchema, createRoomInputSchema, geoLocationSchema, myLocationsSchema, myProfileSchema, reactionInputSchema, registerDeviceInputSchema, scheduleAssignmentBreakSchema, scheduleAssignmentSchema, scheduleAssignmentsSchema, sendMessageInputSchema, tagDomainSchema, workforceTagSchema, workforceTagsSchema } from './chunk-SHO4AN36.js';
export { FALLBACK_LANGUAGE, SUPPORTED_LANGUAGES, sharedResources } from './chunk-RQBUBIPK.js';

// src/time/zone.ts
var pad = (n) => String(n).padStart(2, "0");
function partsInZone(instantMs, tz) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).formatToParts(new Date(instantMs));
  const get = (t) => Number(parts.find((p) => p.type === t)?.value ?? "0");
  return {
    y: get("year"),
    mo: get("month"),
    d: get("day"),
    // `hour12: false` puede devolver 24 para la medianoche en algunos runtimes.
    h: get("hour") % 24,
    mi: get("minute"),
    s: get("second")
  };
}
function zoneOffsetMs(instantMs, tz) {
  const p = partsInZone(instantMs, tz);
  return Date.UTC(p.y, p.mo - 1, p.d, p.h, p.mi, p.s) - instantMs;
}
function todayInZone(tz, now = /* @__PURE__ */ new Date()) {
  const p = partsInZone(now.getTime(), tz);
  return `${p.y}-${pad(p.mo)}-${pad(p.d)}`;
}
function wallMinutesInZone(instant, tz) {
  const ms = typeof instant === "string" ? Date.parse(instant) : instant.getTime();
  const p = partsInZone(ms, tz);
  return p.h * 60 + p.mi;
}
function instantToWallClock(instant, tz) {
  const ms = typeof instant === "string" ? Date.parse(instant) : instant.getTime();
  const p = partsInZone(ms, tz);
  return new Date(Date.UTC(p.y, p.mo - 1, p.d, p.h, p.mi, p.s)).toISOString();
}
var PROBE_MS = 6 * 3600 * 1e3;
function wallClockToInstantMs(wallClockIso, tz) {
  const wallMs = Date.parse(wallClockIso);
  const approx = wallMs - zoneOffsetMs(wallMs, tz);
  const before = zoneOffsetMs(approx - PROBE_MS, tz);
  const after = zoneOffsetMs(approx + PROBE_MS, tz);
  if (before === after) return wallMs - before;
  const candBefore = wallMs - before;
  const candAfter = wallMs - after;
  const okBefore = zoneOffsetMs(candBefore, tz) === before;
  const okAfter = zoneOffsetMs(candAfter, tz) === after;
  if (okBefore && okAfter) return Math.min(candBefore, candAfter);
  if (okBefore) return candBefore;
  if (okAfter) return candAfter;
  return candBefore;
}
function wallClockToInstantIso(wallClockIso, tz) {
  return new Date(wallClockToInstantMs(wallClockIso, tz)).toISOString();
}
function weekStartOfDate(ymd, firstDay) {
  const [y, m, d] = ymd.split("-").map(Number);
  const anchor = Date.UTC(y, m - 1, d);
  const dow = new Date(anchor).getUTCDay();
  const start = firstDay === "sunday" ? 0 : 1;
  const offset = (dow - start + 7) % 7;
  const out = new Date(anchor - offset * 864e5);
  return `${out.getUTCFullYear()}-${pad(out.getUTCMonth() + 1)}-${pad(out.getUTCDate())}`;
}
function weekStartInZone(tz, firstDay, now = /* @__PURE__ */ new Date()) {
  return weekStartOfDate(todayInZone(tz, now), firstDay);
}
function addDaysToDate(ymd, days) {
  const [y, m, d] = ymd.split("-").map(Number);
  const out = new Date(
    Date.UTC(y, m - 1, d) + days * 864e5
  );
  return `${out.getUTCFullYear()}-${pad(out.getUTCMonth() + 1)}-${pad(out.getUTCDate())}`;
}

// src/time/shift-interval.ts
function scheduledInterval(t) {
  return {
    start: t.plannedStart ?? t.actualStart ?? null,
    end: t.plannedEnd ?? t.actualEnd ?? null
  };
}
function workedInterval(t) {
  return { start: t.actualStart ?? null, end: t.actualEnd ?? null };
}
function shiftTimesDiffer(t) {
  const p = scheduledInterval(t);
  const w = workedInterval(t);
  return p.start !== w.start || p.end !== w.end;
}

// src/auth/mfa.ts
function needsMfaChallenge(aal) {
  return aal.nextLevel === "aal2" && aal.currentLevel === "aal1";
}

export { addDaysToDate, instantToWallClock, needsMfaChallenge, scheduledInterval, shiftTimesDiffer, todayInZone, wallClockToInstantIso, wallClockToInstantMs, wallMinutesInZone, weekStartInZone, weekStartOfDate, workedInterval };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map