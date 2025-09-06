/**
 * CRUD handler templates with your preferred format
 */

import { ParsedTypePayload } from '../services/type-parser.service';

/**
 * Gets the list of CRUD handler file names for a module
 */
export const getCrudHandlerFileNames = ({ moduleName }: { moduleName: string }): string[] => {
  return [
    `create.${moduleName}.ts`,
    `get.${moduleName}.ts`,
    `list.${moduleName}.ts`,
    `delete.${moduleName}.ts`,
    `update.${moduleName}.ts`
  ];
};

/**
 * Generates TypeScript handler file content for CRUD operations
 */
export const generateCrudHandlerContent = ({ 
  operation, 
  moduleName,
  parsedType
}: { 
  operation: string; 
  moduleName: string;
  parsedType: ParsedTypePayload;
}): string => {
  const capitalizedModule = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  const capitalizedOperation = operation.charAt(0).toUpperCase() + operation.slice(1);
  
  // Generate operation-specific handler content
  switch (operation) {
    case 'create':
      return generateTypedCreateHandlerContent(capitalizedModule, capitalizedOperation, moduleName, parsedType);
    case 'get':
      return generateTypedGetHandlerContent(capitalizedModule, capitalizedOperation, moduleName, parsedType);
    case 'list':
      return generateTypedListHandlerContent(capitalizedModule, capitalizedOperation, moduleName, parsedType);
    case 'update':
      return generateTypedUpdateHandlerContent(capitalizedModule, capitalizedOperation, moduleName, parsedType);
    case 'delete':
      return generateTypedDeleteHandlerContent(capitalizedModule, capitalizedOperation, moduleName, parsedType);
    default:
      return generateGenericHandlerContent(capitalizedModule, capitalizedOperation, operation, moduleName, parsedType);
  }
};

/**
 * Generates CREATE handler content with your preferred format
 */
const generateTypedCreateHandlerContent = (
  _capitalizedModule: string,
  _capitalizedOperation: string,
  moduleName: string,
  _parsedType: ParsedTypePayload
): string => {
  return `import { typePayload, typeResult, typeResultData, typeResultError } from '../types/create.${moduleName}';
import create from '../repository/${moduleName}.repository';

export default async function create${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Handler(
  payload: typePayload,
  requestId: string
): Promise<typeResult> {
  let data: typeResultData | null = null;
  let error: typeResultError | null = null;

  try {
    console.info(\`\${requestId} [${moduleName.toUpperCase()}] - CREATE handler started\`);

    // Business logic here - direct repository call
    const ${moduleName} = await create(payload);

    data = ${moduleName};

    console.info(\`\${requestId} [${moduleName.toUpperCase()}] - CREATE handler completed successfully\`);
  } catch (err) {
    const customError = err as any;
    console.error(
      \`\${requestId} [${moduleName.toUpperCase()}] - CREATE handler error: \${customError.message}\`
    );
    error = {
      code: customError.errorCode ?? 'INTERNAL_ERROR',
      message: customError.message ?? 'An unexpected error occurred',
      statusCode: customError.statusCode ?? 500,
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
  _capitalizedModule: string,
  _capitalizedOperation: string,
  moduleName: string,
  _parsedType: ParsedTypePayload
): string => {
  return `import { typePayload, typeResult, typeResultData, typeResultError } from '../types/get.${moduleName}';
import { findById } from '../repository/${moduleName}.repository';

export default async function get${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Handler(
  payload: typePayload,
  requestId: string
): Promise<typeResult> {
  let data: typeResultData | null = null;
  let error: typeResultError | null = null;

  try {
    console.info(\`\${requestId} [${moduleName.toUpperCase()}] - GET handler started\`);

    // Business logic here - direct repository call
    const ${moduleName} = await findById(payload.id);

    data = ${moduleName};

    console.info(\`\${requestId} [${moduleName.toUpperCase()}] - GET handler completed successfully\`);
  } catch (err) {
    const customError = err as any;
    console.error(
      \`\${requestId} [${moduleName.toUpperCase()}] - GET handler error: \${customError.message}\`
    );

    if (customError.name === 'NotFoundError') {
      error = {
        code: 'NOT_FOUND',
        message: \`${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} not found\`,
        statusCode: 404,
      };
    } else {
      error = {
        code: customError.errorCode ?? 'INTERNAL_ERROR',
        message: customError.message ?? 'An unexpected error occurred',
        statusCode: customError.statusCode ?? 500,
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
  _capitalizedModule: string,
  _capitalizedOperation: string,
  operation: string,
  moduleName: string,
  _parsedType: ParsedTypePayload
): string => {
  return `import { typePayload, typeResult, typeResultData, typeResultError } from '../types/${operation}.${moduleName}';
import { ${operation === 'delete' ? 'remove' : operation === 'list' ? 'findMany' : operation} } from '../repository/${moduleName}.repository';

export default async function ${operation}${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Handler(
  payload: typePayload,
  requestId: string
): Promise<typeResult> {
  let data: typeResultData | null = null;
  let error: typeResultError | null = null;

  try {
    console.info(\`\${requestId} [${moduleName.toUpperCase()}] - ${operation.toUpperCase()} handler started\`);

    // Business logic here - direct repository call
    ${operation === 'delete'
      ? `await remove(payload.id, payload.permanent || false);
    data = {
      deleted_id: payload.id,
      deleted_at: new Date().toISOString(),
      permanent: payload.permanent || false
    };`
      : operation === 'list'
      ? `const result = await findMany(payload);
    data = result;`
      : operation === 'update'
      ? `const { id, ...updateData } = payload;
    const result = await update(id, updateData);
    data = result;`
      : `// TODO: Implement ${operation} logic
    data = null;`
    }

    console.info(\`\${requestId} [${moduleName.toUpperCase()}] - ${operation.toUpperCase()} handler completed successfully\`);
  } catch (err) {
    const customError = err as any;
    console.error(
      \`\${requestId} [${moduleName.toUpperCase()}] - ${operation.toUpperCase()} handler error: \${customError.message}\`
    );

    ${operation === 'delete' && `if (customError.name === 'NotFoundError') {
      error = {
        code: 'NOT_FOUND',
        message: \`${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} not found\`,
        statusCode: 404,
      };
    } else {`}
    error = {
      code: customError.errorCode ?? 'INTERNAL_ERROR',
      message: customError.message ?? 'An unexpected error occurred',
      statusCode: customError.statusCode ?? 500,
    };
    ${operation === 'delete' && `}`}
  }

  return { data, error };
}
`;
};

// Placeholder functions for other operations
const generateTypedListHandlerContent = (
  capitalizedModule: string,
  capitalizedOperation: string,
  moduleName: string,
  parsedType: ParsedTypePayload
): string => generateGenericHandlerContent(capitalizedModule, capitalizedOperation, 'list', moduleName, parsedType);

const generateTypedUpdateHandlerContent = (
  capitalizedModule: string,
  capitalizedOperation: string,
  moduleName: string,
  parsedType: ParsedTypePayload
): string => generateGenericHandlerContent(capitalizedModule, capitalizedOperation, 'update', moduleName, parsedType);

const generateTypedDeleteHandlerContent = (
  capitalizedModule: string,
  capitalizedOperation: string,
  moduleName: string,
  parsedType: ParsedTypePayload
): string => generateGenericHandlerContent(capitalizedModule, capitalizedOperation, 'delete', moduleName, parsedType);
