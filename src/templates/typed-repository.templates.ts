import { ApiType } from '../types/common.types';
import {
  ParsedTypePayload,
  generateFieldDestructuring,
  generateFieldObject,
} from '../services/type-parser.service';
import { getModuleNaming } from '../shared/utils/naming.utils';

export const generateTypedRepositoryContent = ({
  moduleName,
  apiType,
  parsedTypes,
}: {
  moduleName: string;
  apiType: ApiType;
  parsedTypes: Record<string, ParsedTypePayload>;
}): string => {
  const naming = getModuleNaming(moduleName);
  const capitalizedModule = naming.class;

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
  const naming = getModuleNaming(moduleName);
  const variableName = naming.variable;
  const createType = parsedTypes.create || { fields: [], hasId: false, hasPagination: false };
  const updateType = parsedTypes.update || { fields: [], hasId: false, hasPagination: false };
  const listType = parsedTypes.list || { fields: [], hasId: false, hasPagination: false };

  const createFieldDestructuring = generateFieldDestructuring(createType.fields);
  const createFieldObject = generateFieldObject(createType.fields);
  const updateFieldObject = generateFieldObject(updateType.fields.filter(f => f.name !== `${variableName}Id`));
  const listFieldDestructuring = generateFieldDestructuring(listType.fields);

  return `export default async function create({
${createFieldDestructuring}
}: {
${createType.fields.map(field => `  ${field.name}${field.optional ? '?' : ''}: ${field.type};`).join('\n')}
}) {
  try {
    const ${variableName} = {
      ${variableName}Id: \`mock-id-\${Date.now()}\`,
${createFieldObject}
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return ${variableName};
  } catch (error) {
    throw new Error(\`Database error: Failed to create ${variableName}: \${error instanceof Error ? error.message : 'Unknown error'}\`);
  }
};

/**
 * Finds a ${moduleName} by ID
 */
export function findById(${variableName}Id: string) {
  try {
    // TODO: Replace with your database implementation
    // Example with Prisma:
    // const ${variableName} = await db.${variableName}.findUnique({ where: { ${variableName}Id } });
    // if (!${variableName}) throw new Error(\`${capitalizedModule} not found: \${${variableName}Id}\`);
    // return ${variableName};

    // Mock implementation - replace with actual database call
    if (${variableName}Id === 'not-found') {
      throw new Error(\`${capitalizedModule} not found: \${${variableName}Id}\`);
    }

    const ${variableName} = {
      ${variableName}Id,
      // TODO: Add your ${variableName} fields here based on your database schema
      // Mock data - replace with actual database result
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return ${variableName};
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) throw error;
    throw new Error(\`Database error: Failed to find ${moduleName}: \${error instanceof Error ? error.message : 'Unknown error'}\`);
  }
};

/**
 * Finds multiple ${moduleName}s with pagination and filtering
 */
export function findMany({
${listFieldDestructuring}
}: {
${listType.fields.map(field => `  ${field.name}${field.optional ? '?' : ''}: ${field.type};`).join('\n')}
}) {
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
        ${variableName}Id: 'mock-id-1',
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
    throw new Error(\`Database error: Failed to list ${moduleName}s: \${error instanceof Error ? error.message : 'Unknown error'}\`);
  }
};

/**
 * Updates a ${moduleName}
 */
export function update(${variableName}Id: string, {
${updateType.fields
  .filter(f => f.name !== `${variableName}Id`)
  .map(field => `  ${field.name},`).join('\n')}
}: {
${updateType.fields
  .filter(f => f.name !== `${variableName}Id`)
  .map(field => `  ${field.name}${field.optional ? '?' : ''}: ${field.type};`).join('\n')}
}) {
  try {
    // TODO: Replace with your database implementation
    // Example with Prisma:
    // const ${variableName} = await db.${variableName}.update({
    //   where: { ${variableName}Id },
    //   data: { ${updateType.fields
      .filter(f => f.name !== '${variableName}Id')
      .map(f => f.name)
      .join(', ')}, updated_at: new Date().toISOString() }
    // });
    // return ${variableName};

    // Mock implementation - replace with actual database call
    if (${variableName}Id === 'not-found') {
      throw new Error(\`${capitalizedModule} not found: \${${variableName}Id}\`);
    }

    const ${variableName} = {
      ${variableName}Id,
${updateFieldObject}
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return ${variableName};
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) throw error;
    throw new Error(\`Database error: Failed to update ${moduleName}: \${error instanceof Error ? error.message : 'Unknown error'}\`);
  }
};

/**
 * Deletes a ${moduleName}
 */
export function remove(${variableName}Id: string, permanent: boolean = false) {
  try {
    // TODO: Replace with your database implementation
    // Example with Prisma:
    // if (permanent) {
    //   await db.${moduleName}.delete({ where: { ${variableName}Id } });
    // } else {
    //   await db.${moduleName}.update({ where: { ${variableName}Id }, data: { deleted_at: new Date() } });
    // }

    // Mock implementation - replace with actual database call
    if (${variableName}Id === 'not-found') {
      throw new Error(\`${capitalizedModule} not found: \${${variableName}Id}\`);
    }

    return {
      deleted_at: new Date().toISOString(),
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) throw error;
    throw new Error(\`Database error: Failed to delete ${moduleName}: \${error instanceof Error ? error.message : 'Unknown error'}\`);
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
  const naming = getModuleNaming(moduleName);
  const variableName = naming.variable;
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
}: {
${parsedType.fields.map(field => `  ${field.name}${field.optional ? '?' : ''}: ${field.type};`).join('\n')}
}): Promise<any> => {
  try {
    // TODO: Implement your ${customName} logic here
    // Example: return await db.${variableName}.${customName}({
    //   ${parsedType.fields.map(f => f.name).join(', ')}
    // });

    // Mock implementation - replace with actual database call
    return { success: true, operation: '${customName}' };
  } catch (error) {
    throw new Error(\`Database error: Failed to ${customName} ${moduleName}: \${error instanceof Error ? error.message : 'Unknown error'}\`);
  }
};`;
    })
    .join('\n');

  return `// Repository layer - Pure domain logic for custom operations
// This layer is reusable and independent of API concerns

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
  const naming = getModuleNaming(moduleName);
  const variableName = naming.variable;
  return `// Repository layer - Pure domain logic
// This layer is reusable and independent of API concerns

// TODO: Add your ${variableName} repository methods here
// Example:
// export const create = async ({
//   // Add your specific fields here
// }: Create${capitalizedModule}Data): Promise<${capitalizedModule}> => {
//   // Implementation here
// };
`;
};
