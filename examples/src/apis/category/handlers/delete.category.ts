import remove from '../repository/delete.category';
import type { typePayload, typeResult } from '../types/delete.category';

export default async function deleteCategoryHandler({
  categoryId,
  requestId,
}: typePayload & { requestId: string }): Promise<typeResult> {
  try {
    const data = await remove({ categoryId });

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

    console.error(`${requestId} [HANDLER] - DELETE CATEGORY error:`, error);

    return {
      data: null,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete category',
        statusCode: 500,
        requestId,
      },
    };
  }
}
