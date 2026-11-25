import { z } from 'zod';
import type { typePayload } from '../types/list.category';

export const payloadSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  parentId: z.string().min(1).optional(),
  sortBy: z.enum(['name', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
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
