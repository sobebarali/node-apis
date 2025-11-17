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

const buildBusinessLogicBlock = ({
  useRepositoryLayer,
  invocation,
  actionDescription,
}: {
  useRepositoryLayer: boolean;
  invocation: string;
  actionDescription: string;
}): string => {
  if (useRepositoryLayer) {
    return `    const result = await ${invocation};`;
  }

  return `    // TODO: Implement your ${actionDescription} logic without the repository layer
    const result = {} as typeResult;`;
};

export const generateCrudHandlerContent = ({
  operation,
  moduleName,
  parsedType,
  useRepositoryLayer = true,
}: {
  operation: string;
  moduleName: string;
  parsedType: ParsedTypePayload;
  useRepositoryLayer?: boolean;
}): string => {
  const naming = getModuleNaming(moduleName);
  const capitalizedOperation = operation.charAt(0).toUpperCase() + operation.slice(1);

  // Generate operation-specific handler content
  switch (operation) {
    case 'create':
      return generateTypedCreateHandlerContent(naming, capitalizedOperation, parsedType, useRepositoryLayer);
    case 'get':
      return generateTypedGetHandlerContent(naming, capitalizedOperation, parsedType, useRepositoryLayer);
    case 'list':
      return generateTypedListHandlerContent(naming, capitalizedOperation, parsedType, useRepositoryLayer);
    case 'update':
      return generateTypedUpdateHandlerContent(naming, capitalizedOperation, parsedType, useRepositoryLayer);
    case 'delete':
      return generateTypedDeleteHandlerContent(naming, capitalizedOperation, parsedType, useRepositoryLayer);
    default:
      return generateGenericHandlerContent(naming, capitalizedOperation, operation, parsedType, useRepositoryLayer);
  }
};

/**
 * Generates CREATE handler content with framework-agnostic approach
 */
