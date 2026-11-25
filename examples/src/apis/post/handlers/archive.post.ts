import archive from '../repository/archive.post';
import type { typePayload, typeResult } from '../types/archive.post';

export default async function archivePostHandler({
  postId,
  reason,
  requestId,
}: typePayload & { requestId: string }): Promise<typeResult> {
  try {
    const data = await archive({ postId, reason });

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

    console.error(`${requestId} [HANDLER] - ARCHIVE POST error:`, error);

    return {
      data: null,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to execute archive operation for post',
        statusCode: 500,
        requestId,
      },
    };
  }
}
