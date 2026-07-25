import { z } from 'zod';

/**
 * Contrato del catálogo de tags por tenant (subsistema Tags). Espeja
 * `GET /tags` del backend (orchestrator `TagsController`). Un tag aplica a uno
 * o más dominios (horario / asistencia). Los de sistema (`isSystem`, ej.
 * "Manual") se pueden renombrar/recolorear pero no borrar.
 */
export const tagDomainSchema = z.enum(['schedule', 'attendance']);
export type TagDomain = z.infer<typeof tagDomainSchema>;

export const workforceTagSchema = z.object({
  id: z.string(),
  name: z.string(),
  /** Hex del chip. null = usar fallback. */
  color: z.string().nullable().default(null),
  domains: z.array(tagDomainSchema).default([]),
  isSystem: z.boolean().default(false),
});
export const workforceTagsSchema = z.array(workforceTagSchema);
export type WorkforceTag = z.infer<typeof workforceTagSchema>;
