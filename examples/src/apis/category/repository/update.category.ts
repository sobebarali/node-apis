import type { typePayload, typeResultData } from '../types/update.category';

export default async function update({ categoryId }: typePayload): Promise<typeResultData> {
  // TODO: Replace with your data access and return typeResultData.
  // To return NOT_FOUND (404), throw an error named 'NotFoundError':
  //   throw Object.assign(new Error('Category not found'), { name: 'NotFoundError' });
  // To return DUPLICATE_ENTRY (409), throw an error named 'DuplicateError':
  //   throw Object.assign(new Error('Category already exists'), { name: 'DuplicateError' });
  const received = Object.keys({ categoryId }).join(', ');

  throw new Error(`update category repository is not implemented (received: ${received})`);
}
