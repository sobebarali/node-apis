/**
 * T3 type templates
 */

import { getModuleNaming } from '../shared/naming.utils';

export const generateTypesContent = ({ moduleName }: { moduleName: string }): string => {
  const naming = getModuleNaming(moduleName);

  return `// Define the ${naming.class} interface
export interface ${naming.class} {
  ${naming.variable}Id: string;
  name: string;
  description?: string;
  status?: string;
  created_at: string;
  updated_at: string;
}

// Input types for ${naming.plural} operations
export interface Create${naming.class}Input {
  name: string;
  description?: string;
  status?: string;
  // Add more ${naming.variable} creation fields here
}

export interface Get${naming.class}Input {
  ${naming.variable}Id: string; // ${naming.class} ID to retrieve
}

export interface List${naming.class}sInput {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  search?: string;
  status?: string;
  // Add more ${naming.variable} specific filters here
}

export interface Update${naming.class}Input {
  ${naming.variable}Id: string;
  name?: string;
  description?: string;
  status?: string;
  // Add more ${naming.variable} update fields here
}

export interface Delete${naming.class}Input {
  ${naming.variable}Id: string;
}
`;
};

export const getTypesFileName = ({ moduleName }: { moduleName: string }): string => {
  const naming = getModuleNaming(moduleName);
  return `${naming.file}.types.ts`;
};