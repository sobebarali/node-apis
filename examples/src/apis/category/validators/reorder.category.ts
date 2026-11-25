import { z } from 'zod';
import type { typePayload } from '../types/reorder.category';

export const payloadSchema = z.object({
  parentId: z.string().min(1).nullable(),
  orderedIds: z.array(z.string().min(1)),
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
