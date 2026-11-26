import type { typePost } from './post';

export type typePayload = {
  title: string;
  content: string;
  authorId: string;
  tags?: string[];
};

export type typeResultData = typePost;

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
