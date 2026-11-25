import { z } from 'zod';
import type { typePayload } from '../types/publish.post';

export const payloadSchema = z.object({
  postId: z.string().min(1),
  publishAt: z.string().min(1).optional(),
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
