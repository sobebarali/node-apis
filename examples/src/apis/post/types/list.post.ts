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
  items: {
    postId: string;
    title: string;
    authorId: string;
    status: 'draft' | 'published' | 'archived';
    createdAt: string;
    updatedAt: string;
    // Add more post specific fields here
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
