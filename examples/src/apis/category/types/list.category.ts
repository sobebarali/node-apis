export type typePayload = {
  page?: number;
  limit?: number;
  parentId?: string;
  sortBy?: 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
};

export type typeResultData = {
  items: {
    categoryId: string;
    name: string;
    slug: string;
  }[];
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
