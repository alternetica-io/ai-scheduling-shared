// src/types/approvals.ts
function formatShiftRef(ref, locale) {
  const t = (iso) => new Date(iso).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  return {
    day: (/* @__PURE__ */ new Date(`${ref.date}T00:00:00`)).toLocaleDateString(locale, {
      weekday: "short",
      day: "2-digit",
      month: "short"
    }),
    time: `${t(ref.start)} \u2013 ${t(ref.end)}`
  };
}

export { formatShiftRef };
//# sourceMappingURL=chunk-DEF2QKTS.js.map
//# sourceMappingURL=chunk-DEF2QKTS.js.map