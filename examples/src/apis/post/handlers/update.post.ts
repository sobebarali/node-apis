import update from '../repository/update.post';
import type { typePayload, typeResult } from '../types/update.post';

export default async function updatePostHandler({
  postId,
  title,
  content,
  tags,
  requestId,
}: typePayload & { requestId: string }): Promise<typeResult> {
  try {
    const data = await update({ postId, title, content, tags });

    return { data, error: null };
  } catch (error) {
    if (error instanceof Error && error.name === 'NotFoundError') {
      return {
        data: null,
        error: {
          code: 'NOT_FOUND',
          message: 'Post not found',
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
          message: 'Post already exists',
          statusCode: 409,
          requestId,
        },
      };
    }

    console.error(`${requestId} [HANDLER] - UPDATE POST error:`, error);

    return {
      data: null,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update post',
        statusCode: 500,
        requestId,
      },
    };
  }
}
