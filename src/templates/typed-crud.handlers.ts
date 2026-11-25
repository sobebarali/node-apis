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
 * Builds a multi-line object literal that only includes optional fields when
 * they are defined. `indent` is the indentation of the line the literal starts on.
 */
export const buildPayloadObject = (fields: ParsedField[], indent = '    '): string => {
  if (fields.length === 0) {
    return '{}';
  }

  const entries = fields.map(field =>
    field.optional ? `...(${field.name} !== undefined && { ${field.name} })` : field.name
  );

  return `{\n${entries.map(entry => `${indent}  ${entry},`).join('\n')}\n${indent}}`;
};

const MAX_LINE_LENGTH = 100;

/** Picks the first candidate that no payload field is already named */
const pickLocalName = (fields: ParsedField[], candidates: string[]): string =>
  candidates.find(candidate => fields.every(field => field.name !== candidate)) ??
  `${candidates[0]}Value`;

/**
 * Builds the repository call and the success return. The call stays on one line
 * when it fits, the way a formatter would write it. A payload without fields
 * calls the function without arguments.
 */
export const buildInvocation = (functionName: string, fields: ParsedField[]): string => {
  if (fields.length === 0) {
    return `    const data = await ${functionName}();

    return { data, error: null };`;
  }

  const local = pickLocalName(fields, ['data', 'result', 'output']);
  const returned = local === 'data' ? 'data' : `data: ${local}`;

  const entries = fields.map(field =>
    field.optional ? `...(${field.name} !== undefined && { ${field.name} })` : field.name
  );
  const oneLine = `    const ${local} = await ${functionName}({ ${entries.join(', ')} });`;

  const call =
    oneLine.length <= MAX_LINE_LENGTH
      ? oneLine
      : `    const ${local} = await ${functionName}(${buildPayloadObject(fields)});`;

  return `${call}

    return { ${returned}, error: null };`;
};

/** Lines of a parameter type: `  name?: type;` */
export const buildFieldTypes = (fields: ParsedField[]): string =>
  fields.map(field => `  ${field.name}${field.optional ? '?' : ''}: ${field.type};`).join('\n');

/**
 * Builds the body of code that is not implemented yet. It fails loudly instead
 * of returning made-up data, and names only the fields it received, never their values.
 */
export const buildNotImplemented = ({
  label,
  fields,
  indent,
}: {
  label: string;
  fields: ParsedField[];
  indent: string;
}): string => {
  if (fields.length === 0) {
    return `${indent}throw new Error('${label} is not implemented');`;
  }

  const names = fields.map(field => field.name);
  const local = pickLocalName(fields, ['received', 'receivedFields', 'fieldNames']);
  const oneLine = `${indent}const ${local} = Object.keys({ ${names.join(', ')} }).join(', ');`;
  const received =
    oneLine.length <= MAX_LINE_LENGTH
      ? oneLine
      : `${indent}const ${local} = Object.keys({
${names.map(name => `${indent}  ${name},`).join('\n')}
${indent}}).join(', ');`;

  return `${received}

${indent}throw new Error(\`${label} is not implemented (received: \${${local}})\`);`;
};

/**
 * Errors a repository can throw by name. A handler maps one only when its
 * type file declares the code in typeResultError.
 */
const KNOWN_ERRORS = [
  { name: 'NotFoundError', code: 'NOT_FOUND', statusCode: 404, message: 'not found' },
  { name: 'DuplicateError', code: 'DUPLICATE_ENTRY', statusCode: 409, message: 'already exists' },
];

export const getMappedErrors = (errorCodes: string[] = []): typeof KNOWN_ERRORS =>
  KNOWN_ERRORS.filter(known => errorCodes.includes(known.code));

/**
 * Builds the complete handler file content shared by CRUD and custom operations
 */
export const buildHandlerContent = ({
  typesFile,
  functionName,
  logLabel,
  failureMessage,
  subject,
  fields,
  usedFields = fields,
  repositoryImportName,
  errorCodes,
}: {
  typesFile: string;
  functionName: string;
  logLabel: string;
  failureMessage: string;
  /** Human name of the module, used in error messages: "Post not found" */
  subject: string;
  fields: ParsedField[];
  /** Fields the body reads. The rest stay in the parameter type but are not destructured. */
  usedFields?: ParsedField[];
  /** Repository function to call. Without it the handler holds the logic itself. */
  repositoryImportName?: string;
  errorCodes?: string[];
}): string => {
  const usesRepository = repositoryImportName !== undefined;
  const destructured = usesRepository ? usedFields : fields;
  const parameterNames = [...destructured.map(field => field.name), 'requestId'];
  const fieldTypes = [buildFieldTypes(fields), '  requestId: string;'].filter(Boolean).join('\n');

  const repositoryImport = usesRepository
    ? `import ${repositoryImportName} from '../repository/${typesFile}';\n`
    : '';

  const businessLogic = usesRepository
    ? buildInvocation(repositoryImportName, usedFields)
    : `    // TODO: Implement the ${logLabel} logic here and return { data, error: null }
${buildNotImplemented({ label: `${logLabel} handler`, fields, indent: '    ' })}`;

  const mappedErrors = usesRepository
    ? getMappedErrors(errorCodes)
        .map(
          known => `    if (error instanceof Error && error.name === '${known.name}') {
      return {
        data: null,
        error: {
          code: '${known.code}',
          message: '${subject} ${known.message}',
          statusCode: ${known.statusCode},
          requestId,
        },
      };
    }

`
        )
        .join('')
    : '';

  return `${repositoryImport}import type { typeResult } from '../types/${typesFile}';

export default async function ${functionName}({
${parameterNames.map(name => `  ${name},`).join('\n')}
}: {
${fieldTypes}
}): Promise<typeResult> {
  try {
${businessLogic}
  } catch (error) {
${mappedErrors}    console.error(\`\${requestId} [HANDLER] - ${logLabel} error:\`, error);

    return {
      data: null,
      error: {
        code: 'INTERNAL_ERROR',
        message: '${failureMessage}',
        statusCode: 500,
        requestId,
      },
    };
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
  const isList = operation === 'list';

  // ID based operations cannot call the repository when typePayload has no ID field
  const canUseRepository = useRepositoryLayer && !(isIdOperation && idField === null);

  // get and delete only pass the ID to the repository
  const readsOnlyId = operation === 'get' || operation === 'delete';

  return buildHandlerContent({
    typesFile: `${operation}.${naming.file}`,
    functionName: isList ? `list${naming.class}sHandler` : `${operation}${naming.class}Handler`,
    logLabel: `${operation.toUpperCase()} ${naming.constant}`,
    failureMessage: `Failed to ${operation} ${naming.variable}${isList ? 's' : ''}`,
    subject: naming.class,
    fields,
    ...(readsOnlyId && { usedFields: fields.filter(f => f.name === idField) }),
    ...(canUseRepository && {
      repositoryImportName: operation === 'delete' ? 'remove' : operation,
    }),
    ...(parsedType.errorCodes && { errorCodes: parsedType.errorCodes }),
  });
};
