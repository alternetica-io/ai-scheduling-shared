import axios from 'axios';

/**
 * Stable error envelope returned by the orchestrator backend. `errorCode`
 * (e.g. `EMPLOYEE_PHONE_DUPLICATE`) is the contract; the frontend resolves
 * it to a user-facing message via the `errors:<code>` i18n namespace.
 */
export interface BackendErrorBody {
  errorCode?: string;
  message?: string | string[];
  field?: string;
  constraint?: string;
}

/**
 * Translation function injected by the consumer (web: i18next `t`; mobile:
 * the native i18next `t`). Kept abstract so this package has no i18n runtime
 * dependency and works identically on both platforms.
 */
export type TranslateFn = (key: string, params?: Record<string, unknown>) => string;

/**
 * Text that comes from a library, not from a person: axios ("Request failed
 * with status code 409", "Network Error", "timeout of 10000ms exceeded"), a
 * JSON parser, or a validation dump. It never reaches the screen
 * (front #28).
 */
const LIBRARY_TEXT = [
  /request failed with status code/i,
  /^network error$/i,
  /^timeout of \d+ms exceeded$/i,
  /unexpected token/i,
  /^\s*[[{]/, // a serialized object or array, e.g. a Zod issue list
];

/** `true` if the text is a library's, not a message written for a person. */
export function isLibraryText(text: string): boolean {
  return LIBRARY_TEXT.some((re) => re.test(text));
}

/**
 * Turns any caught error into a translated message a person can read. It is
 * the only place that does it: every screen, web and mobile, goes through it.
 *
 * Order:
 * 1. no response → no connection; 429 → wait; 5xx → our side;
 * 2. `errorCode` → `errors:<code>`;
 * 3. the backend's `message`, already in the user's language — except a
 *    class-validator list, which is technical (`scopeId must be a UUID`);
 * 4. otherwise, a generic "could not complete the action".
 *
 * It never returns an HTTP status code nor a library's text (front #28: the
 * toast read "Request failed with status code 409").
 */
export function describeApiError(err: unknown, t: TranslateFn): string {
  if (axios.isAxiosError(err)) {
    if (!err.response) return t('errors:NETWORK');
    const status = err.response.status;
    if (status === 429) return t('errors:RATE_LIMITED');
    if (status >= 500) return t('errors:SERVER');

    const data = (err.response.data ?? {}) as BackendErrorBody;
    if (data.errorCode) {
      const key = `errors:${data.errorCode}`;
      const translated = t(key, {
        field: data.field ?? '',
        constraint: data.constraint ?? '',
      });
      if (translated !== key && translated !== data.errorCode) return translated;
    }

    if (Array.isArray(data.message)) return t('errors:VALIDATION');
    if (typeof data.message === 'string' && data.message.trim() && !isLibraryText(data.message)) {
      return data.message;
    }
    return t('errors:GENERIC');
  }

  // A thrown Error written by the app itself can carry a message meant for the
  // user; anything that reads like a library's text does not.
  if (err instanceof Error && err.message && !isLibraryText(err.message)) {
    return err.message;
  }
  return t('errors:GENERIC');
}
