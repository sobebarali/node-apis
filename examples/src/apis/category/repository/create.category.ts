import type { typePayload, typeResultData } from '../types/create.category';

export default async function create({
  name,
  slug,
  parentId,
  iconUrl,
  seo,
  translations,
  attributes,
}: typePayload): Promise<typeResultData> {
  // TODO: Replace with your data access and return typeResultData.
  // To return DUPLICATE_ENTRY (409), throw an error named 'DuplicateError':
  //   throw Object.assign(new Error('Category already exists'), { name: 'DuplicateError' });
  const received = Object.keys({
    name,
    slug,
    parentId,
    iconUrl,
    seo,
    translations,
    attributes,
  }).join(', ');

  throw new Error(`create category repository is not implemented (received: ${received})`);
}
