export type typePayload = {
  postId: string;
};

export type typeResultData = {
  deletedAt: string;
};

export type typeResultError = {
  code: 'NOT_FOUND' | 'INTERNAL_ERROR';
  message: string;
  statusCode: 404 | 500;
  requestId: string;
};

export type typeResult =
  | { data: typeResultData; error: null }
  | { data: null; error: typeResultError };
