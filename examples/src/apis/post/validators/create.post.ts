import { z } from 'zod';
import type { typePayload } from '../types/create.post';

export const payloadSchema = z.object({
  title: z.string(),
  content: z.string(),
  authorId: z.string(),
  tags: z.array(z.string()).optional(),
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
