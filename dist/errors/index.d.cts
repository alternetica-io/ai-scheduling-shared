/**
 * Stable error envelope returned by the orchestrator backend. `errorCode`
 * (e.g. `EMPLOYEE_PHONE_DUPLICATE`) is the contract; the frontend resolves
 * it to a user-facing message via the `errors:<code>` i18n namespace.
 */
interface BackendErrorBody {
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
type TranslateFn = (key: string, params?: Record<string, unknown>) => string;
/**
 * Turns any caught error into a translated, user-friendly string.
 *
 * Resolution order: `errors:<errorCode>` → backend `message` → HTTP status →
 * generic. i18next returns the key unchanged when there is no translation, so
 * we fall through when the lookup did not resolve.
 */
declare function describeApiError(err: unknown, t: TranslateFn): string;

export { type BackendErrorBody, type TranslateFn, describeApiError };
