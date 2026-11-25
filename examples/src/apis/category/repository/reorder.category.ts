import type { typePayload, typeResultData } from '../types/reorder.category';

export default async function reorder({
  parentId,
  orderedIds,
}: typePayload): Promise<typeResultData> {
  // TODO: Replace with your data access and return typeResultData.
  // To return NOT_FOUND (404), throw an error named 'NotFoundError':
  //   throw Object.assign(new Error('Category not found'), { name: 'NotFoundError' });
  const received = Object.keys({ parentId, orderedIds }).join(', ');

  throw new Error(`reorder category repository is not implemented (received: ${received})`);
}
