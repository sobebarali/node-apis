export type typePayload = {
  postId: string;
  reason?: string;
};

export type typeResultData = {
  postId: string;
  status: 'archived';
  archivedAt: string;
};

export type typeResultError = {
  code: 'VALIDATION_ERROR' | 'NOT_FOUND' | 'INTERNAL_ERROR';
  message: string;
  statusCode: 400 | 404 | 500;
  requestId: string;
  field?: string;
};

export type typeResult = {
  data: null | typeResultData;
  error: null | typeResultError;
};
