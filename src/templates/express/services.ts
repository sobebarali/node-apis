/**
 * Express service templates
 */

import { getModuleNaming } from '../shared/naming.utils';

export const generateServiceContent = ({ moduleName }: { moduleName: string }): string => {
  const naming = getModuleNaming(moduleName);

  return `import {
  create${naming.class}Repository,
  get${naming.class}Repository,
  list${naming.class}sRepository,
  update${naming.class}Repository,
  delete${naming.class}Repository,
  ${naming.class}
} from '../repository/${naming.file}.repository';

export const create${naming.class}Service = async (data: Omit<${naming.class}, '${naming.variable}Id' | 'created_at' | 'updated_at'>) => {
  // Add any business logic here before creating
  return await create${naming.class}Repository(data);
};

export const get${naming.class}Service = async (${naming.variable}Id: string) => {
  // Add any business logic here before getting
  return await get${naming.class}Repository(${naming.variable}Id);
};

export const list${naming.class}sService = async (filters: { page?: number; limit?: number; search?: string; status?: string } = {}) => {
  // Add any business logic here before listing
  return await list${naming.class}sRepository(filters);
};

export const update${naming.class}Service = async (${naming.variable}Id: string, data: Partial<Omit<${naming.class}, '${naming.variable}Id' | 'created_at'>>) => {
  // Add any business logic here before updating
  return await update${naming.class}Repository(${naming.variable}Id, data);
};

export const delete${naming.class}Service = async (${naming.variable}Id: string) => {
  // Add any business logic here before deleting
  return await delete${naming.class}Repository(${naming.variable}Id);
};
`;
};

export const generateCustomServiceContent = ({ moduleName, customNames }: { moduleName: string; customNames: string[] }): string => {
  const naming = getModuleNaming(moduleName);

  // For custom operations, we'll create a basic service file with placeholders
  return `import { ${customNames.map(name => `${name}${naming.class}Repository`).join(', ')} } from '../repository/${naming.file}.repository';

${customNames.map(name => `export const ${name}${naming.class}Service = async (data: any): Promise<any> => {
  // Add any business logic here for ${name} ${naming.variable} operation
  return await ${name}${naming.class}Repository(data);
};`).join('\n\n')}
`;
};

export const getServiceFileName = ({ moduleName }: { moduleName: string }): string => {
  const naming = getModuleNaming(moduleName);
  return `${naming.file}.service.ts`;
};