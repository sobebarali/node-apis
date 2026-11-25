import get from '../repository/get.post';
import type { typePayload, typeResult } from '../types/get.post';

export default async function getPostHandler({
  postId,
  requestId,
}: typePayload & { requestId: string }): Promise<typeResult> {
  try {
    const data = await get({ postId });

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

    console.error(`${requestId} [HANDLER] - GET POST error:`, error);

    return {
      data: null,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get post',
        statusCode: 500,
        requestId,
      },
    };
  }
}
