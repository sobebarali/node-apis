import type { typePayload, typeResultData } from '../types/update.post';

export default async function update({
  postId,
  title,
  content,
  tags,
}: typePayload): Promise<typeResultData> {
  // TODO: Replace with your data access and return typeResultData.
  // To return NOT_FOUND (404), throw an error named 'NotFoundError':
  //   throw Object.assign(new Error('Post not found'), { name: 'NotFoundError' });
  // To return DUPLICATE_ENTRY (409), throw an error named 'DuplicateError':
  //   throw Object.assign(new Error('Post already exists'), { name: 'DuplicateError' });
  const received = Object.keys({ postId, title, content, tags }).join(', ');

  throw new Error(`update post repository is not implemented (received: ${received})`);
}
