export type typePayload = {
  title: string;
  content: string;
  authorId: string;
  tags?: string[];
};

export type typeResultData = {
  postId: string;
  title: string;
  content: string;
  authorId: string;
  tags?: string[];
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
};

export type typeResultError = {
  code: 'VALIDATION_ERROR' | 'DUPLICATE_ENTRY' | 'INTERNAL_ERROR';
  message: string;
  statusCode: 400 | 409 | 500;
  requestId: string;
  field?: string;
};

export type typeResult = {
  data: null | typeResultData;
  error: null | typeResultError;
};
