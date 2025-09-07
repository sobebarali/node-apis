

import { ParsedTypePayload } from '../services/type-parser.service';


import { getModuleNaming, ModuleNaming } from '../shared/utils/naming.utils';

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
      return generateTypedCreateHandlerContent(
        naming,
        capitalizedOperation,
        parsedType
      );
    case 'get':
      return generateTypedGetHandlerContent(
        naming,
        capitalizedOperation,
        parsedType
      );
    case 'list':
      return generateTypedListHandlerContent(
        naming,
        capitalizedOperation,
        parsedType
      );
    case 'update':
      return generateTypedUpdateHandlerContent(
        naming,
        capitalizedOperation,
        parsedType
      );
    case 'delete':
      return generateTypedDeleteHandlerContent(
        naming,
        capitalizedOperation,
        parsedType
      );
    default:
      return generateGenericHandlerContent(
        naming,
        capitalizedOperation,
        operation,
        parsedType
      );
  }
};

/**
 * Generates CREATE handler content with your preferred format
 */
const generateTypedCreateHandlerContent = (
  naming: ModuleNaming,
  _capitalizedOperation: string,
  _parsedType: ParsedTypePayload
): string => {
  return `import { typePayload, typeResult, typeResultData, typeResultError } from '../types/create.${naming.file}';
import create from '../repository/${naming.directory}.repository';

export default async function create${naming.class}Handler(
  payload: typePayload,
  requestId: string
): Promise<typeResult> {
  let data: typeResultData | null = null;
  let error: typeResultError | null = null;

  try {
    const startTime = Date.now();
    console.info(\`\${requestId} [${naming.constant}] - CREATE handler started\`);

    // Business logic here - direct repository call
    const ${naming.variable} = await create(payload);

    data = ${naming.variable};

    const duration = Date.now() - startTime;
    console.info(\`\${requestId} [${naming.constant}] - CREATE handler completed successfully in \${duration}ms\`);
  } catch (err) {
    const customError = err as any;
    console.error(
      \`\${requestId} [${naming.constant}] - CREATE handler error: \${customError.message}\`
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
  naming: ModuleNaming,
  _capitalizedOperation: string,
  _parsedType: ParsedTypePayload
): string => {
  return `import { typePayload, typeResult, typeResultData, typeResultError } from '../types/get.${naming.file}';
import { findById } from '../repository/${naming.directory}.repository';

export default async function get${naming.class}Handler(
  payload: typePayload,
  requestId: string
): Promise<typeResult> {
  let data: typeResultData | null = null;
  let error: typeResultError | null = null;

  try {
    const startTime = Date.now();
    console.info(\`\${requestId} [${naming.constant}] - GET handler started\`);

    // Business logic here - direct repository call
    const ${naming.variable} = await findById(payload.id);

    data = ${naming.variable};

    const duration = Date.now() - startTime;
    console.info(\`\${requestId} [${naming.constant}] - GET handler completed successfully in \${duration}ms\`);
  } catch (err) {
    const customError = err as any;
    console.error(
      \`\${requestId} [${naming.constant}] - GET handler error: \${customError.message}\`
    );

    if (customError.name === 'NotFoundError') {
      error = {
        code: 'NOT_FOUND',
        message: \`${naming.class} not found\`,
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
  naming: ModuleNaming,
  _capitalizedOperation: string,
  operation: string,
  _parsedType: ParsedTypePayload
): string => {
  return `import { typePayload, typeResult, typeResultData, typeResultError } from '../types/${operation}.${naming.file}';
import { ${operation === 'delete' ? 'remove' : operation === 'list' ? 'findMany' : operation} } from '../repository/${naming.directory}.repository';

export default async function ${operation}${naming.class}Handler(
  payload: typePayload,
  requestId: string
): Promise<typeResult> {
  let data: typeResultData | null = null;
  let error: typeResultError | null = null;

  try {
    const startTime = Date.now();
    console.info(\`\${requestId} [${naming.constant}] - ${operation.toUpperCase()} handler started\`);

    // Business logic here - direct repository call
    ${
      operation === 'delete'
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

    const duration = Date.now() - startTime;
    console.info(\`\${requestId} [${naming.constant}] - ${operation.toUpperCase()} handler completed successfully in \${duration}ms\`);
  } catch (err) {
    const customError = err as any;
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
      };
    } else {`
    }
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
  naming: ModuleNaming,
  capitalizedOperation: string,
  parsedType: ParsedTypePayload
): string =>
  generateGenericHandlerContent(
    naming,
    capitalizedOperation,
    'list',
    parsedType
  );

const generateTypedUpdateHandlerContent = (
  naming: ModuleNaming,
  capitalizedOperation: string,
  parsedType: ParsedTypePayload
): string =>
  generateGenericHandlerContent(
    naming,
    capitalizedOperation,
    'update',
    parsedType
  );

const generateTypedDeleteHandlerContent = (
  naming: ModuleNaming,
  capitalizedOperation: string,
  parsedType: ParsedTypePayload
): string =>
  generateGenericHandlerContent(
    naming,
    capitalizedOperation,
    'delete',
    parsedType
  );
