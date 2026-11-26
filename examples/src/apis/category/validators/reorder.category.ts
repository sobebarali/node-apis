import { z } from 'zod';
import type { typePayload } from '../types/reorder.category';

export const payloadSchema = z.object({
  parentId: z.string().nullable(),
  orderedIds: z.array(z.string()),
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
