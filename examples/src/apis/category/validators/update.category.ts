import { z } from 'zod';
import type { typePayload } from '../types/update.category';

export const payloadSchema = z.object({
  categoryId: z.string().min(1),
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  parentId: z.string().min(1).nullable().optional(),
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
