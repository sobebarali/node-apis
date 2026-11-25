import { z } from 'zod';
import type { typePayload } from '../types/create.post';

export const payloadSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  authorId: z.string().min(1),
  tags: z.array(z.string().min(1)).optional(),
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
