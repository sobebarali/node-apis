import list from '../repository/list.category';
import type { typePayload, typeResult } from '../types/list.category';

export default async function listCategoriesHandler({
  page,
  limit,
  parentId,
  sortBy,
  sortOrder,
  requestId,
}: typePayload & { requestId: string }): Promise<typeResult> {
  try {
    const data = await list({ page, limit, parentId, sortBy, sortOrder });

    return { data, error: null };
  } catch (error) {
    console.error(`${requestId} [HANDLER] - LIST CATEGORY error:`, error);

    return {
      data: null,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to list categories',
        statusCode: 500,
        requestId,
      },
    };
  }
}
