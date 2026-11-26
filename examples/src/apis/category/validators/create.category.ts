import { z } from 'zod';
import type { typePayload } from '../types/create.category';

export const payloadSchema = z.object({
  name: z.string(),
  slug: z.string(),
  parentId: z.string().optional(),
  iconUrl: z.string().url().optional(),
  seo: z.object({
    title: z.string(),
    description: z.string().optional(),
  }),
  translations: z.array(
    z.object({
      locale: z.enum(['en', 'ar', 'fr']),
      name: z.string(),
    })
  ),
  attributes: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
}) satisfies z.ZodType<typePayload>;

export const validatePayload = (
  data: unknown
): { success: true; data: typePayload } | { success: false; error: z.ZodError } => {
  const result = payloadSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, error: result.error };
};
