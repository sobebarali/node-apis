export type typePayload = {
  postId: string;
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
  code: 'NOT_FOUND' | 'INTERNAL_ERROR';
  message: string;
  statusCode: 404 | 500;
  requestId: string;
};

export type typeResult = {
  data: null | typeResultData;
  error: null | typeResultError;
};
