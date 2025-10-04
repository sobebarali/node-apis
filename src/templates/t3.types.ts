/**
 * T3 Stack type templates - Only typePayload and typeResult
 */

import { getModuleNaming } from '../shared/utils/naming.utils';

/**
 * Gets the list of T3 type file names for CRUD operations
 */
export const getT3CrudTypeFileNames = ({ moduleName }: { moduleName: string }): string[] => {
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
 * Gets T3 custom type file names
 */
export const getT3CustomTypeFileNames = ({
  customNames,
  moduleName,
}: {
  customNames: string[];
  moduleName: string;
}): string[] => {
  return customNames.map(customName => `${customName}.${moduleName}.ts`);
};

/**
 * Generates T3 TypeScript type file content for CRUD operations
 * Note: T3 types only have typePayload and typeResult (no typeResultData or typeResultError)
 */
export const generateT3CrudTypeContent = ({
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
      return generateT3CreateTypeContent(naming.class, capitalizedOperation, naming.file);
    case 'get':
      return generateT3GetTypeContent(naming.class, capitalizedOperation, naming.file);
    case 'list':
      return generateT3ListTypeContent(naming.class, capitalizedOperation, naming.file);
    case 'update':
      return generateT3UpdateTypeContent(naming.class, capitalizedOperation, naming.file);
    case 'delete':
      return generateT3DeleteTypeContent(naming.class, capitalizedOperation, naming.file);
    default:
      return generateT3GenericTypeContent(naming.class, capitalizedOperation, operation, naming.file);
  }
};

/**
 * Generates T3 custom type content
 */
export const generateT3CustomTypeContent = ({
  customName,
  moduleName,
}: {
  customName: string;
  moduleName: string;
}): string => {
  const naming = getModuleNaming(moduleName);
  const capitalizedCustom = customName.charAt(0).toUpperCase() + customName.slice(1);

  return generateT3GenericTypeContent(naming.class, capitalizedCustom, customName, naming.file);
};

/**
 * Generates T3 CREATE type content
 */
const generateT3CreateTypeContent = (
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

export type typeResult = {
  ${moduleName}Id: string;
  name: string;
  description?: string;
  status?: string;
  created_at: string;
  updated_at: string;
  // Add more ${moduleName} specific fields here
};
`;
};

/**
 * Generates T3 GET type content
 */
const generateT3GetTypeContent = (
  capitalizedModule: string,
  _capitalizedOperation: string,
  moduleName: string
): string => {
  return `export type typePayload = {
  ${moduleName}Id: string; // ${capitalizedModule} ID to retrieve
};

export type typeResult = {
  ${moduleName}Id: string;
  name: string;
  description?: string;
  status?: string;
  created_at: string;
  updated_at: string;
  // Add more ${moduleName} specific fields here
};
`;
};

/**
 * Generates T3 LIST type content
 */
const generateT3ListTypeContent = (
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

export type typeResult = {
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
`;
};

/**
 * Generates T3 UPDATE type content
 */
const generateT3UpdateTypeContent = (
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

export type typeResult = {
  ${moduleName}Id: string;
  name: string;
  description?: string;
  status?: string;
  created_at: string;
  updated_at: string;
  // Add more ${moduleName} specific fields here
};
`;
};

/**
 * Generates T3 DELETE type content
 */
const generateT3DeleteTypeContent = (
  _capitalizedModule: string,
  _capitalizedOperation: string,
  moduleName: string
): string => {
  return `export type typePayload = {
  ${moduleName}Id: string;
};

export type typeResult = {
  deleted_at: string;
};
`;
};

/**
 * Generates T3 generic type content (fallback)
 */
const generateT3GenericTypeContent = (
  _capitalizedModule: string,
  _capitalizedOperation: string,
  operation: string,
  moduleName: string
): string => {
  return `export type typePayload = {
  // Define payload for ${operation} ${moduleName}
  id?: string;
};

export type typeResult = {
  // Define result data for ${operation} ${moduleName}
};
`;
};
