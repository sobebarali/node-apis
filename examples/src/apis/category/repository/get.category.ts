import type { typePayload, typeResultData } from '../types/get.category';

export default async function get({
  categoryId,
}: Pick<typePayload, 'categoryId'>): Promise<typeResultData> {
  // TODO: Replace with your data access and return typeResultData.
  // To return NOT_FOUND (404), throw an error named 'NotFoundError':
  //   throw Object.assign(new Error('Category not found'), { name: 'NotFoundError' });
  const received = Object.keys({ categoryId }).join(', ');

  throw new Error(`get category repository is not implemented (received: ${received})`);
}
