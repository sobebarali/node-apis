/**
 * Typed repository templates - generates repositories with actual field names from parsed types
 */

import { ApiType } from '../types/common.types';
import {
  ParsedTypePayload,
  generateFieldDestructuring,
  generateFieldObject,
} from '../services/type-parser.service';

/**
 * Generates repository file content for a module with parsed types
 */
export const generateTypedRepositoryContent = ({
  moduleName,
  apiType,
  parsedTypes,
}: {
  moduleName: string;
  apiType: ApiType;
  parsedTypes: Record<string, ParsedTypePayload>;
}): string => {
  const capitalizedModule = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);

  if (apiType.type === 'crud') {
    return generateTypedCrudRepositoryContent(moduleName, capitalizedModule, parsedTypes);
  } else if (apiType.type === 'custom' && apiType.customNames) {
    return generateTypedCustomRepositoryContent(
      moduleName,
      capitalizedModule,
      apiType.customNames,
      parsedTypes
    );
  }

  return generateTypedGenericRepositoryContent(moduleName, capitalizedModule);
};

/**
 * Generates CRUD repository content with parsed types
 */
const generateTypedCrudRepositoryContent = (
  moduleName: string,
  capitalizedModule: string,
  parsedTypes: Record<string, ParsedTypePayload>
): string => {
  const createType = parsedTypes.create || { fields: [], hasId: false, hasPagination: false };
  const updateType = parsedTypes.update || { fields: [], hasId: false, hasPagination: false };
  const listType = parsedTypes.list || { fields: [], hasId: false, hasPagination: false };

  const createFieldDestructuring = generateFieldDestructuring(createType.fields);
  const createFieldObject = generateFieldObject(createType.fields);
  const updateFieldDestructuring = generateFieldDestructuring(
    updateType.fields.filter(f => f.name !== 'id')
  );
  const updateFieldObject = generateFieldObject(updateType.fields.filter(f => f.name !== 'id'));
  const listFieldDestructuring = generateFieldDestructuring(listType.fields);

  return `// Repository layer - Pure domain logic, returns raw data, throws exceptions
// This layer is reusable and independent of API concerns

import { typePayload as CreatePayload } from '../types/create.${moduleName}';
import { typePayload as UpdatePayload } from '../types/update.${moduleName}';
import { typePayload as ListPayload } from '../types/list.${moduleName}';
import { NotFoundError, DatabaseError } from '../../../shared/errors';

/**
 * Creates a new ${moduleName}
 */
export default async function create({
${createFieldDestructuring}
}: CreatePayload) {
  try {
    // TODO: Replace with your database implementation
    // Example with Prisma:
    // return await db.${moduleName}.create({
    //   data: { ${createType.fields.map(f => f.name).join(', ')} }
    // });

    // Mock implementation - replace with actual database call
    const ${moduleName} = {
      id: \`mock-id-\${Date.now()}\`,
${createFieldObject}
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
export function findById(id: string) {
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
      // TODO: Add your ${moduleName} fields here based on your database schema
      // Mock data - replace with actual database result
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
export function findMany({
${listFieldDestructuring}
}: ListPayload) {
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
    console.log('Query params:', { ${listType.fields.map(f => f.name).join(', ')} });

    const items = [
      {
        id: 'mock-id-1',
        // TODO: Add your ${moduleName} fields here based on your database schema
        // Mock data - replace with actual database results
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ];

    const total_count = 1;
    const total_pages = Math.ceil(total_count / (limit || 10));

    return {
      items,
      _metadata: {
        page: page || 1,
        limit: limit || 10,
        total_count,
        total_pages,
        has_next: (page || 1) < total_pages,
        has_prev: (page || 1) > 1,
      }
    };
  } catch (error) {
    throw new DatabaseError(\`Failed to list ${moduleName}s: \${error instanceof Error ? error.message : 'Unknown error'}\`);
  }
};

/**
 * Updates a ${moduleName}
 */
export function update(id: string, {
${updateFieldDestructuring}
}: Omit<UpdatePayload, 'id'>) {
  try {
    // TODO: Replace with your database implementation
    // Example with Prisma:
    // const ${moduleName} = await db.${moduleName}.update({
    //   where: { id },
    //   data: { ${updateType.fields
      .filter(f => f.name !== 'id')
      .map(f => f.name)
      .join(', ')}, updated_at: new Date().toISOString() }
    // });
    // return ${moduleName};

    // Mock implementation - replace with actual database call
    if (id === 'not-found') {
      throw new NotFoundError('${capitalizedModule}', id);
    }

    const ${moduleName} = {
      id,
${updateFieldObject}
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
export function remove(id: string, permanent: boolean = false) {
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


`;
};

/**
 * Generates custom repository content with parsed types
 */
const generateTypedCustomRepositoryContent = (
  moduleName: string,
  _capitalizedModule: string,
  customNames: string[],
  parsedTypes: Record<string, ParsedTypePayload>
): string => {
  const customMethods = customNames
    .map(customName => {
      const parsedType = parsedTypes[customName] || {
        fields: [],
        hasId: false,
        hasPagination: false,
      };
      const fieldDestructuring = generateFieldDestructuring(parsedType.fields);

      return `
/**
 * ${customName} operation for ${moduleName}
 */
export const ${customName} = async ({
${fieldDestructuring}
}: any): Promise<any> => {
  try {
    // TODO: Implement your ${customName} logic here
    // Example: return await db.${moduleName}.${customName}({
    //   ${parsedType.fields.map(f => f.name).join(', ')}
    // });

    // Mock implementation - replace with actual database call
    return { success: true, operation: '${customName}' };
  } catch (error) {
    throw new DatabaseError(\`Failed to ${customName} ${moduleName}: \${error instanceof Error ? error.message : 'Unknown error'}\`);
  }
};`;
    })
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
const generateTypedGenericRepositoryContent = (
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
