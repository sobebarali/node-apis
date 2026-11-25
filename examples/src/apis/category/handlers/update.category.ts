import update from '../repository/update.category';
import type { typePayload, typeResult } from '../types/update.category';

export default async function updateCategoryHandler({
  categoryId,
  requestId,
}: typePayload & { requestId: string }): Promise<typeResult> {
  try {
    const data = await update({ categoryId });

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

    if (error instanceof Error && error.name === 'DuplicateError') {
      return {
        data: null,
        error: {
          code: 'DUPLICATE_ENTRY',
          message: 'Category already exists',
          statusCode: 409,
          requestId,
        },
      };
    }

    console.error(`${requestId} [HANDLER] - UPDATE CATEGORY error:`, error);

    return {
      data: null,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update category',
        statusCode: 500,
        requestId,
      },
    };
  }
}
