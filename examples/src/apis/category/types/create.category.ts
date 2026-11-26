import type { typeCategory } from './category';

export type typePayload = {
  name: string;
  slug: string;
  parentId?: string;
  iconUrl?: string;
  seo: {
    title: string;
    description?: string;
  };
  translations: {
    locale: 'en' | 'ar' | 'fr';
    name: string;
  }[];
  attributes?: Record<string, string | number>;
};

export type typeResultData = typeCategory;

export type typeResultError = {
  code: 'VALIDATION_ERROR' | 'DUPLICATE_ENTRY' | 'INTERNAL_ERROR';
  message: string;
  statusCode: 400 | 409 | 500;
  requestId: string;
  field?: string;
};

export type typeResult =
  | { data: typeResultData; error: null }
  | { data: null; error: typeResultError };
