import axios from 'axios';

// src/api/client.ts
var DEFAULT_TIMEOUT_MS = 3e4;
function createApiClient(adapters) {
  const api = axios.create({
    baseURL: adapters.baseURL,
    timeout: adapters.timeoutMs ?? DEFAULT_TIMEOUT_MS
  });
  api.interceptors.request.use(async (cfg) => {
    const url = cfg.url ?? "";
    if (adapters.shouldShortCircuit?.(url)) {
      cfg.adapter = async () => ({
        data: [],
        status: 200,
        statusText: "OK (short-circuit)",
        headers: {},
        config: cfg
      });
      return cfg;
    }
    const lang = adapters.getLanguage?.();
    if (lang) cfg.headers.set("Accept-Language", lang);
    const token = await adapters.getAccessToken();
    if (token) cfg.headers.set("Authorization", `Bearer ${token}`);
    return cfg;
  });
  api.interceptors.response.use(
    (r) => r,
    async (err) => {
      const response = err.response;
      const status = response?.status;
      if (status === 401) {
        await adapters.onUnauthorized?.();
      } else if (status === 402) {
        const code = response?.data?.errorCode;
        const reason = code === "SUBSCRIPTION_CANCELED" ? "SUBSCRIPTION_CANCELED" : "TRIAL_EXPIRED";
        adapters.onPaymentRequired?.(reason);
      }
      return Promise.reject(err);
    }
  );
  return api;
}

export { createApiClient };
//# sourceMappingURL=chunk-ALEQ5QUT.js.map
//# sourceMappingURL=chunk-ALEQ5QUT.js.map