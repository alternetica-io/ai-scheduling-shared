import { AxiosInstance } from 'axios';

type PaymentRequiredReason = 'TRIAL_EXPIRED' | 'SUBSCRIPTION_CANCELED';
/**
 * Platform-agnostic adapters supplied by each consumer. The web wires these
 * to Supabase session + i18next + the billing store + `window`; the mobile app
 * wires them to the native Supabase session + i18next + navigation. The core
 * interceptor logic (auth header, language header, 401/402 handling) lives here
 * once so both platforms behave identically.
 */
interface ApiClientAdapters {
    baseURL: string;
    timeoutMs?: number;
    /** Current access token, or null when there is no session. */
    getAccessToken: () => Promise<string | null> | string | null;
    /** Active UI language for the `Accept-Language` header. */
    getLanguage?: () => string | null | undefined;
    /** Called on HTTP 401 (invalid/expired session) — e.g. sign out + redirect. */
    onUnauthorized?: () => Promise<void> | void;
    /** Called on HTTP 402 (billing) with the reason derived from the error code. */
    onPaymentRequired?: (reason: PaymentRequiredReason) => void;
    /**
     * Optional predicate to short-circuit a request with an empty array response
     * without hitting the network (web uses this for the platform-admin no-tenant
     * case). Return true to short-circuit the given URL.
     */
    shouldShortCircuit?: (url: string) => boolean;
}
/** Builds the shared axios instance with auth/language/401/402 interceptors. */
declare function createApiClient(adapters: ApiClientAdapters): AxiosInstance;

export { type ApiClientAdapters, type PaymentRequiredReason, createApiClient };
