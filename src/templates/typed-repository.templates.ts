import {
  ParsedField,
  ParsedTypePayload,
  generateFieldDestructuring,
  generateFieldObject,
} from '../services/type-parser.service';
import { getModuleNaming, ModuleNaming } from '../shared/utils/naming.utils';
import { findIdField } from './typed-crud.handlers';

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

const buildFieldTypes = (fields: ParsedField[]): string =>
  fields.map(field => `  ${field.name}${field.optional ? '?' : ''}: ${field.type};`).join('\n');

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

  switch (operation) {
    case 'create':
      return generateTypedCreateRepositoryContent(naming, parsedType);
    case 'get':
      return generateTypedGetRepositoryContent(naming);
    case 'list':
      return generateTypedListRepositoryContent(naming, parsedType);
    case 'delete':
      return generateTypedDeleteRepositoryContent(naming);
    case 'update':
      return generateTypedUpdateRepositoryContent(naming, parsedType);
    default:
      return '';
  }
};

/**
 * Individual repository content generators
 */
const generateTypedCreateRepositoryContent = (
  naming: ModuleNaming,
  parsedType: ParsedTypePayload
): string => {
  const variableName = naming.variable;
  const fieldDestructuring = generateFieldDestructuring(parsedType.fields);
  const fieldObject = generateFieldObject(parsedType.fields);

  return `import type { typeResultData } from "../types/create.${naming.file}";

export default async function create({
${fieldDestructuring}
}: {
${buildFieldTypes(parsedType.fields)}
}): Promise<typeResultData> {
  try {
    // TODO: Implement your create logic here
    // Example: return await db.${variableName}.create({ data: { ${parsedType.fields.map(f => f.name).join(', ')} } });

    // Mock implementation - replace with actual database call
    const ${variableName} = {
      ${variableName}Id: \`mock-id-\${Date.now()}\`,
${fieldObject}
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return ${variableName} as unknown as typeResultData;
  } catch (error) {
    throw new Error(\`Database error: Failed to create ${variableName}: \${error instanceof Error ? error.message : 'Unknown error'}\`);
  }
}
`;
};

const generateTypedGetRepositoryContent = (
  naming: ModuleNaming
): string => {
  const variableName = naming.variable;
  const capitalizedModule = naming.class;

  return `import type { typeResultData } from "../types/get.${naming.file}";

export default async function get(${variableName}Id: string): Promise<typeResultData> {
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

    return ${variableName} as unknown as typeResultData;
  } catch (error) {
    if (error instanceof Error && error.name === 'NotFoundError') throw error;
    throw new Error(\`Database error: Failed to get ${variableName}: \${error instanceof Error ? error.message : 'Unknown error'}\`);
  }
}
`;
};

const generateTypedListRepositoryContent = (
  naming: ModuleNaming,
  parsedType: ParsedTypePayload
): string => {
  const variableName = naming.variable;
  const moduleName = naming.file;
  const fieldNames = parsedType.fields.map(f => f.name);
  const pagingFields = parsedType.fields.filter(f => f.name === 'page' || f.name === 'limit');
  const filterNames = fieldNames.filter(name => name !== 'page' && name !== 'limit');
  const currentPage = fieldNames.includes('page') ? 'page ?? 1' : '1';
  const pageSize = fieldNames.includes('limit') ? 'limit ?? 10' : '10';
  // Only destructure what the mock uses, so the file compiles with noUnusedLocals
  const parameter =
    pagingFields.length > 0 ? `{\n${generateFieldDestructuring(pagingFields)}\n}` : '_params';
  const queryLog =
    filterNames.length > 0
      ? `// TODO: destructure and apply these filters in your query: ${filterNames.join(', ')}`
      : '// No filters defined in typePayload';

  return `import type { typeResultData } from "../types/list.${naming.file}";

export default async function list(${parameter}: {
${buildFieldTypes(parsedType.fields)}
}): Promise<typeResultData> {
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
    ${queryLog}

    const currentPage = ${currentPage};
    const pageSize = ${pageSize};

    const items = [
      {
        ${variableName}Id: 'mock-id-1',
        // TODO: Add your ${moduleName} fields here based on your database schema
        // Mock data - replace with actual database results
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ];

    const total_count = items.length;
    const total_pages = Math.ceil(total_count / pageSize);

    const result = {
      items,
      _metadata: {
        page: currentPage,
        limit: pageSize,
        total_count,
        total_pages,
        has_next: currentPage < total_pages,
        has_prev: currentPage > 1,
      }
    };

    return result as unknown as typeResultData;
  } catch (error) {
    throw new Error(\`Database error: Failed to list ${moduleName}s: \${error instanceof Error ? error.message : 'Unknown error'}\`);
  }
}
`;
};

