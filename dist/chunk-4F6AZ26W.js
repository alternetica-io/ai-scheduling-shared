import axios from 'axios';

// src/errors/api-error.ts
function describeApiError(err, t) {
  if (axios.isAxiosError(err)) {
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

export { describeApiError };
//# sourceMappingURL=chunk-4F6AZ26W.js.map
//# sourceMappingURL=chunk-4F6AZ26W.js.map