const generateTypedCreateHandlerContent = (
  naming: ModuleNaming,
  _capitalizedOperation: string,
  parsedType: ParsedTypePayload,
  useRepositoryLayer: boolean
): string => {
  const fieldDestructuring =
    parsedType.fields.length > 0
      ? parsedType.fields.map(field => `${field.name},`).join('\n  ')
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

  const repositoryImport = useRepositoryLayer
    ? `import create from "../repository/create.${naming.file}";
`
    : '';
  const businessLogic = buildBusinessLogicBlock({
    useRepositoryLayer,
    invocation: `create(${payloadObject})`,
    actionDescription: `CREATE ${naming.constant}`,
  });

  return `${repositoryImport}import type { typeResult } from "../types/create.${naming.file}";

export default async function create${naming.class}Handler({
  ${fieldDestructuring}
  requestId,
}: {
${fieldTypes}
  requestId: string;
}): Promise<typeResult> {
  try {
    console.info(\`\${requestId} [HANDLER] - CREATE ${naming.constant} started\`);

    // Business logic here - implement your data access
${businessLogic}

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
 * Generates GET handler content with framework-agnostic approach
 */
const generateTypedGetHandlerContent = (
  naming: ModuleNaming,
  _capitalizedOperation: string,
  parsedType: ParsedTypePayload,
  useRepositoryLayer: boolean
): string => {
  const fieldDestructuring =
    parsedType.fields.length > 0
      ? parsedType.fields.map(field => `${field.name},`).join('\n  ')
      : '// No fields defined in typePayload';

  const fieldTypes =
    parsedType.fields.length > 0
      ? parsedType.fields.map(field => `  ${field.name}${field.optional ? '?' : ''}: ${field.type};`).join('\n')
      : '  // No fields defined in typePayload';

  // GET typically uses the ID field from the payload
  const idField = findIdField(parsedType, naming.variable);
  const idAccess = idField || 'id';

  const repositoryImport = useRepositoryLayer
    ? `import get from "../repository/get.${naming.file}";
`
    : '';
  const businessLogic = buildBusinessLogicBlock({
    useRepositoryLayer,
    invocation: `get(${idAccess})`,
    actionDescription: `GET ${naming.constant}`,
  });

  return `${repositoryImport}import type { typeResult } from "../types/get.${naming.file}";

export default async function get${naming.class}Handler({
  ${fieldDestructuring}
  requestId,
}: {
${fieldTypes}
  requestId: string;
}): Promise<typeResult> {
  try {
    console.info(\`\${requestId} [HANDLER] - GET ${naming.constant} started with id: \${${idAccess}}\`);

    // Business logic here - implement your data access
${businessLogic}

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
 * Generates LIST handler content with framework-agnostic approach
 */
const generateTypedListHandlerContent = (
  naming: ModuleNaming,
  _capitalizedOperation: string,
  parsedType: ParsedTypePayload,
  useRepositoryLayer: boolean
): string => {
  const fieldDestructuring =
    parsedType.fields.length > 0
      ? parsedType.fields.map(field => `${field.name},`).join('\n  ')
      : '// No fields defined in typePayload';

  const fieldTypes =
    parsedType.fields.length > 0
      ? parsedType.fields.map(field => `  ${field.name}${field.optional ? '?' : ''}: ${field.type};`).join('\n')
      : '  // No fields defined in typePayload';

  const filtersObject =
    parsedType.fields.length > 0
      ? `{ ${parsedType.fields.map(field =>
          field.optional
            ? `...(${field.name} !== undefined && { ${field.name} })`
            : field.name
        ).join(', ')} }`
      : '{}';

  const repositoryImport = useRepositoryLayer
    ? `import list from "../repository/list.${naming.file}";
`
    : '';
  const businessLogic = buildBusinessLogicBlock({
    useRepositoryLayer,
    invocation: `list(${filtersObject})`,
    actionDescription: `LIST ${naming.constant}`,
  });

  return `${repositoryImport}import type { typeResult } from "../types/list.${naming.file}";

export default async function list${naming.class}sHandler({
  ${fieldDestructuring}
  requestId,
}: {
${fieldTypes}
  requestId: string;
}): Promise<typeResult> {
  try {
    console.info(\`\${requestId} [HANDLER] - LIST ${naming.constant} started\`);

    // Business logic here - implement your data access
${businessLogic}

    console.info(\`\${requestId} [HANDLER] - LIST ${naming.constant} completed\`);

    return result;
  } catch (error) {
    console.error(\`\${requestId} [HANDLER] - LIST ${naming.constant} error:\`, error);

    return {
      data: null,
      error: {
        code: 'INTERNAL_ERROR',
        message: (error as Error).message || 'Failed to list ${naming.variable}s', // Using standard pluralization
        statusCode: 500
      }
    };
  }
}
`;
};

/**
 * Generates UPDATE handler content with framework-agnostic approach
 */
const generateTypedUpdateHandlerContent = (
  naming: ModuleNaming,
  _capitalizedOperation: string,
  parsedType: ParsedTypePayload,
  useRepositoryLayer: boolean
): string => {
  const fieldDestructuring =
    parsedType.fields.length > 0
      ? parsedType.fields.map(field => `${field.name},`).join('\n  ')
      : '// No fields defined in typePayload';

  const fieldTypes =
    parsedType.fields.length > 0
      ? parsedType.fields.map(field => `  ${field.name}${field.optional ? '?' : ''}: ${field.type};`).join('\n')
      : '  // No fields defined in typePayload';

  // UPDATE typically uses ID field and other fields for update data
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

  const repositoryImport = useRepositoryLayer
    ? `import update from "../repository/update.${naming.file}";
`
    : '';
  const businessLogic = buildBusinessLogicBlock({
    useRepositoryLayer,
    invocation: `update(${idAccess}, ${updateObject})`,
    actionDescription: `UPDATE ${naming.constant}`,
  });

  return `${repositoryImport}import type { typeResult } from "../types/update.${naming.file}";

export default async function update${naming.class}Handler({
  ${fieldDestructuring}
  requestId,
}: {
${fieldTypes}
  requestId: string;
}): Promise<typeResult> {
  try {
    console.info(\`\${requestId} [HANDLER] - UPDATE ${naming.constant} started with id: \${${idAccess}}\`);

    // Business logic here - implement your data access
${businessLogic}

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
 * Generates DELETE handler content with framework-agnostic approach
 */
const generateTypedDeleteHandlerContent = (
  naming: ModuleNaming,
  _capitalizedOperation: string,
  parsedType: ParsedTypePayload,
  useRepositoryLayer: boolean
): string => {
  const fieldDestructuring =
    parsedType.fields.length > 0
      ? parsedType.fields.map(field => `${field.name},`).join('\n  ')
      : '// No fields defined in typePayload';

  const fieldTypes =
    parsedType.fields.length > 0
      ? parsedType.fields.map(field => `  ${field.name}${field.optional ? '?' : ''}: ${field.type};`).join('\n')
      : '  // No fields defined in typePayload';

  // DELETE typically uses ID field
  const idField = findIdField(parsedType, naming.variable);
  const idAccess = idField || 'id';

  const repositoryImport = useRepositoryLayer
    ? `import remove from "../repository/delete.${naming.file}";
`
    : '';
  const businessLogic = buildBusinessLogicBlock({
    useRepositoryLayer,
    invocation: `remove(${idAccess})`,
    actionDescription: `DELETE ${naming.constant}`,
  });

  return `${repositoryImport}import type { typeResult } from "../types/delete.${naming.file}";

export default async function delete${naming.class}Handler({
  ${fieldDestructuring}
  requestId,
}: {
${fieldTypes}
  requestId: string;
}): Promise<typeResult> {
  try {
    console.info(\`\${requestId} [HANDLER] - DELETE ${naming.constant} started with id: \${${idAccess}}\`);

    // Business logic here - implement your data access
${businessLogic}

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
  capitalizedOperation: string,
  operation: string,
  parsedType: ParsedTypePayload,
  useRepositoryLayer: boolean
): string => {
  const fieldDestructuring =
    parsedType.fields.length > 0
      ? parsedType.fields.map(field => `${field.name},`).join('\n  ')
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
      return `remove(${idAccess})`;
    } else if (operation === 'list') {
      const filtersObject =
        parsedType.fields.length > 0
          ? `{ ${parsedType.fields.map(field =>
              field.optional
                ? `...(${field.name} !== undefined && { ${field.name} })`
                : field.name
            ).join(', ')} }`
          : '{}';
      return `list(${filtersObject})`;
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
      return `update(${idAccess}, ${updateObject})`;
    } else {
      return `${operation}({
      ${parsedType.fields.map(field => field.name).join(',\n      ')}
    })`;
    }
  };

  const repositoryImport = useRepositoryLayer
    ? `import ${operation} from "../repository/${operation}.${naming.file}";
`
    : '';
  const businessLogic = buildBusinessLogicBlock({
    useRepositoryLayer,
    invocation: getRepositoryCall(),
    actionDescription: `${capitalizedOperation.toUpperCase()} ${naming.constant}`,
  });

  return `${repositoryImport}import type { typeResult } from "../types/${operation}.${naming.file}";

export default async function ${operation}${naming.class}Handler({
  ${fieldDestructuring}
  requestId,
}: {
${fieldTypes}
  requestId: string;
}): Promise<typeResult> {
  try {
    console.info(\`\${requestId} [HANDLER] - ${operation.toUpperCase()} ${naming.constant} started\`);

    // Business logic here - implement your data access
${businessLogic}

    console.info(\`\${requestId} [HANDLER] - ${operation.toUpperCase()} ${naming.constant} completed\`);

    return result;
  } catch (error) {
    console.error(\`\${requestId} [HANDLER] - ${operation.toUpperCase()} ${naming.constant} error:\`, error);

    return {
      data: null,
      error: {
        code: 'INTERNAL_ERROR',
        message: (error as Error).message || 'Failed to ${operation.toLowerCase()} ${naming.variable}',
        statusCode: 500
      }
    };
  }
}
`;
};
