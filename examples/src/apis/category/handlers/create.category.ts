import create from '../repository/create.category';
import type { typePayload, typeResult } from '../types/create.category';

export default async function createCategoryHandler({
  name,
  slug,
  parentId,
  iconUrl,
  seo,
  translations,
  attributes,
  requestId,
}: typePayload & { requestId: string }): Promise<typeResult> {
  try {
    const data = await create({ name, slug, parentId, iconUrl, seo, translations, attributes });

    return { data, error: null };
  } catch (error) {
    if (error instanceof Error && error.name === 'DuplicateError') {
      return {
        data: null,
        error: {
          code: 'DUPLICATE_ENTRY',
          message: 'Category already exists',
          statusCode: 409,
          requestId,
        },
      };
    }

    console.error(`${requestId} [HANDLER] - CREATE CATEGORY error:`, error);

    return {
      data: null,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create category',
        statusCode: 500,
        requestId,
      },
    };
  }
}
