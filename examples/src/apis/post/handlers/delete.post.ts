import remove from '../repository/delete.post';
import type { typePayload, typeResult } from '../types/delete.post';

export default async function deletePostHandler({
  postId,
  requestId,
}: typePayload & { requestId: string }): Promise<typeResult> {
  try {
    const data = await remove({ postId });

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

    console.error(`${requestId} [HANDLER] - DELETE POST error:`, error);

    return {
      data: null,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete post',
        statusCode: 500,
        requestId,
      },
    };
  }
}
