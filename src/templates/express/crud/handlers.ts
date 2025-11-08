import { getModuleNaming, ModuleNaming } from '../../shared/naming.utils';

export const getCrudHandlerFileNames = ({ moduleName }: { moduleName: string }): string[] => {
  const naming = getModuleNaming(moduleName);
  return [
    `create.${naming.file}.ts`,
    `get.${naming.file}.ts`,
    `list.${naming.file}.ts`,
    `delete.${naming.file}.ts`,
    `update.${naming.file}.ts`,
  ];
};

import { ParsedTypePayload } from '../../../services/type-parser.service';

export const generateCrudHandlerContent = ({
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

  // Generate operation-specific handler content
  switch (operation) {
    case 'create':
      return generateCreateHandlerContent(naming, capitalizedOperation, parsedType);
    case 'get':
      return generateGetHandlerContent(naming, capitalizedOperation, parsedType);
    case 'list':
      return generateListHandlerContent(naming, capitalizedOperation, parsedType);
    case 'update':
      return generateUpdateHandlerContent(naming, capitalizedOperation, parsedType);
    case 'delete':
      return generateDeleteHandlerContent(naming, capitalizedOperation, parsedType);
    default:
      return generateGenericHandlerContent(naming, capitalizedOperation, operation, parsedType);
  }
};

/**
 * Generates CREATE handler content for Express
 */
const generateCreateHandlerContent = (
  naming: ModuleNaming,
  _capitalizedOperation: string,
  parsedType: ParsedTypePayload,
): string => {
  // Build field destructuring based on parsed type fields
  const fieldDestructuring = parsedType.fields.length > 0
    ? parsedType.fields.map(field => field.name).join(',\n  ')
    : '// No fields defined in typePayload';

  // Build field type definitions
  const fieldTypes = parsedType.fields.length > 0
    ? parsedType.fields.map(field => `  ${field.name}${field.optional ? '?' : ''}: ${field.type};`).join('\n')
    : '  // No fields defined in typePayload';

  // Build the payload object for the repository call
  const payloadObject = parsedType.fields.length > 0
    ? `{ ${parsedType.fields.map(field =>
        field.optional
          ? `...(${field.name} !== undefined && { ${field.name} })`
          : field.name
      ).join(', ')} }`
    : '{}';

  return `import create from "../repository/create.${naming.file}";
import type { typeResult } from "../types/create.${naming.file}";

export default async function create${naming.class}Handler({
  ${fieldDestructuring}
  requestId,
}: {
${fieldTypes}
  requestId: string;
}): Promise<typeResult> {
  try {
    console.info(\`\${requestId} [HANDLER] - CREATE ${naming.constant} started\`);

    // Business logic here - direct repository call
    const result = await create(${payloadObject});

    console.info(\`\${requestId} [HANDLER] - CREATE ${naming.constant} completed\`);

    return result;
  } catch (error) {
    console.error(\`\${requestId} [HANDLER] - CREATE ${naming.constant} error:\`, error);

    return {
      data: null,
      error: {
        code: 'INTERNAL_ERROR',
        message: (error as Error).message || 'Failed to create ${naming.variable}',
        statusCode: 500
      }
    };
  }
}
`;
};

/**
 * Generates GET handler content for Express
 */
const generateGetHandlerContent = (
  naming: ModuleNaming,
  _capitalizedOperation: string,
  parsedType: ParsedTypePayload,
): string => {
  // Find the ID field in the parsed type
  const idField = parsedType.fields.find(f => f.name.toLowerCase().includes('id'))?.name || `${naming.variable}Id`;
  


  // Build field type definitions
  const fieldTypes = idField
    ? `  ${idField}: string;\n  requestId: string;`
    : '  requestId: string;';

  return `import get from "../repository/get.${naming.file}";
import type { typeResult } from "../types/get.${naming.file}";

export default async function get${naming.class}Handler({
  ${idField},
  requestId,
}: {
${fieldTypes}
}): Promise<typeResult> {
  try {
    console.info(\`\${requestId} [HANDLER] - GET ${naming.constant} started with id: \${${idField}}\`);

    // Business logic here - direct repository call
    const result = await get(${idField});

    console.info(\`\${requestId} [HANDLER] - GET ${naming.constant} completed\`);

    return result;
  } catch (error) {
    console.error(\`\${requestId} [HANDLER] - GET ${naming.constant} error:\`, error);

    return {
      data: null,
      error: {
        code: 'INTERNAL_ERROR',
        message: (error as Error).message || 'Failed to get ${naming.variable}',
        statusCode: 500
      }
    };
  }
}
`;
};

/**
 * Generates LIST handler content for Express
 */
const generateListHandlerContent = (
  naming: ModuleNaming,
  _capitalizedOperation: string,
  parsedType: ParsedTypePayload,
): string => {
  // Build field type definitions
  const fieldTypes = parsedType.fields.length > 0
    ? parsedType.fields.map(field => `  ${field.name}${field.optional ? '?' : ''}: ${field.type};`).join('\n') + '\n  requestId: string;'
    : '  requestId: string;';

  // Build the filters object for the repository call
  const filtersObject = parsedType.fields.length > 0
    ? `{ ${parsedType.fields.map(field =>
        field.optional
          ? `...(${field.name} !== undefined && { ${field.name} })`
          : field.name
      ).join(', ')} }`
    : '{}';

  return `import list from "../repository/list.${naming.file}";
import type { typeResult } from "../types/list.${naming.file}";

export default async function list${naming.class}sHandler({
  ${parsedType.fields.length > 0 ? parsedType.fields.map(f => f.name).join(',\n  ') + ',' : ''}
  requestId,
}: {
${fieldTypes}
}): Promise<typeResult> {
  try {
    console.info(\`\${requestId} [HANDLER] - LIST ${naming.constant} started\`);

    // Business logic here - direct repository call
    const result = await list(${filtersObject});

    console.info(\`\${requestId} [HANDLER] - LIST ${naming.constant} completed\`);

    return result;
  } catch (error) {
    console.error(\`\${requestId} [HANDLER] - LIST ${naming.constant} error:\`, error);

    return {
      data: null,
      error: {
        code: 'INTERNAL_ERROR',
        message: (error as Error).message || 'Failed to list ${naming.variable}s',
        statusCode: 500
      }
    };
  }
}
`;
};

/**
 * Generates UPDATE handler content for Express
 */
const generateUpdateHandlerContent = (
  naming: ModuleNaming,
  _capitalizedOperation: string,
  parsedType: ParsedTypePayload,
): string => {
  // Find the ID field in the parsed type
  const idField = parsedType.fields.find(f => f.name.toLowerCase().includes('id'))?.name || `${naming.variable}Id`;
  
  // Get non-ID fields for update
  const nonIdFields = parsedType.fields.filter(f => !f.name.toLowerCase().includes('id'));
  
  // Build field type definitions
  const fieldTypes = [
    `  ${idField}: string;`,
    ...nonIdFields.map(f => `  ${f.name}${f.optional ? '?' : ''}: ${f.type};`),
    '  requestId: string;'
  ].join('\n');

  // Build the update data object
  const updateDataObject = nonIdFields.length > 0
    ? `{ ${nonIdFields.map(f =>
        f.optional
          ? `...(${f.name} !== undefined && { ${f.name} })`
          : f.name
      ).join(', ')} }`
    : '{}';

  return `import update from "../repository/update.${naming.file}";
import type { typeResult } from "../types/update.${naming.file}";

export default async function update${naming.class}Handler({
  ${idField},
  ${nonIdFields.length > 0 ? nonIdFields.map(f => f.name).join(',\n  ') + ',' : ''}
  requestId,
}: {
${fieldTypes}
}): Promise<typeResult> {
  try {
    console.info(\`\${requestId} [HANDLER] - UPDATE ${naming.constant} started with id: \${${idField}}\`);

    // Business logic here - direct repository call
    const result = await update(${idField}, ${updateDataObject});

    console.info(\`\${requestId} [HANDLER] - UPDATE ${naming.constant} completed\`);

    return result;
  } catch (error) {
    console.error(\`\${requestId} [HANDLER] - UPDATE ${naming.constant} error:\`, error);

    return {
      data: null,
      error: {
        code: 'INTERNAL_ERROR',
        message: (error as Error).message || 'Failed to update ${naming.variable}',
        statusCode: 500
      }
    };
  }
}
`;
};

/**
 * Generates DELETE handler content for Express
 */
const generateDeleteHandlerContent = (
  naming: ModuleNaming,
  _capitalizedOperation: string,
  parsedType: ParsedTypePayload,
): string => {
  // Find the ID field in the parsed type
  const idField = parsedType.fields.find(f => f.name.toLowerCase().includes('id'))?.name || `${naming.variable}Id`;
  
  // Build field type definitions
  const fieldTypes = `  ${idField}: string;\n  requestId: string;`;

  return `import remove from "../repository/delete.${naming.file}";
import type { typeResult } from "../types/delete.${naming.file}";

export default async function delete${naming.class}Handler({
  ${idField},
  requestId,
}: {
${fieldTypes}
}): Promise<typeResult> {
  try {
    console.info(\`\${requestId} [HANDLER] - DELETE ${naming.constant} started with id: \${${idField}}\`);

    // Business logic here - direct repository call
    const result = await remove(${idField});

    console.info(\`\${requestId} [HANDLER] - DELETE ${naming.constant} completed\`);

    return result;
  } catch (error) {
    console.error(\`\${requestId} [HANDLER] - DELETE ${naming.constant} error:\`, error);

    return {
      data: null,
      error: {
        code: 'INTERNAL_ERROR',
        message: (error as Error).message || 'Failed to delete ${naming.variable}',
        statusCode: 500
      }
    };
  }
}
`;
};

/**
 * Generates generic handler content (fallback)
 */
const generateGenericHandlerContent = (
  naming: ModuleNaming,
  _capitalizedOperation: string,
  operation: string,
  parsedType: ParsedTypePayload,
): string => {
  // Build field type definitions
  const fieldTypes = parsedType.fields.length > 0
    ? parsedType.fields.map(field => `  ${field.name}${field.optional ? '?' : ''}: ${field.type};`).join('\n') + '\n  requestId: string;'
    : '  requestId: string;';

  // Build the payload object for the repository call
  const payloadObject = parsedType.fields.length > 0
    ? `{ ${parsedType.fields.map(field =>
        field.optional
          ? `...(${field.name} !== undefined && { ${field.name} })`
          : field.name
      ).join(', ')} }`
    : '{}';

  return `import ${operation} from "../repository/${operation}.${naming.file}";
import type { typeResult } from "../types/${operation}.${naming.file}";

export default async function ${operation}${naming.class}Handler({
  ${parsedType.fields.length > 0 ? parsedType.fields.map(f => f.name).join(',\n  ') + ',' : ''}
  requestId,
}: {
${fieldTypes}
}): Promise<typeResult> {
  try {
    console.info(\`\${requestId} [HANDLER] - ${operation.toUpperCase()} ${naming.constant} started\`);

    // Business logic here - call repository function
    const result = await ${operation}(${payloadObject});

    console.info(\`\${requestId} [HANDLER] - ${operation.toUpperCase()} ${naming.constant} completed successfully\`);

    return result;
  } catch (error) {
    console.error(\`\${requestId} [HANDLER] - ${operation.toUpperCase()} ${naming.constant} error:\`, error);

    return {
      data: null,
      error: {
        code: 'INTERNAL_ERROR',
        message: (error as Error).message || 'Failed to execute ${operation} operation',
        statusCode: 500
      }
    };
  }
}
`;
};