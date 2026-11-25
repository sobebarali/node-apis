import reorder from '../repository/reorder.category';
import type { typePayload, typeResult } from '../types/reorder.category';

export default async function reorderCategoryHandler({
  parentId,
  orderedIds,
  requestId,
}: typePayload & { requestId: string }): Promise<typeResult> {
  try {
    const data = await reorder({ parentId, orderedIds });

    return { data, error: null };
  } catch (error) {
    if (error instanceof Error && error.name === 'NotFoundError') {
      return {
        data: null,
        error: {
          code: 'NOT_FOUND',
          message: 'Category not found',
          statusCode: 404,
          requestId,
        },
      };
    }

    console.error(`${requestId} [HANDLER] - REORDER CATEGORY error:`, error);

    return {
      data: null,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to execute reorder operation for category',
        statusCode: 500,
        requestId,
      },
    };
  }
}
