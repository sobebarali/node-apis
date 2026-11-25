import type { typePost } from './post';

export type typePayload = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  status?: 'draft' | 'published' | 'archived';
  authorId?: string;
};

export type typeResultData = {
  items: typePost[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

export type typeResultError = {
  code: 'VALIDATION_ERROR' | 'INTERNAL_ERROR';
  message: string;
  statusCode: 400 | 500;
  requestId: string;
  field?: string;
};

export type typeResult = {
  data: null | typeResultData;
  error: null | typeResultError;
};
