/**
 * Zod contracts shared between web and mobile, mirroring the backend DTOs
 * (`ai-scheduling-orchestrator/src/interfaces/dtos`). Feature schemas land
 * here per sprint (timeclock event, chat message, employee self-view, …).
 * Keep schemas as the single source of truth and derive types with
 * `z.infer<typeof schema>` instead of hand-writing duplicates.
 */
export {};
