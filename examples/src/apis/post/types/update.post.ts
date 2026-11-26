import type { typePost } from './post';

export type typePayload = {
  postId: string;
  title?: string;
  content?: string;
  tags?: string[];
};

export type typeResultData = typePost;

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
