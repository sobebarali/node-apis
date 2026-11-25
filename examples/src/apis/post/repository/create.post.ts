import type { typePayload, typeResultData } from '../types/create.post';

export default async function create({
  title,
  content,
  authorId,
  tags,
}: typePayload): Promise<typeResultData> {
  // TODO: Replace with your data access and return typeResultData.
  // To return DUPLICATE_ENTRY (409), throw an error named 'DuplicateError':
  //   throw Object.assign(new Error('Post already exists'), { name: 'DuplicateError' });
  const received = Object.keys({ title, content, authorId, tags }).join(', ');

  throw new Error(`create post repository is not implemented (received: ${received})`);
}
