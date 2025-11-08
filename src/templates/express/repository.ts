/**
 * Express repository templates
 */

import { getModuleNaming } from '../shared/naming.utils';

export const generateRepositoryContent = ({ moduleName }: { moduleName: string }): string => {
  const naming = getModuleNaming(moduleName);

  return `import { randomUUID } from 'crypto';

// Define the ${naming.class} interface
export interface ${naming.class} {
  ${naming.variable}Id: string;
  name: string;
  description?: string;
  status?: string;
  created_at: string;
  updated_at: string;
}

// Mock database - replace with your actual database implementation
const mockDatabase: ${naming.class}[] = [];

export const create${naming.class}Repository = async (data: Omit<${naming.class}, '${naming.variable}Id' | 'created_at' | 'updated_at'>): Promise<${naming.class}> => {
  const new${naming.class}: ${naming.class} = {
    ${naming.variable}Id: randomUUID(),
    ...data,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  mockDatabase.push(new${naming.class});
  return new${naming.class};
};

export const get${naming.class}Repository = async (${naming.variable}Id: string): Promise<${naming.class} | null> => {
  return mockDatabase.find(item => item.${naming.variable}Id === ${naming.variable}Id) || null;
};

export const list${naming.class}sRepository = async (filters: { page?: number; limit?: number; search?: string; status?: string } = {}): Promise<{ items: ${naming.class}[]; _metadata: { page: number; limit: number; total_count: number; total_pages: number; has_next: boolean; has_prev: boolean; } }> => {
  let filteredItems = [...mockDatabase];

  // Apply filters if provided
  if (filters.search) {
    filteredItems = filteredItems.filter(item => 
      item.name.toLowerCase().includes(filters.search!.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(filters.search!.toLowerCase()))
    );
  }

  if (filters.status) {
    filteredItems = filteredItems.filter(item => item.status === filters.status);
  }

  // Pagination
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const items = filteredItems.slice(startIndex, endIndex);
  const total_count = filteredItems.length;
  const total_pages = Math.ceil(total_count / limit);

  return {
    items,
    _metadata: {
      page,
      limit,
      total_count,
      total_pages,
      has_next: endIndex < filteredItems.length,
      has_prev: startIndex > 0,
    }
  };
};

export const update${naming.class}Repository = async (${naming.variable}Id: string, data: Partial<Omit<${naming.class}, '${naming.variable}Id' | 'created_at'>>): Promise<${naming.class} | null> => {
  const index = mockDatabase.findIndex(item => item.${naming.variable}Id === ${naming.variable}Id);
  if (index === -1) return null;

  const updated${naming.class} = {
    ...mockDatabase[index],
    ...data,
    updated_at: new Date().toISOString(),
  };

  mockDatabase[index] = updated${naming.class};
  return updated${naming.class};
};

export const delete${naming.class}Repository = async (${naming.variable}Id: string): Promise<boolean> => {
  const initialLength = mockDatabase.length;
  const index = mockDatabase.findIndex(item => item.${naming.variable}Id === ${naming.variable}Id);
  
  if (index !== -1) {
    mockDatabase.splice(index, 1);
  }

  return mockDatabase.length !== initialLength;
};
`;
};

export const generateCustomRepositoryContent = ({ moduleName, customNames }: { moduleName: string; customNames: string[] }): string => {
  const naming = getModuleNaming(moduleName);

  // For custom operations, we'll create a basic repository file with placeholders
  return `import { ${naming.class} } from './${naming.file}';

// Add custom repository functions for ${naming.plural} as needed

${customNames.map(name => `export const ${name}${naming.class}Repository = async (data: any): Promise<any> => {
  // Implementation for ${name} ${naming.variable} operation
  // Replace this with your actual implementation
  console.log('${name} operation for ${naming.variable}', data);
  return { success: true };
};`).join('\n\n')}
`;
};

export const getRepositoryFileName = ({ moduleName }: { moduleName: string }): string => {
  const naming = getModuleNaming(moduleName);
  return `${naming.file}.repository.ts`;
};