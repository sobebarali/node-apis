import type { typePayload, typeResultData } from '../types/archive.post';

export default async function archive({ postId, reason }: typePayload): Promise<typeResultData> {
  // TODO: Replace with your data access and return typeResultData.
  // To return NOT_FOUND (404), throw an error named 'NotFoundError':
  //   throw Object.assign(new Error('Post not found'), { name: 'NotFoundError' });
  const received = Object.keys({ postId, reason }).join(', ');

  throw new Error(`archive post repository is not implemented (received: ${received})`);
}
