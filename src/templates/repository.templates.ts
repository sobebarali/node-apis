/**
 * Repository templates
 */

import { ApiType } from '../types/common.types';

/**
 * Generates repository file content for a module
 */
export const generateRepositoryContent = ({
  moduleName,
  apiType,
}: {
  moduleName: string;
  apiType: ApiType;
}): string => {
  const capitalizedModule = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);

  if (apiType.type === 'crud') {
    return generateCrudRepositoryContent(moduleName, capitalizedModule);
  } else if (apiType.type === 'custom' && apiType.customNames) {
    return generateCustomRepositoryContent(moduleName, capitalizedModule, apiType.customNames);
  }

  return generateGenericRepositoryContent(moduleName, capitalizedModule);
};

/**
 * Generates CRUD repository content
 */
const generateCrudRepositoryContent = (moduleName: string, capitalizedModule: string): string => {
  return `// Repository layer - Pure domain logic, returns raw data, throws exceptions
// This layer is reusable and independent of API concerns

import { typePayload as CreatePayload } from '../types/create.${moduleName}';
import { typePayload as UpdatePayload } from '../types/update.${moduleName}';
import { typePayload as ListPayload } from '../types/list.${moduleName}';
import { NotFoundError, DatabaseError } from '../../../shared/errors';

/**
 * Creates a new ${moduleName}
 */
export const create = async ({
  // TODO: Add your specific fields here, e.g.:
  // name,
  // description,
}: CreatePayload) => {
  try {
    // TODO: Replace with your database implementation
    // Example with Prisma:
    // return await db.${moduleName}.create({
    //   data: { name, description }
    // });

    // Mock implementation - replace with actual database call
    const ${moduleName} = {
      id: \`mock-id-\${Date.now()}\`,
      // TODO: Add your specific fields here, e.g.:
      // name,
      // description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return ${moduleName};
  } catch (error) {
    throw new DatabaseError(\`Failed to create ${moduleName}: \${error instanceof Error ? error.message : 'Unknown error'}\`);
  }
};

/**
 * Finds a ${moduleName} by ID
 */
export const findById = async (id: string) => {
  try {
    // TODO: Replace with your database implementation
    // Example with Prisma:
    // const ${moduleName} = await db.${moduleName}.findUnique({ where: { id } });
    // if (!${moduleName}) throw new NotFoundError('${capitalizedModule}', id);
    // return ${moduleName};

    // Mock implementation - replace with actual database call
    if (id === 'not-found') {
      throw new NotFoundError('${capitalizedModule}', id);
    }

    const ${moduleName} = {
      id,
      // Add your ${moduleName} fields here
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return ${moduleName};
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    throw new DatabaseError(\`Failed to find ${moduleName}: \${error instanceof Error ? error.message : 'Unknown error'}\`);
  }
};

/**
 * Finds multiple ${moduleName}s with pagination and filtering
 */
export const findMany = async ({
  page = 1,
  limit = 10,
  sort_by = 'created_at',
  sort_order = 'desc',
  search,
  ...options
}: ListPayload) => {
  try {

    // TODO: Replace with your database implementation
    // Example with Prisma:
    // const where = search ? { title: { contains: search, mode: 'insensitive' } } : {};
    // const [items, total_count] = await Promise.all([
    //   db.${moduleName}.findMany({
    //     where,
    //     orderBy: { [sort_by]: sort_order },
    //     skip: (page - 1) * limit,
    //     take: limit,
    //   }),
    //   db.${moduleName}.count({ where })
    // ]);

    // Mock implementation - replace with actual database call
    // Using parameters to avoid unused variable warnings
    console.log('Query params:', { page, limit, sort_by, sort_order, search });

    const items = [
      {
        id: 'mock-id-1',
        // Add your ${moduleName} fields here
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ];

    const total_count = 1;
    const total_pages = Math.ceil(total_count / limit);

    return {
      items,
      _metadata: {
        page,
        limit,
        total_count,
        total_pages,
        has_next: page < total_pages,
        has_prev: page > 1,
      }
    };
  } catch (error) {
    throw new DatabaseError(\`Failed to list ${moduleName}s: \${error instanceof Error ? error.message : 'Unknown error'}\`);
  }
};

/**
 * Updates a ${moduleName}
 */
export const update = async (id: string, {
  // TODO: Add your updatable fields here, e.g.:
  // name,
  // description,
}: Omit<UpdatePayload, 'id'>) => {
  try {
    // TODO: Replace with your database implementation
    // Example with Prisma:
    // const ${moduleName} = await db.${moduleName}.update({
    //   where: { id },
    //   data: { name, description, updated_at: new Date().toISOString() }
    // });
    // return ${moduleName};

    // Mock implementation - replace with actual database call
    if (id === 'not-found') {
      throw new NotFoundError('${capitalizedModule}', id);
    }

    const ${moduleName} = {
      id,
      // TODO: Add your updatable fields here, e.g.:
      // name,
      // description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return ${moduleName};
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    throw new DatabaseError(\`Failed to update ${moduleName}: \${error instanceof Error ? error.message : 'Unknown error'}\`);
  }
};

/**
 * Deletes a ${moduleName}
 */
export const remove = async (id: string, permanent: boolean = false) => {
  try {
    // TODO: Replace with your database implementation
    // Example with Prisma:
    // if (permanent) {
    //   await db.${moduleName}.delete({ where: { id } });
    // } else {
    //   await db.${moduleName}.update({ where: { id }, data: { deleted_at: new Date() } });
    // }

    // Mock implementation - replace with actual database call
    if (id === 'not-found') {
      throw new NotFoundError('${capitalizedModule}', id);
    }

    return {
      deleted_id: id,
      deleted_at: new Date().toISOString(),
      permanent
    };
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    throw new DatabaseError(\`Failed to delete ${moduleName}: \${error instanceof Error ? error.message : 'Unknown error'}\`);
  }
};

// Alias for consistency with service layer
export { remove as delete };
`;
};

/**
 * Generates custom repository content
 */
const generateCustomRepositoryContent = (
  moduleName: string,
  _capitalizedModule: string,
  customNames: string[]
): string => {
  const customMethods = customNames
    .map(
      customName => `
/**
 * ${customName} operation for ${moduleName}
 */
export const ${customName} = async ({
  // TODO: Add your specific fields here based on your operation needs
}: any): Promise<any> => {
  try {
    // TODO: Implement your ${customName} logic here
    // Example: return await db.${moduleName}.${customName}({
    //   // Pass your specific fields here
    // });

    // Mock implementation - replace with actual database call
    return { success: true, operation: '${customName}' };
  } catch (error) {
    throw new DatabaseError(\`Failed to ${customName} ${moduleName}: \${error instanceof Error ? error.message : 'Unknown error'}\`);
  }
};`
    )
    .join('\n');

  return `// Repository layer - Pure domain logic for custom operations
// This layer is reusable and independent of API concerns

import { NotFoundError, ValidationError, DatabaseError } from '../../../shared/errors';

${customMethods}
`;
};

/**
 * Generates generic repository content
 */
const generateGenericRepositoryContent = (
  moduleName: string,
  capitalizedModule: string
): string => {
  return `// Repository layer - Pure domain logic
// This layer is reusable and independent of API concerns

import { NotFoundError, ValidationError, DatabaseError } from '../../../shared/errors';

// TODO: Add your ${moduleName} repository methods here
// Example:
// export const create = async ({
//   // Add your specific fields here
// }: Create${capitalizedModule}Data): Promise<${capitalizedModule}> => {
//   // Implementation here
// };
`;
};
