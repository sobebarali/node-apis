import publish from '../repository/publish.post';
import type { typePayload, typeResult } from '../types/publish.post';

export default async function publishPostHandler({
  postId,
  publishAt,
  requestId,
}: typePayload & { requestId: string }): Promise<typeResult> {
  try {
    const data = await publish({ postId, publishAt });

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

    console.error(`${requestId} [HANDLER] - PUBLISH POST error:`, error);

    return {
      data: null,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to execute publish operation for post',
        statusCode: 500,
        requestId,
      },
    };
  }
}
