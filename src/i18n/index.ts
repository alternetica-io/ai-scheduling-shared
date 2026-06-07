import enCommon from './en/common.json';
import enErrors from './en/errors.json';
import esCommon from './es/common.json';
import esErrors from './es/errors.json';

/**
 * i18n catalogs shared by web and mobile: the `common` (shared UI strings) and
 * `errors` (errorCode → message, used by `describeApiError`) namespaces.
 * App-specific namespaces stay in each app. Consumers merge these into their
 * own i18next instance.
 */
export const sharedResources = {
  en: { common: enCommon, errors: enErrors },
  es: { common: esCommon, errors: esErrors },
} as const;

export const SUPPORTED_LANGUAGES = ['en', 'es'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const FALLBACK_LANGUAGE: SupportedLanguage = 'en';
