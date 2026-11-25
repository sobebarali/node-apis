import get from '../repository/get.category';
import type { typePayload, typeResult } from '../types/get.category';

export default async function getCategoryHandler({
  categoryId,
  requestId,
}: typePayload & { requestId: string }): Promise<typeResult> {
  try {
    const data = await get({ categoryId });

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

    console.error(`${requestId} [HANDLER] - GET CATEGORY error:`, error);

    return {
      data: null,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get category',
        statusCode: 500,
        requestId,
      },
    };
  }
}
