import type { typePayload, typeResultData } from '../types/get.post';

export default async function get({
  postId,
}: Pick<typePayload, 'postId'>): Promise<typeResultData> {
  // TODO: Replace with your data access and return typeResultData.
  // To return NOT_FOUND (404), throw an error named 'NotFoundError':
  //   throw Object.assign(new Error('Post not found'), { name: 'NotFoundError' });
  const received = Object.keys({ postId }).join(', ');

  throw new Error(`get post repository is not implemented (received: ${received})`);
}
