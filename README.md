# @ai-scheduling/shared

Single source of truth for the contracts shared by the **AI Scheduling Orchestrator** web admin (`ai-scheduling-frontend`) and mobile app (`ai-scheduling-mobile`). Keeping these here prevents the two clients from drifting apart and removes hand-maintained duplicates.

## What's inside

| Subpath | Contents |
|---|---|
| `@ai-scheduling/shared/types` | Domain TS types (`Employee`, `ShiftMembership`, approvals, policies, fairness, …) |
| `@ai-scheduling/shared/schemas` | Zod contracts mirroring backend DTOs (filled per feature sprint) |
| `@ai-scheduling/shared/errors` | `describeApiError(err, t)` + `BackendErrorBody` |
| `@ai-scheduling/shared/api` | `createApiClient(adapters)` — storage-agnostic axios core |
| `@ai-scheduling/shared/i18n` | Shared `common` + `errors` catalogs (EN/ES) + `sharedResources` |

The root barrel (`@ai-scheduling/shared`) re-exports everything.

## Design notes

- **No platform runtime deps.** `axios` and `zod` are *peer* dependencies; i18n is abstracted behind an injected `TranslateFn`. The same code runs under Vite (web) and Metro/Expo (mobile).
- **Tenant from JWT.** The api core never sends a client-provided company id; the backend derives it from the validated token.
- Consumers supply platform adapters (token getter, language getter, 401/402 handlers) to `createApiClient`.

## Usage

```ts
import { createApiClient, describeApiError, sharedResources } from '@ai-scheduling/shared';

const api = createApiClient({
  baseURL: API_URL,
  getAccessToken: async () => (await supabase.auth.getSession()).data.session?.access_token ?? null,
  getLanguage: () => i18n.language,
  onUnauthorized: () => supabase.auth.signOut(),
  onPaymentRequired: (reason) => billing.lock(reason),
});
```

## Build

```bash
pnpm install
pnpm build       # tsup → dist (ESM + CJS + d.ts)
pnpm typecheck
```

## Consumption

Until a registry is set up, both repos consume this as a local/git dependency (e.g. `link:../ai-scheduling-shared` for local dev, or a git dependency for CI). Private package — not published publicly.