const generateTypedDeleteRepositoryContent = (
  naming: ModuleNaming
): string => {
  const variableName = naming.variable;
  const capitalizedModule = naming.class;
  const moduleName = naming.file;

  return `import type { typeResultData } from "../types/delete.${naming.file}";

export default async function remove(${variableName}Id: string): Promise<typeResultData> {
  try {
    // TODO: Replace with your database implementation
    // Example with Prisma (soft delete):
    // await db.${moduleName}.update({ where: { ${variableName}Id }, data: { deleted_at: new Date() } });

    // Mock implementation - replace with actual database call
    if (${variableName}Id === 'not-found') {
      const error = new Error(\`${capitalizedModule} not found: \${${variableName}Id}\`);
      error.name = "NotFoundError";
      throw error;
    }

    const result = {
      deleted_at: new Date().toISOString(),
    };

    return result as unknown as typeResultData;
  } catch (error) {
    if (error instanceof Error && error.name === 'NotFoundError') throw error;
    throw new Error(\`Database error: Failed to delete ${moduleName}: \${error instanceof Error ? error.message : 'Unknown error'}\`);
  }
}
`;
};

const generateTypedUpdateRepositoryContent = (
  naming: ModuleNaming,
  parsedType: ParsedTypePayload
): string => {
  const variableName = naming.variable;
  const capitalizedModule = naming.class;
  const moduleName = naming.file;
  const idField = findIdField(parsedType, variableName);
  const updateFields = parsedType.fields.filter(f => f.name !== idField);
  const fieldObject = generateFieldObject(updateFields);

  return `import type { typeResultData } from "../types/update.${naming.file}";

export default async function update(${variableName}Id: string, {
${generateFieldDestructuring(updateFields)}
}: {
${buildFieldTypes(updateFields)}
}): Promise<typeResultData> {
  try {
    // TODO: Replace with your database implementation
    // Example with Prisma:
    // const ${variableName} = await db.${variableName}.update({
    //   where: { ${variableName}Id },
    //   data: { ${updateFields.map(f => f.name).join(', ')}, updated_at: new Date().toISOString() }
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

    return ${variableName} as unknown as typeResultData;
  } catch (error) {
    if (error instanceof Error && error.name === 'NotFoundError') throw error;
    throw new Error(\`Database error: Failed to update ${moduleName}: \${error instanceof Error ? error.message : 'Unknown error'}\`);
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
  const fieldObject = generateFieldObject(parsedType.fields);

  return `import type { typeResultData } from "../types/${customName}.${naming.file}";

export default async function ${customName}({
${fieldDestructuring}
}: {
${buildFieldTypes(parsedType.fields)}
}): Promise<typeResultData> {
  try {
    // TODO: Implement your ${customName} logic here
    // Example: return await db.${variableName}.${customName}({
    //   ${parsedType.fields.map(f => f.name).join(', ')}
    // });

    // Mock implementation - replace with actual database call
    const result = {
${fieldObject}
    };

    return result as unknown as typeResultData;
  } catch (error) {
    throw new Error(\`Database error: Failed to ${customName}: \${error instanceof Error ? error.message : 'Unknown error'}\`);
  }
}
`;
};
