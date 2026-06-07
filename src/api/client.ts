import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import type { BackendErrorBody } from '../errors/api-error';

export type PaymentRequiredReason = 'TRIAL_EXPIRED' | 'SUBSCRIPTION_CANCELED';

/**
 * Platform-agnostic adapters supplied by each consumer. The web wires these
 * to Supabase session + i18next + the billing store + `window`; the mobile app
 * wires them to the native Supabase session + i18next + navigation. The core
 * interceptor logic (auth header, language header, 401/402 handling) lives here
 * once so both platforms behave identically.
 */
export interface ApiClientAdapters {
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

const DEFAULT_TIMEOUT_MS = 30_000;

/** Builds the shared axios instance with auth/language/401/402 interceptors. */
export function createApiClient(adapters: ApiClientAdapters): AxiosInstance {
  const api = axios.create({
    baseURL: adapters.baseURL,
    timeout: adapters.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  });

  api.interceptors.request.use(async (cfg: InternalAxiosRequestConfig) => {
    const url = cfg.url ?? '';

    if (adapters.shouldShortCircuit?.(url)) {
      cfg.adapter = async (): Promise<AxiosResponse> =>
        ({
          data: [],
          status: 200,
          statusText: 'OK (short-circuit)',
          headers: {},
          config: cfg,
        }) as AxiosResponse;
      return cfg;
    }

    // The backend derives the tenant (company_id) from the validated JWT.
    // We never send a client-provided company id — it would be a cross-tenant
    // vector and the backend ignores it. Only the Bearer token + language.
    const lang = adapters.getLanguage?.();
    if (lang) cfg.headers.set('Accept-Language', lang);

    const token = await adapters.getAccessToken();
    if (token) cfg.headers.set('Authorization', `Bearer ${token}`);

    return cfg;
  });

  api.interceptors.response.use(
    (r) => r,
    async (err: unknown) => {
      const response = (err as { response?: { status?: number; data?: BackendErrorBody } })
        .response;
      const status = response?.status;

      if (status === 401) {
        await adapters.onUnauthorized?.();
      } else if (status === 402) {
        const code = response?.data?.errorCode;
        const reason: PaymentRequiredReason =
          code === 'SUBSCRIPTION_CANCELED' ? 'SUBSCRIPTION_CANCELED' : 'TRIAL_EXPIRED';
        adapters.onPaymentRequired?.(reason);
      }

      return Promise.reject(err);
    },
  );

  return api;
}
