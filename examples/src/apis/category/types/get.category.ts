export type typePayload = {
  categoryId: string; // Category ID to retrieve
};

export type typeResultData = {
  categoryId: string;
  // Add the category fields you return
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
