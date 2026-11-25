import type { typePayload, typeResultData } from '../types/publish.post';

export default async function publish({ postId, publishAt }: typePayload): Promise<typeResultData> {
  // TODO: Replace with your data access and return typeResultData.
  // To return NOT_FOUND (404), throw an error named 'NotFoundError':
  //   throw Object.assign(new Error('Post not found'), { name: 'NotFoundError' });
  const received = Object.keys({ postId, publishAt }).join(', ');

  throw new Error(`publish post repository is not implemented (received: ${received})`);
}
