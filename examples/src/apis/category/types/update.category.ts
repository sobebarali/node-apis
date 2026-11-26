import type { typeCategory } from './category';

export type typePayload = {
  categoryId: string;
  name?: string;
  slug?: string;
  parentId?: string | null;
  iconUrl?: string | null;
};

export type typeResultData = typeCategory;

export type typeResultError = {
  code: 'VALIDATION_ERROR' | 'NOT_FOUND' | 'DUPLICATE_ENTRY' | 'INTERNAL_ERROR';
  message: string;
  statusCode: 400 | 404 | 409 | 500;
  requestId: string;
  field?: string;
};

export type typeResult =
  | { data: typeResultData; error: null }
  | { data: null; error: typeResultError };
