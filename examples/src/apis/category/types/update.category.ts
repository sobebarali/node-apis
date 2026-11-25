export type typePayload = {
  categoryId: string;
  // Add the category fields that can be updated, each optional
};

export type typeResultData = {
  categoryId: string;
  // Add the category fields you return
};

export type typeResultError = {
  code: 'VALIDATION_ERROR' | 'NOT_FOUND' | 'DUPLICATE_ENTRY' | 'INTERNAL_ERROR';
  message: string;
  statusCode: 400 | 404 | 409 | 500;
  requestId: string;
  field?: string;
};

export type typeResult = {
  data: null | typeResultData;
  error: null | typeResultError;
};
