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
 * Turns any caught error into a translated, user-friendly string.
 *
 * Resolution order: `errors:<errorCode>` → backend `message` → HTTP status →
 * generic. i18next returns the key unchanged when there is no translation, so
 * we fall through when the lookup did not resolve.
 */
export function describeApiError(err: unknown, t: TranslateFn): string {
  if (axios.isAxiosError(err)) {
    const data = (err.response?.data ?? {}) as BackendErrorBody;

    if (data.errorCode) {
      const key = `errors:${data.errorCode}`;
      const translated = t(key, {
        field: data.field ?? '',
        constraint: data.constraint ?? '',
      });
      if (translated !== key && translated !== data.errorCode) return translated;
    }

    if (Array.isArray(data.message)) return data.message.join(' · ');
    if (data.message) return data.message;

    if (err.response?.status) {
      return t('errors:GENERIC_HTTP', { status: err.response.status });
    }
  }

  if (err instanceof Error && err.message) return err.message;

  return t('errors:UNKNOWN');
}
