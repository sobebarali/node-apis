import { ApiType } from '../types/common.types';
import {
  ParsedTypePayload,
  generateFieldDestructuring,
  generateFieldObject,
} from '../services/type-parser.service';
import { getModuleNaming, ModuleNaming } from '../shared/utils/naming.utils';

/**
 * Get CRUD repository file names (one per operation)
 */
export const getCrudRepositoryFileNames = ({ moduleName }: { moduleName: string }): string[] => {
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
 * Generate individual CRUD repository file content
 */
export const generateCrudRepositoryContent = ({
  operation,
  moduleName,
  parsedType,
}: {
  operation: string;
  moduleName: string;
  parsedType: ParsedTypePayload;
}): string => {
  const naming = getModuleNaming(moduleName);
  const capitalizedOperation = operation.charAt(0).toUpperCase() + operation.slice(1);

  switch (operation) {
    case 'create':
      return generateTypedCreateRepositoryContent(naming, capitalizedOperation, parsedType);
    case 'get':
      return generateTypedGetRepositoryContent(naming, capitalizedOperation, parsedType);
    case 'list':
      return generateTypedListRepositoryContent(naming, capitalizedOperation, parsedType);
    case 'delete':
      return generateTypedDeleteRepositoryContent(naming, capitalizedOperation, parsedType);
    case 'update':
      return generateTypedUpdateRepositoryContent(naming, capitalizedOperation, parsedType);
    default:
      return '';
  }
};

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
 * Individual repository content generators
 */
const generateTypedCreateRepositoryContent = (
  naming: ModuleNaming,
  _capitalizedOperation: string,
  parsedType: ParsedTypePayload
): string => {
  const variableName = naming.variable;
  const fieldDestructuring = generateFieldDestructuring(parsedType.fields);
  const fieldObject = generateFieldObject(parsedType.fields);

  return `import type { typeResult } from "../types/create.${naming.file}";

export default async function create({
${fieldDestructuring}
}: {
${parsedType.fields.map(field => `  ${field.name}${field.optional ? '?' : ''}: ${field.type};`).join('\n')}
}): Promise<typeResult> {
  try {
    // TODO: Implement your create logic here
    // Example: return await db.${variableName}.create({ data: { ${parsedType.fields.map(f => f.name).join(', ')} } });

    const ${variableName} = {
      ${variableName}Id: \`mock-id-\${Date.now()}\`,
${fieldObject}
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return ${variableName};
  } catch (error) {
    throw new Error(\`Database error: Failed to create ${variableName}: \${error instanceof Error ? error.message : 'Unknown error'}\`);
  }
}
`;
};

const generateTypedGetRepositoryContent = (
  naming: ModuleNaming,
  capitalizedOperation: string,
  _parsedType: ParsedTypePayload
): string => {
  const variableName = naming.variable;
  const capitalizedModule = naming.class;

  return `import type { typeResult } from "../types/get.${naming.file}";

export default async function get(${variableName}Id: string): Promise<typeResult> {
  try {
    // TODO: Replace with your database implementation
    // Example with Prisma:
    // const ${variableName} = await db.${variableName}.findUnique({ where: { ${variableName}Id } });
    // if (!${variableName}) throw new Error(\`${capitalizedModule} not found: \${${variableName}Id}\`);
    // return ${variableName};

    // Mock implementation - replace with actual database call
    if (${variableName}Id === 'not-found') {
      const error = new Error(\`${capitalizedModule} not found: \${${variableName}Id}\`);
      error.name = "NotFoundError";
      throw error;
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
    if (error instanceof Error && error.name === 'NotFoundError') throw error;
    throw new Error(\`Database error: Failed to ${capitalizedOperation.toLowerCase()} ${variableName}: \${error instanceof Error ? error.message : 'Unknown error'}\`);
  }
}
`;
};

const generateTypedListRepositoryContent = (
  naming: ModuleNaming,
  _capitalizedOperation: string,
  parsedType: ParsedTypePayload
): string => {
  const variableName = naming.variable;
  const moduleName = naming.file;
  const fieldDestructuring = generateFieldDestructuring(parsedType.fields);

  return `import type { typeResult } from "../types/list.${naming.file}";

export default async function list({
${fieldDestructuring}
}: {
${parsedType.fields.map(field => `  ${field.name}${field.optional ? '?' : ''}: ${field.type};`).join('\n')}
}): Promise<typeResult> {
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
    console.log('Query params:', { ${parsedType.fields.map(f => f.name).join(', ')} });

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
}
`;
};

const generateTypedDeleteRepositoryContent = (
  naming: ModuleNaming,
  _capitalizedOperation: string,
  _parsedType: ParsedTypePayload
): string => {
  const variableName = naming.variable;
  const capitalizedModule = naming.class;
  const moduleName = naming.file;

  return `import type { typeResult } from "../types/delete.${naming.file}";

export default async function remove(${variableName}Id: string, permanent: boolean = false): Promise<typeResult> {
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
      const error = new Error(\`${capitalizedModule} not found: \${${variableName}Id}\`);
      error.name = "NotFoundError";
      throw error;
    }

    return {
      deleted_id: ${variableName}Id,
      deleted_at: new Date().toISOString(),
      permanent,
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'NotFoundError') throw error;
    throw new Error(\`Database error: Failed to delete ${moduleName}: \${error instanceof Error ? error.message : 'Unknown error'}\`);
  }
}
`;
};

const generateTypedUpdateRepositoryContent = (
  naming: ModuleNaming,
  _capitalizedOperation: string,
  parsedType: ParsedTypePayload
): string => {
  const variableName = naming.variable;
  const capitalizedModule = naming.class;
  const moduleName = naming.file;
  const fieldObject = generateFieldObject(parsedType.fields.filter(f => f.name !== `${variableName}Id`));

  return `import type { typeResult } from "../types/update.${naming.file}";

export default async function update(${variableName}Id: string, {
${parsedType.fields
  .filter(f => f.name !== `${variableName}Id`)
  .map(field => `  ${field.name},`).join('\n')}
}: {
${parsedType.fields
  .filter(f => f.name !== `${variableName}Id`)
  .map(field => `  ${field.name}${field.optional ? '?' : ''}: ${field.type};`).join('\n')}
}): Promise<typeResult> {
  try {
    // TODO: Replace with your database implementation
    // Example with Prisma:
    // const ${variableName} = await db.${variableName}.update({
    //   where: { ${variableName}Id },
    //   data: { ${parsedType.fields
      .filter(f => f.name !== `${variableName}Id`)
      .map(f => f.name)
      .join(', ')}, updated_at: new Date().toISOString() }
    // });
    // return ${variableName};

    // Mock implementation - replace with actual database call
    if (${variableName}Id === 'not-found') {
      const error = new Error(\`${capitalizedModule} not found: \${${variableName}Id}\`);
      error.name = "NotFoundError";
      throw error;
    }

    const ${variableName} = {
      ${variableName}Id,
${fieldObject}
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return ${variableName};
  } catch (error) {
    if (error instanceof Error && error.name === 'NotFoundError') throw error;
    throw new Error(\`Database error: Failed to update ${moduleName}: \${error instanceof Error ? error.message : 'Unknown error'}\`);
  }
}
`;
};

/**
 * Generates CRUD repository content with parsed types (legacy combined file)
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

  return `export async function create({
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
}

export async function get(${variableName}Id: string) {
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
}

export async function list({
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
}

export async function update(${variableName}Id: string, {
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
}

export async function remove(${variableName}Id: string, permanent: boolean = false) {
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
}


`;
};

/**
 * Generate individual custom repository file content
 */
export const generateCustomRepositoryContent = ({
  customName,
  moduleName,
  parsedType,
}: {
  customName: string;
  moduleName: string;
  parsedType: ParsedTypePayload;
}): string => {
  const naming = getModuleNaming(moduleName);
  const variableName = naming.variable;
  const fieldDestructuring = generateFieldDestructuring(parsedType.fields);

  return `import type { typeResult } from "../types/${customName}.${naming.file}";

export default async function ${customName}({
${fieldDestructuring}
}: {
${parsedType.fields.map(field => `  ${field.name}${field.optional ? '?' : ''}: ${field.type};`).join('\n')}
}): Promise<typeResult> {
  try {
    // TODO: Implement your ${customName} logic here
    // Example: return await db.${variableName}.${customName}({
    //   ${parsedType.fields.map(f => f.name).join(', ')}
    // });

    // Mock implementation - replace with actual database call
    throw new Error("Not implemented - replace with actual database query");
  } catch (error) {
    throw new Error(\`Database error: Failed to ${customName}: \${error instanceof Error ? error.message : 'Unknown error'}\`);
  }
}
`;
};

/**
 * Generates custom repository content with parsed types (legacy combined file)
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
export async function ${customName}({
${fieldDestructuring}
}: {
${parsedType.fields.map(field => `  ${field.name}${field.optional ? '?' : ''}: ${field.type};`).join('\n')}
}): Promise<any> {
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
}`;
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
