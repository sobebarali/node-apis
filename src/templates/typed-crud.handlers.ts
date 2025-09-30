import { ParsedTypePayload } from '../services/type-parser.service';

import { getModuleNaming, ModuleNaming } from '../shared/utils/naming.utils';

/**
 * Finds the ID field in the parsed type (either 'id' or '${moduleName}Id')
 */
const findIdField = (parsedType: ParsedTypePayload, moduleName: string): string | null => {
  const moduleIdField = `${moduleName}Id`;

  // Prefer module-specific ID field if it exists
  if (parsedType.fields.some(f => f.name === moduleIdField)) {
    return moduleIdField;
  }

  // Fallback to generic 'id' field
  if (parsedType.fields.some(f => f.name === 'id')) {
    return 'id';
  }

  return null;
};

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
      return generateTypedCreateHandlerContent(naming, capitalizedOperation, parsedType);
    case 'get':
      return generateTypedGetHandlerContent(naming, capitalizedOperation, parsedType);
    case 'list':
      return generateTypedListHandlerContent(naming, capitalizedOperation, parsedType);
    case 'update':
      return generateTypedUpdateHandlerContent(naming, capitalizedOperation, parsedType);
    case 'delete':
      return generateTypedDeleteHandlerContent(naming, capitalizedOperation, parsedType);
    default:
      return generateGenericHandlerContent(naming, capitalizedOperation, operation, parsedType);
  }
};

/**
 * Generates CREATE handler content with your preferred format
 */
const generateTypedCreateHandlerContent = (
  naming: ModuleNaming,
  _capitalizedOperation: string,
  parsedType: ParsedTypePayload
): string => {
  const fieldDestructuring =
    parsedType.fields.length > 0
      ? parsedType.fields.map(field => field.name).join(',\n  ')
      : '// No fields defined in typePayload';

  const fieldTypes =
    parsedType.fields.length > 0
      ? parsedType.fields.map(field => `  ${field.name}${field.optional ? '?' : ''}: ${field.type};`).join('\n')
      : '  // No fields defined in typePayload';

  const payloadObject =
    parsedType.fields.length > 0
      ? `{ ${parsedType.fields.map(field => 
          field.optional 
            ? `...(${field.name} !== undefined && { ${field.name} })`
            : field.name
        ).join(', ')} }`
      : '{}';

  return `import type { typeResult, typeResultData, typeResultError } from '../types/create.${naming.file}';
import create from '../repository/${naming.directory}.repository';

export default async function create${naming.class}Handler({
  ${fieldDestructuring},
  requestId,
}: {
${fieldTypes}
  requestId: string;
}): Promise<typeResult> {
  let data: typeResultData | null = null;
  let error: typeResultError | null = null;

  try {
    const startTime = Date.now();
    console.info(\`\${requestId} [${naming.constant}] - CREATE handler started\`);

    // Business logic here - direct repository call
    const ${naming.variable} = await create(${payloadObject});

    data = ${naming.variable};

    const duration = Date.now() - startTime;
    console.info(\`\${requestId} [${naming.constant}] - CREATE handler completed successfully in \${duration}ms\`);
  } catch (err) {
    const customError = err as Error;
    console.error(
      \`\${requestId} [${naming.constant}] - CREATE handler error: \${customError.message}\`
    );
    error = {
      code: (customError as any).errorCode ?? 'INTERNAL_ERROR',
      message: customError.message ?? 'An unexpected error occurred',
      statusCode: (customError as any).statusCode ?? 500,
      requestId,
    };
  }

  return { data, error };
}
`;
};

/**
 * Generates GET handler content with your preferred format
 */
