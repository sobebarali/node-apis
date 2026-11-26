export type typePayload = {
  parentId: string | null;
  orderedIds: string[];
};

export type typeResultData = {
  reordered: number;
};

export type typeResultError = {
  code: 'VALIDATION_ERROR' | 'NOT_FOUND' | 'INTERNAL_ERROR';
  message: string;
  statusCode: 400 | 404 | 500;
  requestId: string;
  field?: string;
};

export type typeResult =
  | { data: typeResultData; error: null }
  | { data: null; error: typeResultError };
