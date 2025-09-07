/**
 * CRUD operation templates
 */

/**
 * Gets the list of CRUD operation file names for a module
 */
export const getCrudFileNames = ({ moduleName }: { moduleName: string }): string[] => {
  return [
    `create.${moduleName}.ts`,
    `get.${moduleName}.ts`,
    `list.${moduleName}.ts`,
    `delete.${moduleName}.ts`,
    `update.${moduleName}.ts`,
  ];
};

/**
 * Generates TypeScript file content for CRUD operations
 */
export const generateCrudFileContent = ({
  operation,
  moduleName,
}: {
  operation: string;
  moduleName: string;
}): string => {
  const capitalizedModule = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  const capitalizedOperation = operation.charAt(0).toUpperCase() + operation.slice(1);

  // Generate operation-specific content
  switch (operation) {
    case 'create':
      return generateCreateContent(capitalizedModule, capitalizedOperation, moduleName);
    case 'get':
      return generateGetContent(capitalizedModule, capitalizedOperation, moduleName);
    case 'list':
      return generateListContent(capitalizedModule, capitalizedOperation, moduleName);
    case 'update':
      return generateUpdateContent(capitalizedModule, capitalizedOperation, moduleName);
    case 'delete':
      return generateDeleteContent(capitalizedModule, capitalizedOperation, moduleName);
    default:
      return generateGenericContent(capitalizedModule, capitalizedOperation, operation, moduleName);
  }
};

/**
 * Generates CREATE operation content
 */
const generateCreateContent = (
  _capitalizedModule: string,
  _capitalizedOperation: string,
  moduleName: string
): string => {
  return `export type typePayload = {
  // Add your ${moduleName} creation fields here
};

export type typeResultData = {
  id: string;
  created_at: string;
  updated_at: string;
  // Add your ${moduleName} specific fields here
};

export type typeResultError = {
  code: 'VALIDATION_ERROR' | 'DUPLICATE_ENTRY' | 'INTERNAL_ERROR';
  message: string;
  statusCode: 400 | 409 | 500;
  field?: string;
};

export type typeResult = {
  data: null | typeResultData;
  error: null | typeResultError;
};
`;
};

/**
 * Generates GET operation content
 */
const generateGetContent = (
  capitalizedModule: string,
  _capitalizedOperation: string,
  moduleName: string
): string => {
  return `export type typePayload = {
  id: string; // ${capitalizedModule} ID to retrieve
};

export type typeResultData = {
  id: string;
  created_at: string;
  updated_at: string;
  // Add your ${moduleName} specific fields here
};

export type typeResultError = {
  code: 'NOT_FOUND' | 'UNAUTHORIZED' | 'INTERNAL_ERROR';
  message: string;
  statusCode: 404 | 401 | 500;
};

export type typeResult = {
  data: null | typeResultData;
  error: null | typeResultError;
};
`;
};

/**
 * Generates LIST operation content
 */
const generateListContent = (
  _capitalizedModule: string,
  _capitalizedOperation: string,
  moduleName: string
): string => {
  return `export type typePayload = {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  search?: string;
  // Add your ${moduleName} specific filters here
};

export type typeResultData = {
  items: {
    id: string;
    created_at: string;
    updated_at: string;
    // Add your ${moduleName} specific fields here
  }[];
  _metadata: {
    page: number;
    limit: number;
    total_count: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
};

export type typeResultError = {
  code: 'VALIDATION_ERROR' | 'INTERNAL_ERROR';
  message: string;
  statusCode: 400 | 500;
  field?: string;
};

export type typeResult = {
  data: null | typeResultData;
  error: null | typeResultError;
};
`;
};

/**
 * Generates UPDATE operation content
 */
const generateUpdateContent = (
  _capitalizedModule: string,
  _capitalizedOperation: string,
  moduleName: string
): string => {
  return `export type typePayload = {
  id: string;
  // Fields that can be updated
};

export type typeResultData = {
  id: string;
  created_at: string;
  updated_at: string;
  // Add your ${moduleName} specific fields here
};

export type typeResultError = {
  code: 'VALIDATION_ERROR' | 'NOT_FOUND' | 'UNAUTHORIZED' | 'INTERNAL_ERROR';
  message: string;
  statusCode: 400 | 404 | 401 | 500;
  field?: string;
};

export type typeResult = {
  data: null | typeResultData;
  error: null | typeResultError;
};
`;
};

/**
 * Generates DELETE operation content
 */
const generateDeleteContent = (
  _capitalizedModule: string,
  _capitalizedOperation: string,
  _moduleName: string
): string => {
  return `export type typePayload = {
  id: string;
  permanent?: boolean;
};

export type typeResultData = {
  deleted_id: string;
  deleted_at: string;
  permanent: boolean;
};

export type typeResultError = {
  code: 'NOT_FOUND' | 'UNAUTHORIZED' | 'INTERNAL_ERROR';
  message: string;
  statusCode: 404 | 401 | 500;
};

export type typeResult = {
  data: null | typeResultData;
  error: null | typeResultError;
};
`;
};

/**
 * Generates generic operation content (fallback)
 */
const generateGenericContent = (
  _capitalizedModule: string,
  _capitalizedOperation: string,
  operation: string,
  moduleName: string
): string => {
  return `export type typePayload = {
  // Define payload for ${operation} ${moduleName}
};

export type typeResultData = {
  // Define result data for ${operation} ${moduleName}
};

export type typeResultError = {
  code: 'VALIDATION_ERROR' | 'NOT_FOUND' | 'UNAUTHORIZED' | 'INTERNAL_ERROR';
  message: string;
  statusCode: 400 | 404 | 401 | 500;
  field?: string;
};

export type typeResult = {
  data: null | typeResultData;
  error: null | typeResultError;
};
`;
};
