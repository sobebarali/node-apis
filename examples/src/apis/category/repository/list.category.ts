import type { typePayload, typeResultData } from '../types/list.category';

export default async function list({
  page,
  limit,
  parentId,
  sortBy,
  sortOrder,
}: typePayload): Promise<typeResultData> {
  // TODO: Replace with your data access and return typeResultData.
  const received = Object.keys({ page, limit, parentId, sortBy, sortOrder }).join(', ');

  throw new Error(`list category repository is not implemented (received: ${received})`);
}