const generateTypedGetHandlerContent = (
  naming: ModuleNaming,
  _capitalizedOperation: string,
  parsedType: ParsedTypePayload
): string => {
  const fieldDestructuring =
    parsedType.fields.length > 0
      ? parsedType.fields.map(field => field.name).join(',\n  ')
      : '// No fields defined in typePayload';

  const fieldTypes =
    parsedType.fields.length > 0
      ? parsedType.fields.map(field => `  ${field.name}${field.optional ? '?' : ''}: ${field.type};`).join('\n')
      : '  // No fields defined in typePayload';

  // GET typically uses the ID field from the payload
  const idField = findIdField(parsedType, naming.variable);
  const idAccess = idField || 'id';

  return `import type { typeResult, typeResultData, typeResultError } from '../types/get.${naming.file}';
import { findById } from '../repository/${naming.directory}.repository';

export default async function get${naming.class}Handler({
  ${fieldDestructuring},
  requestId,
}: {
${fieldTypes}
  requestId: string;
}): Promise<typeResult> {
  let data: typeResultData | null = null;
  let error: typeResultError | null = null;

  try {
    const startTime = Date.now();
    console.info(\`\${requestId} [${naming.constant}] - GET handler started\`);

    // Business logic here - direct repository call
    const ${naming.variable} = await findById(${idAccess});

    data = ${naming.variable};

    const duration = Date.now() - startTime;
    console.info(\`\${requestId} [${naming.constant}] - GET handler completed successfully in \${duration}ms\`);
  } catch (err) {
    const customError = err as Error;
    console.error(
      \`\${requestId} [${naming.constant}] - GET handler error: \${customError.message}\`
    );

    if (customError.name === 'NotFoundError') {
      error = {
        code: 'NOT_FOUND',
        message: \`${naming.class} not found\`,
        statusCode: 404,
        requestId,
      };
    } else {
      error = {
        code: (customError as any).errorCode ?? 'INTERNAL_ERROR',
        message: customError.message ?? 'An unexpected error occurred',
        statusCode: (customError as any).statusCode ?? 500,
      };
    }
  }

  return { data, error };
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
  parsedType: ParsedTypePayload
): string => {
  const fieldDestructuring =
    parsedType.fields.length > 0
      ? parsedType.fields.map(field => field.name).join(',\n  ')
      : '// No fields defined in typePayload';

  const fieldTypes =
    parsedType.fields.length > 0
      ? parsedType.fields.map(field => `  ${field.name}${field.optional ? '?' : ''}: ${field.type};`).join('\n')
      : '  // No fields defined in typePayload';

  // Generate the appropriate repository call based on operation
  const getRepositoryCall = () => {
    if (operation === 'delete') {
      const idField = findIdField(parsedType, naming.variable);
      const idAccess = idField || 'id';
      const permanentAccess = parsedType.fields.find(f => f.name === 'permanent')
        ? 'permanent'
        : 'false';
      return `await remove(${idAccess}, ${permanentAccess} || false);
    data = {
      deleted_id: ${idAccess},
      deleted_at: new Date().toISOString(),
      permanent: ${permanentAccess} || false
    };`;
    } else if (operation === 'list') {
      const payloadObject =
        parsedType.fields.length > 0
          ? `{ ${parsedType.fields.map(field => 
              field.optional 
                ? `...(${field.name} !== undefined && { ${field.name} })`
                : field.name
            ).join(', ')} }`
          : '{}';
      return `const result = await findMany(${payloadObject});
    data = result;`;
    } else if (operation === 'update') {
      const idField = findIdField(parsedType, naming.variable);
      const idAccess = idField || 'id';
      const nonIdFields = parsedType.fields.filter(f => f.name !== idField);
      const updateObject = nonIdFields.length > 0 
        ? `{ ${nonIdFields.map(field => 
            field.optional 
              ? `...(${field.name} !== undefined && { ${field.name} })`
              : field.name
          ).join(', ')} }` 
        : '{}';
      return `const result = await update(${idAccess}, ${updateObject});
    data = result;`;
    } else {
      return `// TODO: Implement ${operation} logic
    data = null;`;
    }
  };

  return `import type { typeResult, typeResultData, typeResultError } from '../types/${operation}.${naming.file}';
import { ${operation === 'delete' ? 'remove' : operation === 'list' ? 'findMany' : operation} } from '../repository/${naming.directory}.repository';

export default async function ${operation}${naming.class}Handler({
  ${fieldDestructuring},
  requestId,
}: {
${fieldTypes}
  requestId: string;
}): Promise<typeResult> {
  let data: typeResultData | null = null;
  let error: typeResultError | null = null;

  try {
    const startTime = Date.now();
    console.info(\`\${requestId} [${naming.constant}] - ${operation.toUpperCase()} handler started\`);

    // Business logic here - direct repository call
    ${getRepositoryCall()}

    const duration = Date.now() - startTime;
    console.info(\`\${requestId} [${naming.constant}] - ${operation.toUpperCase()} handler completed successfully in \${duration}ms\`);
  } catch (err) {
    const customError = err as Error;
    console.error(
      \`\${requestId} [${naming.constant}] - ${operation.toUpperCase()} handler error: \${customError.message}\`
    );

    ${
      operation === 'delete' &&
      `if (customError.name === 'NotFoundError') {
      error = {
        code: 'NOT_FOUND',
        message: \`${naming.class} not found\`,
        statusCode: 404,
        requestId,
      };
    } else {`
    }
    error = {
      code: (customError as any).errorCode ?? 'INTERNAL_ERROR',
      message: customError.message ?? 'An unexpected error occurred',
      statusCode: (customError as any).statusCode ?? 500,
      requestId,
    };
    ${operation === 'delete' && `}`}
  }

  return { data, error };
}
`;
};

// Placeholder functions for other operations
const generateTypedListHandlerContent = (
  naming: ModuleNaming,
  capitalizedOperation: string,
  parsedType: ParsedTypePayload
): string => generateGenericHandlerContent(naming, capitalizedOperation, 'list', parsedType);

const generateTypedUpdateHandlerContent = (
  naming: ModuleNaming,
  capitalizedOperation: string,
  parsedType: ParsedTypePayload
): string => generateGenericHandlerContent(naming, capitalizedOperation, 'update', parsedType);

const generateTypedDeleteHandlerContent = (
  naming: ModuleNaming,
  capitalizedOperation: string,
  parsedType: ParsedTypePayload
): string => generateGenericHandlerContent(naming, capitalizedOperation, 'delete', parsedType);
