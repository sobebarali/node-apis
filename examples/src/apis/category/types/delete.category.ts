export type typePayload = {
  categoryId: string;
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

export type typeResult = {
  data: null | typeResultData;
  error: null | typeResultError;
};
