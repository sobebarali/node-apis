import { ParsedField, ParsedTypePayload } from '../services/type-parser.service';

import { getModuleNaming } from '../shared/utils/naming.utils';

/**
 * Finds the ID field in the parsed type: '${moduleName}Id', then 'id'.
 * Other fields ending in Id are not guessed at, they are usually foreign keys.
 */
export const findIdField = (parsedType: ParsedTypePayload, moduleName: string): string | null => {
  const moduleIdField = `${moduleName}Id`;

  if (parsedType.fields.some(f => f.name === moduleIdField)) {
    return moduleIdField;
  }

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

/**
 * Builds an object literal that only includes optional fields when they are defined
 */
export const buildPayloadObject = (fields: ParsedField[]): string => {
  if (fields.length === 0) {
    return '{}';
  }

  const entries = fields.map(field =>
    field.optional ? `...(${field.name} !== undefined && { ${field.name} })` : field.name
  );

  return `{ ${entries.join(', ')} }`;
};

/**
 * Builds the complete handler file content shared by CRUD and custom operations
 */
export const buildHandlerContent = ({
  typesFile,
  functionName,
  logLabel,
  failureMessage,
  fields,
  usedFields = fields,
  repositoryImportName,
  invocation,
  startedSuffix = '',
  completedSuffix = '',
  mapNotFound = false,
}: {
  typesFile: string;
  functionName: string;
  logLabel: string;
  failureMessage: string;
  fields: ParsedField[];
  /** Fields the body reads. The rest stay in the parameter type but are not destructured. */
  usedFields?: ParsedField[];
  repositoryImportName?: string;
  invocation?: string;
  startedSuffix?: string;
  completedSuffix?: string;
  mapNotFound?: boolean;
}): string => {
  const fieldDestructuring =
    usedFields.length > 0
      ? usedFields.map(field => `${field.name},`).join('\n  ')
      : '// No fields defined in typePayload';

  const fieldTypes =
    fields.length > 0
      ? fields.map(field => `  ${field.name}${field.optional ? '?' : ''}: ${field.type};`).join('\n')
      : '  // No fields defined in typePayload';

  const usesRepository = repositoryImportName !== undefined && invocation !== undefined;

  const repositoryImport = usesRepository
    ? `import ${repositoryImportName} from "../repository/${typesFile}";
`
    : '';

  const typeImport = usesRepository
    ? 'import type { typeResult }'
    : 'import type { typeResult, typeResultData }';

  const stubSource = fields.length > 0 ? `{ ${fields.map(field => field.name).join(', ')} }` : '{}';
  const businessLogic = usesRepository
    ? `    const data = await ${invocation};`
    : `    // TODO: Implement your ${logLabel} logic here and return the real result
    const payload = ${stubSource};
    const data = payload as unknown as typeResultData;`;

  const notFoundBlock =
    mapNotFound && usesRepository
      ? `
    if (error instanceof Error && error.name === 'NotFoundError') {
      return {
        data: null,
        error: {
          code: 'NOT_FOUND',
          message: error.message,
          statusCode: 404,
          requestId,
        },
      };
    }
`
      : '';

  const failureReturn = `${notFoundBlock}
    return {
      data: null,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '${failureMessage}',
        statusCode: 500,
        requestId,
      },
    };`;

  return `${repositoryImport}${typeImport} from "../types/${typesFile}";

export default async function ${functionName}({
  ${fieldDestructuring}
  requestId,
}: {
${fieldTypes}
  requestId: string;
}): Promise<typeResult> {
  try {
    console.info(\`\${requestId} [HANDLER] - ${logLabel} started${startedSuffix}\`);

    // Business logic here - implement your data access
${businessLogic}

    console.info(\`\${requestId} [HANDLER] - ${logLabel} completed${completedSuffix}\`);

    return { data, error: null };
  } catch (error) {
    console.error(\`\${requestId} [HANDLER] - ${logLabel} error:\`, error);
${failureReturn}
  }
}
`;
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
  const { fields } = parsedType;
  const idField = findIdField(parsedType, naming.variable);
  const isIdOperation = operation === 'get' || operation === 'update' || operation === 'delete';
  const logLabel = `${operation.toUpperCase()} ${naming.constant}`;

  let repositoryImportName = operation;
  let invocation = `${operation}(${buildPayloadObject(fields)})`;
  let functionName = `${operation}${naming.class}Handler`;
  let failureMessage = `Failed to ${operation} ${naming.variable}`;

  if (operation === 'list') {
    functionName = `list${naming.class}sHandler`;
    failureMessage = `Failed to list ${naming.variable}s`;
  } else if (operation === 'get') {
    invocation = `get(${idField})`;
  } else if (operation === 'delete') {
    repositoryImportName = 'remove';
    invocation = `remove(${idField})`;
  } else if (operation === 'update') {
    const updateFields = fields.filter(f => f.name !== idField);
    invocation = `update(${idField}, ${buildPayloadObject(updateFields)})`;
  }

  // ID based operations cannot call the repository when typePayload has no ID field
  const canUseRepository = useRepositoryLayer && !(isIdOperation && idField === null);

  // get and delete only pass the ID to the repository
  const readsOnlyId = canUseRepository && (operation === 'get' || operation === 'delete');

  return buildHandlerContent({
    typesFile: `${operation}.${naming.file}`,
    functionName,
    logLabel,
    failureMessage,
    fields,
    ...(readsOnlyId && { usedFields: fields.filter(f => f.name === idField) }),
    ...(canUseRepository && { repositoryImportName, invocation }),
    startedSuffix: isIdOperation && idField !== null ? ` with id: \${${idField}}` : '',
    mapNotFound: isIdOperation,
  });
};
