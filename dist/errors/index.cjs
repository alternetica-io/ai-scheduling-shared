'use strict';

var axios = require('axios');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var axios__default = /*#__PURE__*/_interopDefault(axios);

// src/errors/api-error.ts
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

exports.describeApiError = describeApiError;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map