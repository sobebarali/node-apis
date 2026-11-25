import create from '../repository/create.post';
import type { typePayload, typeResult } from '../types/create.post';

export default async function createPostHandler({
  title,
  content,
  authorId,
  tags,
  requestId,
}: typePayload & { requestId: string }): Promise<typeResult> {
  try {
    const data = await create({ title, content, authorId, tags });

    return { data, error: null };
  } catch (error) {
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

    console.error(`${requestId} [HANDLER] - CREATE POST error:`, error);

    return {
      data: null,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create post',
        statusCode: 500,
        requestId,
      },
    };
  }
}
