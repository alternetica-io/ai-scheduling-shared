/**
 * i18n catalogs shared by web and mobile: the `common` (shared UI strings) and
 * `errors` (errorCode → message, used by `describeApiError`) namespaces.
 * App-specific namespaces stay in each app. Consumers merge these into their
 * own i18next instance.
 */
declare const sharedResources: {
    readonly en: {
        readonly common: {
            app: {
                title: string;
                scenario: string;
                managerView: string;
            };
            languageSwitcher: {
                toggleTo: string;
            };
            theme: {
                switchToLight: string;
                switchToDark: string;
            };
            notifications: {
                title: string;
                empty: string;
                summary_one: string;
                summary_other: string;
                countLabel_one: string;
                countLabel_other: string;
                sections: {
                    swaps: string;
                    dayoffs: string;
                    incidents: string;
                    absences: string;
                };
                swapBetween: string;
                dayOff: string;
                incident: string;
                absence: string;
                justNow: string;
                minutesAgo_one: string;
                minutesAgo_other: string;
                hoursAgo_one: string;
                hoursAgo_other: string;
                approved: string;
                rejected: string;
            };
            trialBanner: {
                active_one: string;
                active_other: string;
                endingSoon_one: string;
                endingSoon_other: string;
                expired: string;
                canceled: string;
                cta: string;
            };
            billingEnforcer: {
                expiredTitle: string;
                expiredBody: string;
                canceledTitle: string;
                canceledBody: string;
                cta: string;
                logout: string;
            };
            billing: {
                tierPicker: {
                    title: string;
                    subtitle: string;
                    select: string;
                    redirecting: string;
                    trust: string;
                };
                portal: {
                    openLabel: string;
                    redirecting: string;
                };
                errors: {
                    noCustomer: string;
                };
            };
            actions: {
                create: string;
                save: string;
                cancel: string;
                edit: string;
                delete: string;
                deleting: string;
                saving: string;
                close: string;
                back: string;
                confirm: string;
                search: string;
                filter: string;
                clear: string;
                retry: string;
                loading: string;
                understood: string;
                yes: string;
                no: string;
            };
            states: {
                active: string;
                inactive: string;
                loading: string;
                empty: string;
                error: string;
                none: string;
            };
            table: {
                rowsPerPage: string;
                rowsLabel: string;
                page: string;
                previous: string;
                next: string;
                previousAria: string;
                nextAria: string;
                noResults: string;
                results_one: string;
                results_other: string;
                showingOf: string;
                sortByAria: string;
                selectAll: string;
                selectRow: string;
            };
            managerFilter: {
                label: string;
                all: string;
                valueScopedSuffix: string;
            };
            scheduleJobBanner: {
                queued: string;
                active: string;
                multi_one: string;
                multi_other: string;
                viewLink: string;
                cancel: string;
                cancelling: string;
                cancelSuccess: string;
                cancelError: string;
            };
            scheduleToast: {
                successTitle: string;
                successBody: string;
                failTitle: string;
                failBody: string;
            };
            llmJobs: {
                banner: {
                    in_flight: string;
                    in_flight_one: string;
                    in_flight_other: string;
                    success: string;
                    error: string;
                };
                create_rule: {
                    label: string;
                    successTitle: string;
                    successBody: string;
                    failTitle: string;
                    failBody: string;
                };
                update_rule_text: {
                    label: string;
                    successTitle: string;
                    successBody: string;
                    failTitle: string;
                    failBody: string;
                };
                create_policy: {
                    successTitle: string;
                    successBody: string;
                    failTitle: string;
                    failBody: string;
                };
                imports_extract: {
                    label: string;
                    successTitle: string;
                    successBody: string;
                    failTitle: string;
                    failBody: string;
                };
            };
            history: {
                title: string;
                button: string;
                empty: string;
                action: {
                    create: string;
                    update: string;
                    delete: string;
                };
            };
        };
        readonly errors: {
            EMPLOYEE_PHONE_DUPLICATE: string;
            EMPLOYEE_EXTERNAL_ID_DUPLICATE: string;
            MEMBERSHIP_DUPLICATE: string;
            SKILL_DUPLICATE: string;
            POLICY_INTERPRETER_DUPLICATE: string;
            UNIQUE_VIOLATION: string;
            NOT_NULL_VIOLATION: string;
            FOREIGN_KEY_VIOLATION: string;
            CHECK_VIOLATION: string;
            INTERNAL_ERROR: string;
            IMPORT_ALREADY_COMMITTED: string;
            GENERIC_HTTP: string;
            UNKNOWN: string;
        };
    };
    readonly es: {
        readonly common: {
            app: {
                title: string;
                scenario: string;
                managerView: string;
            };
            languageSwitcher: {
                toggleTo: string;
            };
            theme: {
                switchToLight: string;
                switchToDark: string;
            };
            notifications: {
                title: string;
                empty: string;
                summary_one: string;
                summary_other: string;
                countLabel_one: string;
                countLabel_other: string;
                sections: {
                    swaps: string;
                    dayoffs: string;
                    incidents: string;
                    absences: string;
                };
                swapBetween: string;
                dayOff: string;
                incident: string;
                absence: string;
                justNow: string;
                minutesAgo_one: string;
                minutesAgo_other: string;
                hoursAgo_one: string;
                hoursAgo_other: string;
                approved: string;
                rejected: string;
            };
            trialBanner: {
                active_one: string;
                active_other: string;
                endingSoon_one: string;
                endingSoon_other: string;
                expired: string;
                canceled: string;
                cta: string;
            };
            billingEnforcer: {
                expiredTitle: string;
                expiredBody: string;
                canceledTitle: string;
                canceledBody: string;
                cta: string;
                logout: string;
            };
            billing: {
                tierPicker: {
                    title: string;
                    subtitle: string;
                    select: string;
                    redirecting: string;
                    trust: string;
                };
                portal: {
                    openLabel: string;
                    redirecting: string;
                };
                errors: {
                    noCustomer: string;
                };
            };
            actions: {
                create: string;
                save: string;
                cancel: string;
                edit: string;
                delete: string;
                deleting: string;
                saving: string;
                close: string;
                back: string;
                confirm: string;
                search: string;
                filter: string;
                clear: string;
                retry: string;
                loading: string;
                understood: string;
                yes: string;
                no: string;
            };
            states: {
                active: string;
                inactive: string;
                loading: string;
                empty: string;
                error: string;
                none: string;
            };
            table: {
                rowsPerPage: string;
                rowsLabel: string;
                page: string;
                previous: string;
                next: string;
                previousAria: string;
                nextAria: string;
                noResults: string;
                results_one: string;
                results_other: string;
                showingOf: string;
                sortByAria: string;
                selectAll: string;
                selectRow: string;
            };
            managerFilter: {
                label: string;
                all: string;
                valueScopedSuffix: string;
            };
            scheduleJobBanner: {
                queued: string;
                active: string;
                multi_one: string;
                multi_other: string;
                viewLink: string;
                cancel: string;
                cancelling: string;
                cancelSuccess: string;
                cancelError: string;
            };
            scheduleToast: {
                successTitle: string;
                successBody: string;
                failTitle: string;
                failBody: string;
            };
            llmJobs: {
                banner: {
                    in_flight: string;
                    in_flight_one: string;
                    in_flight_other: string;
                    success: string;
                    error: string;
                };
                create_rule: {
                    label: string;
                    successTitle: string;
                    successBody: string;
                    failTitle: string;
                    failBody: string;
                };
                update_rule_text: {
                    label: string;
                    successTitle: string;
                    successBody: string;
                    failTitle: string;
                    failBody: string;
                };
                create_policy: {
                    successTitle: string;
                    successBody: string;
                    failTitle: string;
                    failBody: string;
                };
                imports_extract: {
                    label: string;
                    successTitle: string;
                    successBody: string;
                    failTitle: string;
                    failBody: string;
                };
            };
            history: {
                title: string;
                button: string;
                empty: string;
                action: {
                    create: string;
                    update: string;
                    delete: string;
                };
            };
        };
        readonly errors: {
            EMPLOYEE_PHONE_DUPLICATE: string;
            EMPLOYEE_EXTERNAL_ID_DUPLICATE: string;
            MEMBERSHIP_DUPLICATE: string;
            SKILL_DUPLICATE: string;
            POLICY_INTERPRETER_DUPLICATE: string;
            UNIQUE_VIOLATION: string;
            NOT_NULL_VIOLATION: string;
            FOREIGN_KEY_VIOLATION: string;
            CHECK_VIOLATION: string;
            INTERNAL_ERROR: string;
            IMPORT_ALREADY_COMMITTED: string;
            GENERIC_HTTP: string;
            UNKNOWN: string;
        };
    };
};
declare const SUPPORTED_LANGUAGES: readonly ["en", "es"];
type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
declare const FALLBACK_LANGUAGE: SupportedLanguage;

export { FALLBACK_LANGUAGE, SUPPORTED_LANGUAGES, type SupportedLanguage, sharedResources };
