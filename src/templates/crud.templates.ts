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
 * Name of the entity file: the one type file named after the module alone
 */
export const getEntityFileName = ({ moduleName }: { moduleName: string }): string =>
  `${getModuleNaming(moduleName).file}.ts`;

/**
 * Generates the entity file. It holds the module's main type once, so the
 * operation type files do not each repeat it.
 */
export const generateEntityFileContent = ({ moduleName }: { moduleName: string }): string => {
  const naming = getModuleNaming(moduleName);

  return `/**
 * The ${naming.variable} as the API returns it. create, get, update and list
 * build on this type, so a field added here reaches all of them.
 */
export type type${naming.class} = {
  ${naming.file}Id: string;
  // Add the ${naming.variable} fields you return
};
`;
};

const entityImport = (capitalizedModule: string, moduleName: string): string =>
  `import type { type${capitalizedModule} } from './${moduleName}';\n\n`;

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
  capitalizedModule: string,
  _capitalizedOperation: string,
  moduleName: string
): string => {
  return `${entityImport(capitalizedModule, moduleName)}export type typePayload = {
  // Add the fields needed to create a ${moduleName}
};

export type typeResultData = type${capitalizedModule};

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
  return `${entityImport(capitalizedModule, moduleName)}export type typePayload = {
  ${moduleName}Id: string; // ${capitalizedModule} ID to retrieve
};

export type typeResultData = type${capitalizedModule};

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
`;
};

/**
 * Generates LIST operation content
 */
const generateListContent = (
  capitalizedModule: string,
  _capitalizedOperation: string,
  moduleName: string
): string => {
  return `${entityImport(capitalizedModule, moduleName)}export type typePayload = {
  page?: number;
  limit?: number;
  // Add the ${moduleName} filters and sorting here
};

export type typeResultData = {
  items: type${capitalizedModule}[];
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
`;
};

/**
 * Generates UPDATE operation content
 */
const generateUpdateContent = (
  capitalizedModule: string,
  _capitalizedOperation: string,
  moduleName: string
): string => {
  return `${entityImport(capitalizedModule, moduleName)}export type typePayload = {
  ${moduleName}Id: string;
  // Add the ${moduleName} fields that can be updated, each optional
};

export type typeResultData = type${capitalizedModule};

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
  deletedAt: string;
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
  code: 'VALIDATION_ERROR' | 'NOT_FOUND' | 'INTERNAL_ERROR';
  message: string;
  statusCode: 400 | 404 | 500;
  requestId: string;
  field?: string;
};

export type typeResult = {
  data: null | typeResultData;
  error: null | typeResultError;
};
`;
};
