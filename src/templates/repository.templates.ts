/**
 * Repository templates
 */

import { ApiType } from '../types/common.types';
import { getModuleNaming, ModuleNaming } from '../shared/utils/naming.utils';

/**
 * Generates repository content based on API type
 */
export const generateRepositoryContent = ({
  moduleName,
  apiType,
}: {
  moduleName: string;
  apiType: ApiType;
}): string => {
  const naming = getModuleNaming(moduleName);

  if (apiType.type === 'crud') {
    return generateCrudRepositoryContent(naming);
  } else if (apiType.type === 'custom' && apiType.customNames) {
    return generateCustomRepositoryContent(naming, apiType.customNames);
  }

  return generateGenericRepositoryContent(naming);
};

/**
 * Generates CRUD repository content
 */
const generateCrudRepositoryContent = (naming: ModuleNaming): string => {
  return `// Repository layer - Pure domain logic, returns raw data, throws exceptions
// This layer is reusable and independent of API concerns

/**
 * Creates a new ${naming.variable}
 */
export const create = async ({
  name,
  description,
  status,
}: {
  name: string;
  description?: string;
  status?: string;
}) => {
  try {
    // TODO: Replace with your database implementation
    // Example with Prisma:
    // return await db.${naming.variable}.create({ data: { name, description, status } });

    // Mock implementation - replace with actual database call
    const ${naming.variable} = {
      id: \`mock-id-\${Date.now()}\`,
      name,
      description,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return ${naming.variable};
  } catch (error) {
    throw new Error(\`Database error: Failed to create ${naming.variable}: \${error instanceof Error ? error.message : 'Unknown error'}\`);
  }
};

/**
 * Finds a ${naming.variable} by ID
 */
export const findById = async (id: string) => {
  try {
    // TODO: Replace with your database implementation
    // Example with Prisma:
    // const ${naming.variable} = await db.${naming.variable}.findUnique({ where: { id } });
    // if (!${naming.variable}) throw new Error(\`${naming.class} not found: \${id}\`);
    // return ${naming.variable};

    // Mock implementation - replace with actual database call
    if (id === 'not-found') {
      throw new Error(\`${naming.class} not found: \${id}\`);
    }

    const ${naming.variable} = {
      id,
      // Add your ${naming.variable} fields here
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return ${naming.variable};
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) throw error;
    throw new Error(\`Database error: Failed to find ${naming.variable}: \${error instanceof Error ? error.message : 'Unknown error'}\`);
  }
};

/**
 * Finds multiple ${naming.variable}s with pagination and filtering
 */
export const findMany = async ({
  page,
  limit,
  sort_by,
  sort_order,
  search,
  status,
}: {
  page: number;
  limit: number;
  sort_by: string;
  sort_order: 'asc' | 'desc';
  search?: string;
  status?: string;
}) => {
  try {
    // TODO: Replace with your database implementation
    // Example with Prisma:
    // const items = await db.${naming.variable}.findMany({
    //   where: buildWhereClause({ search, status }),
    //   skip: (page - 1) * limit,
    //   take: limit,
    //   orderBy: { [sort_by]: sort_order }
    // });
    // const total = await db.${naming.variable}.count({ where: buildWhereClause({ search, status }) });

    // Mock implementation - replace with actual database call
    const items = Array.from({ length: 5 }, (_, index) => ({
      id: \`mock-id-\${index + 1}\`,
      // Add your ${naming.variable} fields here
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    return {
      items,
      total: items.length,
      page: page || 1,
      limit: limit || 10,
    };
  } catch (error) {
    throw new Error(\`Database error: Failed to list ${naming.variable}s: \${error instanceof Error ? error.message : 'Unknown error'}\`);
  }
};

/**
 * Updates a ${naming.variable}
 */
export const update = async (id: string, {
  name,
  description,
  status,
}: {
  name?: string;
  description?: string;
  status?: string;
}) => {
  try {
    // TODO: Replace with your database implementation
    // Example with Prisma:
    // const ${naming.variable} = await db.${naming.variable}.update({
    //   where: { id },
    //   data: { name, description, status }
    // });
    // return ${naming.variable};

    // Mock implementation - replace with actual database call
    if (id === 'not-found') {
      throw new Error(\`${naming.class} not found: \${id}\`);
    }

    const ${naming.variable} = {
      id,
      name,
      description,
      status,
      updatedAt: new Date().toISOString(),
    };

    return ${naming.variable};
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) throw error;
    throw new Error(\`Database error: Failed to update ${naming.variable}: \${error instanceof Error ? error.message : 'Unknown error'}\`);
  }
};

/**
 * Deletes a ${naming.variable}
 */
export const remove = async (id: string) => {
  try {
    // TODO: Replace with your database implementation
    // Example with Prisma (hard delete):
    //   await db.${naming.variable}.delete({ where: { id } });
    // Example with Prisma (soft delete):
    //   await db.${naming.variable}.update({ where: { id }, data: { deleted_at: new Date() } });

    // Mock implementation - replace with actual database call
    if (id === 'not-found') {
      throw new Error(\`${naming.class} not found: \${id}\`);
    }

    // Return success (void function)
    return;
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) throw error;
    throw new Error(\`Database error: Failed to delete ${naming.variable}: \${error instanceof Error ? error.message : 'Unknown error'}\`);
  }
};

export default {
  create,
  findById,
  findMany,
  update,
  remove,
};
`;
};

/**
 * Generates custom repository content
 */
const generateCustomRepositoryContent = (naming: ModuleNaming, customNames: string[]): string => {
  const customMethods = customNames
    .map(
      customName => `
/**
 * Custom ${customName} operation for ${naming.variable}
 */
export const ${customName} = async ({
  // Add your custom parameters here
}: {
  // Add your custom parameter types here
}) => {
  try {
    // TODO: Implement your custom ${customName} logic here
    // Example: return await db.${naming.variable}.${customName}({ /* parameters */ });
    
    // Mock implementation - replace with actual logic
    return {
      success: true,
      message: '${customName} operation completed successfully',
      // Add your return data here
    };
  } catch (error) {
    throw new Error(\`Database error: Failed to ${customName} ${naming.variable}: \${error instanceof Error ? error.message : 'Unknown error'}\`);
  }
};`
    )
    .join('\n');

  return `// Repository layer - Custom operations for ${naming.variable}
// This layer is reusable and independent of API concerns

${customMethods}

export default {
${customNames.map(name => `  ${name},`).join('\n')}
};
`;
};

/**
 * Generates generic repository content
 */
const generateGenericRepositoryContent = (naming: ModuleNaming): string => {
  return `// Repository layer - Pure domain logic
// This layer is reusable and independent of API concerns

/**
 * Generic repository operations for ${naming.variable}
 */
export const create = async ({
  // Add your parameters here
}: {
  // Add your parameter types here
}) => {
  try {
    // TODO: Implement your database logic here
    // Example: return await db.${naming.variable}.create({ data: { /* parameters */ } });

    // Mock implementation - replace with actual database call
    return {
      id: \`mock-id-\${Date.now()}\`,
      // Add your return data here
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(\`Database error: Failed to create ${naming.variable}: \${error instanceof Error ? error.message : 'Unknown error'}\`);
  }
};

export default {
  create,
};
`;
};
