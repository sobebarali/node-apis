import type { typePost } from './post';

export type typePayload = {
  postId: string;
};

export type typeResultData = typePost;

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
