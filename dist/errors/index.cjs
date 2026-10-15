'use strict';

var axios = require('axios');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var axios__default = /*#__PURE__*/_interopDefault(axios);

// src/errors/api-error.ts
var LIBRARY_TEXT = [
  /request failed with status code/i,
  /^network error$/i,
  /^timeout of \d+ms exceeded$/i,
  /unexpected token/i,
  /^\s*[[{]/
  // a serialized object or array, e.g. a Zod issue list
];
function isLibraryText(text) {
  return LIBRARY_TEXT.some((re) => re.test(text));
}
function describeApiError(err, t) {
  if (axios__default.default.isAxiosError(err)) {
    if (!err.response) return t("errors:NETWORK");
    const status = err.response.status;
    if (status === 429) return t("errors:RATE_LIMITED");
    if (status >= 500) return t("errors:SERVER");
    const data = err.response.data ?? {};
    if (data.errorCode) {
      const key = `errors:${data.errorCode}`;
      const translated = t(key, {
        field: data.field ?? "",
        constraint: data.constraint ?? ""
      });
      if (translated !== key && translated !== data.errorCode) return translated;
    }
    if (Array.isArray(data.message)) return t("errors:VALIDATION");
    if (typeof data.message === "string" && data.message.trim() && !isLibraryText(data.message)) {
      return data.message;
    }
    return t("errors:GENERIC");
  }
  if (err instanceof Error && err.message && !isLibraryText(err.message)) {
    return err.message;
  }
  return t("errors:GENERIC");
}

exports.describeApiError = describeApiError;
exports.isLibraryText = isLibraryText;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map