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
/** `true` if the text is a library's, not a message written for a person. */
declare function isLibraryText(text: string): boolean;
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
declare function describeApiError(err: unknown, t: TranslateFn): string;

export { type BackendErrorBody, type TranslateFn, describeApiError, isLibraryText };
