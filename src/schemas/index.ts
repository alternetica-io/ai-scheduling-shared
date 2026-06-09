/**
 * Zod contracts shared between web and mobile, mirroring the backend DTOs
 * (`ai-scheduling-orchestrator/src/interfaces/dtos` + query handler DTOs).
 * Keep schemas as the single source of truth and derive types with
 * `z.infer<typeof schema>` instead of hand-writing duplicates.
 */
export * from './schedule';
export * from './timeclock';
export * from './chat';
