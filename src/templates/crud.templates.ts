/**
 * CRUD operation templates
 */

import { getModuleNaming } from '../shared/utils/naming.utils';

/**
 * Gets the list of CRUD operation file names for a module
 */
export const getCrudFileNames = ({ moduleName }: { moduleName: string }): string[] => {
  const naming = getModuleNaming(moduleName);
  return [
    `create.${naming.file}.ts`,
    `get.${naming.file}.ts`,
    `list.${naming.file}.ts`,
    `delete.${naming.file}.ts`,
    `update.${naming.file}.ts`,
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
  const naming = getModuleNaming(moduleName);
  const capitalizedOperation = operation.charAt(0).toUpperCase() + operation.slice(1);

  // Generate operation-specific content
  switch (operation) {
    case 'create':
      return generateCreateContent(naming.class, capitalizedOperation, naming.file);
    case 'get':
      return generateGetContent(naming.class, capitalizedOperation, naming.file);
    case 'list':
      return generateListContent(naming.class, capitalizedOperation, naming.file);
    case 'update':
      return generateUpdateContent(naming.class, capitalizedOperation, naming.file);
    case 'delete':
      return generateDeleteContent(naming.class, capitalizedOperation, naming.file);
    default:
      return generateGenericContent(naming.class, capitalizedOperation, operation, naming.file);
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
  name: string;
  description?: string;
  status?: string;
  // Add more ${moduleName} creation fields here
};

export type typeResultData = {
  ${moduleName}Id: string;
  name: string;
  description?: string;
  status?: string;
  created_at: string;
  updated_at: string;
  // Add more ${moduleName} specific fields here
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
  ${moduleName}Id: string; // ${capitalizedModule} ID to retrieve
};

export type typeResultData = {
  ${moduleName}Id: string;
  name: string;
  description?: string;
  status?: string;
  created_at: string;
  updated_at: string;
  // Add more ${moduleName} specific fields here
};

export type typeResultError = {
  code: 'NOT_FOUND' | 'UNAUTHORIZED' | 'INTERNAL_ERROR';
  message: string;
  statusCode: 404 | 401 | 500;
  requestId: string;
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
  status?: string;
  // Add more ${moduleName} specific filters here
};

export type typeResultData = {
  items: {
    ${moduleName}Id: string;
    name: string;
    description?: string;
    status?: string;
    created_at: string;
    updated_at: string;
    // Add more ${moduleName} specific fields here
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
  requestId: string;
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
  ${moduleName}Id: string;
  name?: string;
  description?: string;
  status?: string;
  // Add more ${moduleName} update fields here
};

export type typeResultData = {
  ${moduleName}Id: string;
  name: string;
  description?: string;
  status?: string;
  created_at: string;
  updated_at: string;
  // Add more ${moduleName} specific fields here
};

export type typeResultError = {
  code: 'VALIDATION_ERROR' | 'NOT_FOUND' | 'UNAUTHORIZED' | 'INTERNAL_ERROR';
  message: string;
  statusCode: 400 | 404 | 401 | 500;
  requestId: string;
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
  moduleName: string
): string => {
  return `export type typePayload = {
  ${moduleName}Id: string;
};

export type typeResultData = {
  deleted_at: string;
};

export type typeResultError = {
  code: 'NOT_FOUND' | 'UNAUTHORIZED' | 'INTERNAL_ERROR';
  message: string;
  statusCode: 404 | 401 | 500;
  requestId: string;
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
  requestId: string;
  field?: string;
};

export type typeResult = {
  data: null | typeResultData;
  error: null | typeResultError;
};
`;
};
