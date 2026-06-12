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

export { formatShiftRef };
//# sourceMappingURL=chunk-HMODOVN7.js.map
//# sourceMappingURL=chunk-HMODOVN7.js.map