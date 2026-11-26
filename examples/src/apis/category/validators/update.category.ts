import { z } from 'zod';
import type { typePayload } from '../types/update.category';

export const payloadSchema = z.object({
  categoryId: z.string(),
  name: z.string().optional(),
  slug: z.string().optional(),
  parentId: z.string().nullable().optional(),
  iconUrl: z.string().url().nullable().optional(),
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
