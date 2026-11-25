import type { typePayload, typeResultData } from '../types/list.post';

export default async function list({
  page,
  limit,
  sortBy,
  sortOrder,
  search,
  status,
  authorId,
}: typePayload): Promise<typeResultData> {
  // TODO: Replace with your data access and return typeResultData.
  const received = Object.keys({
    page,
    limit,
    sortBy,
    sortOrder,
    search,
    status,
    authorId,
  }).join(', ');

  throw new Error(`list post repository is not implemented (received: ${received})`);
}
