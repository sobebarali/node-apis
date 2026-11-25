import type { typeCategory } from './category';

export type typePayload = {
  categoryId: string; // Category ID to retrieve
};

export type typeResultData = typeCategory;

export type typeResultError = {
  code: 'NOT_FOUND' | 'INTERNAL_ERROR';
  message: string;
  statusCode: 404 | 500;
  requestId: string;
};

export type typeResult = {
  data: null | typeResultData;
  error: null | typeResultError;
};
