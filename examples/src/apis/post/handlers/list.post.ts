import list from '../repository/list.post';
import type { typePayload, typeResult } from '../types/list.post';

export default async function listPostsHandler({
  page,
  limit,
  sortBy,
  sortOrder,
  search,
  status,
  authorId,
  requestId,
}: typePayload & { requestId: string }): Promise<typeResult> {
  try {
    const data = await list({ page, limit, sortBy, sortOrder, search, status, authorId });

    return { data, error: null };
  } catch (error) {
    console.error(`${requestId} [HANDLER] - LIST POST error:`, error);

    return {
      data: null,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to list posts',
        statusCode: 500,
        requestId,
      },
    };
  }
}
