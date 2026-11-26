import { ParsedField, ParsedTypePayload } from '../services/type-parser.service';
import { DEFAULT_GENERATION_SETTINGS, GenerationSettings } from '../types/config.types';

import { getModuleNaming, pluralize } from '../shared/utils/naming.utils';

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

const MAX_LINE_LENGTH = 100;

/** Picks the first candidate that no payload field is already named */
const pickLocalName = (fields: ParsedField[], candidates: string[]): string =>
  candidates.find(candidate => fields.every(field => field.name !== candidate)) ??
  `${candidates[0]}Value`;

/**
 * Builds a function signature with one destructured object parameter. It stays
 * on one line when it fits, the way a formatter would write it.
 */
export const buildSignature = ({
  start,
  names,
  parameterType,
  end,
  keepParameter = false,
}: {
  /** Everything before the parameter: `export default async function create(` */
  start: string;
  names: string[];
  parameterType: string;
  /** Everything after the parameter type: `): Promise<typeResult> {` */
  end: string;
  /** Keeps the parameter when the body reads none of it, so callers can still pass it */
  keepParameter?: boolean;
}): string => {
  if (names.length === 0) {
    if (!keepParameter) {
      return `${start}${end}`;
    }

    const oneLine = `${start}_input: ${parameterType}${end}`;

    return oneLine.length <= MAX_LINE_LENGTH
      ? oneLine
      : `${start}\n  _input: ${parameterType}\n${end}`;
  }

  const oneLine = `${start}{ ${names.join(', ')} }: ${parameterType}${end}`;

  return oneLine.length <= MAX_LINE_LENGTH
    ? oneLine
    : `${start}{\n${names.map(name => `  ${name},`).join('\n')}\n}: ${parameterType}${end}`;
};

/**
 * Builds the repository call and the success return. The call stays on one line
 * when it fits. A payload without fields calls the function without arguments.
 */
export const buildInvocation = (
  functionName: string,
  fields: ParsedField[],
  indent: string
): string => {
  if (fields.length === 0) {
    return `${indent}const data = await ${functionName}();

${indent}return { data, error: null };`;
  }

  const local = pickLocalName(fields, ['data', 'result', 'output']);
  const returned = local === 'data' ? 'data' : `data: ${local}`;
  const names = fields.map(field => field.name);
  const oneLine = `${indent}const ${local} = await ${functionName}({ ${names.join(', ')} });`;

  const call =
    oneLine.length <= MAX_LINE_LENGTH
      ? oneLine
      : `${indent}const ${local} = await ${functionName}({
${names.map(name => `${indent}  ${name},`).join('\n')}
${indent}});`;

  return `${call}

${indent}return { ${returned}, error: null };`;
};

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
  {
    name: 'ConflictError',
    code: 'CONFLICT',
    statusCode: 409,
    message: 'is in a conflicting state',
  },
  { name: 'ForbiddenError', code: 'FORBIDDEN', statusCode: 403, message: 'access is forbidden' },
  { name: 'BadRequestError', code: 'BAD_REQUEST', statusCode: 400, message: 'request is invalid' },
];

export const getMappedErrors = (errorCodes: string[] = []): typeof KNOWN_ERRORS =>
  KNOWN_ERRORS.filter(known => errorCodes.includes(known.code));

/** The object a handler or service receives next to the payload fields */
const extraParameter = (settings: GenerationSettings): { name: string; type: string } =>
  settings.context
    ? { name: 'context', type: `{ context: ${settings.context.type} }` }
    : { name: 'requestId', type: '{ requestId: string }' };

/**
 * Builds the signature of a handler or service: the payload fields the body
 * reads, plus `requestId` (or the configured `context`) when the body reads it.
 */
export const buildEntrySignature = ({
  start,
  end,
  names,
  hasPayload,
  payloadType = 'typePayload',
  readsExtra,
  settings,
}: {
  start: string;
  end: string;
  names: string[];
  hasPayload: boolean;
  payloadType?: string;
  /** True when the body reads requestId. The context is never read by generated code. */
  readsExtra: boolean;
  settings: GenerationSettings;
}): string => {
  const extra = extraParameter(settings);
  const payloadNames = names.filter(name => name !== extra.name);

  // The parameter type comes from the type file, so the code cannot drift from it
  return buildSignature({
    start,
    names: readsExtra ? [...payloadNames, extra.name] : payloadNames,
    parameterType: hasPayload ? `${payloadType} & ${extra.type}` : extra.type,
    end,
    keepParameter: true,
  });
};

/** The payload type a function takes: an optional payload is never undefined once it is spread */
export const payloadTypeName = (parsedType: ParsedTypePayload): string =>
  parsedType.isOptional ? 'NonNullable<typePayload>' : 'typePayload';

/** The import of the shared Refusal class, or nothing */
export const buildRefusalImport = (settings: GenerationSettings): string =>
  settings.errorsFile ? `import { Refusal } from '${settings.errorsFile.importPath}';\n` : '';

/** The names a handler or service imports from its type file */
export const buildTypeImportNames = ({
  hasPayload,
  settings,
}: {
  hasPayload: boolean;
  settings: GenerationSettings;
}): string =>
  [
    ...(hasPayload ? ['typePayload'] : []),
    'typeResult',
    ...(settings.errorsFile ? ['typeResultError'] : []),
  ].join(', ');

/** The import of the configured context type, or nothing */
export const buildContextImport = (settings: GenerationSettings): string =>
  settings.context
    ? `import type { ${settings.context.type} } from '${settings.context.importPath}';\n`
    : '';

/**
 * Builds the body of a handler or service around its logic.
 * - 'catch': every error is caught; unknown ones are logged and returned as INTERNAL_ERROR
 * - 'throw': only the errors the type file declares are returned, the rest are thrown
 * With a shared errors file, a thrown Refusal is returned as the error in both modes.
 */
export const buildGuardedBody = ({
  layer,
  logLabel,
  failureMessage,
  subject,
  buildLogic,
  mappedErrors = [],
  parsedType,
  settings,
}: {
  /** Tag in the log line: HANDLER or SERVICE */
  layer: string;
  logLabel: string;
  failureMessage: string;
  subject: string;
  /** Writes the logic at the given indentation */
  buildLogic: (indent: string) => string;
  mappedErrors?: typeof KNOWN_ERRORS;
  parsedType: ParsedTypePayload;
  settings: GenerationSettings;
}): { body: string; readsRequestId: boolean } => {
  const catchesAll = settings.errors === 'catch';
  const hasRequestId = settings.context === undefined;
  const returnsStatusCode = parsedType.errorHasStatusCode !== false;
  const usesRefusal = settings.errorsFile !== undefined;
  // The shared error types carry no requestId: it is written only where the type declares it
  const returnsRequestId =
    hasRequestId &&
    (usesRefusal ? parsedType.errorHasRequestId === true : parsedType.errorHasRequestId !== false);

  if (!catchesAll && mappedErrors.length === 0 && !usesRefusal) {
    return { body: buildLogic('  '), readsRequestId: false };
  }

  const errorReturn = (indent: string, code: string, message: string, statusCode: number): string =>
    [
      `${indent}return {`,
      `${indent}  data: null,`,
      `${indent}  error: {`,
      `${indent}    code: '${code}',`,
      `${indent}    message: '${message}',`,
      ...(returnsStatusCode ? [`${indent}    statusCode: ${statusCode},`] : []),
      ...(returnsRequestId ? [`${indent}    requestId,`] : []),
      `${indent}  },`,
      `${indent}};`,
    ].join('\n');

  const refusedError = returnsRequestId ? '{ ...error.error, requestId }' : 'error.error';
  const refused = usesRefusal
    ? `    if (error instanceof Refusal) {
      return { data: null, error: ${refusedError} as typeResultError };
    }

`
    : '';

  const mapped = mappedErrors
    .map(
      known => `    if (error instanceof Error && error.name === '${known.name}') {
${errorReturn('      ', known.code, `${subject} ${known.message}`, known.statusCode)}
    }

`
    )
    .join('');

  const logLine = hasRequestId
    ? `    console.error(\`\${requestId} [${layer}] - ${logLabel} error:\`, error);`
    : `    console.error('[${layer}] - ${logLabel} error:', error);`;

  const fallback = catchesAll
    ? `${logLine}

${errorReturn('    ', 'INTERNAL_ERROR', failureMessage, 500)}`
    : '    throw error;';

  return {
    body: `  try {
${buildLogic('    ')}
  } catch (error) {
${refused}${mapped}${fallback}
  }`,
    readsRequestId: hasRequestId && (catchesAll || returnsRequestId),
  };
};

/**
 * Builds the complete handler file content shared by CRUD and custom operations
 */
export const buildHandlerContent = ({
  typesFile,
  functionName,
  logLabel,
  failureMessage,
  subject,
  parsedType,
  usedFields = parsedType.fields,
  repositoryImportName,
  settings = DEFAULT_GENERATION_SETTINGS,
}: {
  typesFile: string;
  functionName: string;
  logLabel: string;
  failureMessage: string;
  /** Human name of the module, used in error messages: "Post not found" */
  subject: string;
  parsedType: ParsedTypePayload;
  /** Fields the body reads. The rest stay in the parameter type but are not destructured. */
  usedFields?: ParsedField[];
  /** Repository function to call. Without it the handler holds the logic itself. */
  repositoryImportName?: string;
  settings?: GenerationSettings;
}): string => {
  const { fields } = parsedType;
  const hasPayload = fields.length > 0;

  const { body, readsRequestId } = buildGuardedBody({
    layer: 'HANDLER',
    logLabel,
    failureMessage,
    subject,
    buildLogic: indent =>
      repositoryImportName === undefined
        ? `${indent}// TODO: Implement the ${logLabel} logic here and return { data, error: null }
${buildNotImplemented({ label: `${logLabel} handler`, fields, indent })}`
        : buildInvocation(repositoryImportName, usedFields, indent),
    ...(repositoryImportName !== undefined && {
      mappedErrors: getMappedErrors(parsedType.errorCodes),
    }),
    parsedType,
    settings,
  });

  const signature = buildEntrySignature({
    start: `export default async function ${functionName}(`,
    end: '): Promise<typeResult> {',
    names: (repositoryImportName === undefined ? fields : usedFields).map(field => field.name),
    hasPayload,
    payloadType: payloadTypeName(parsedType),
    readsExtra: readsRequestId,
    settings,
  });

  const repositoryImport =
    repositoryImportName === undefined
      ? ''
      : `import ${repositoryImportName} from '../repository/${typesFile}';\n`;
  const typeImports = buildTypeImportNames({ hasPayload, settings });

  return `${repositoryImport}${buildRefusalImport(settings)}${buildContextImport(settings)}import type { ${typeImports} } from '../types/${typesFile}';

${signature}
${body}
}
`;
};

export const generateCrudHandlerContent = ({
  operation,
  moduleName,
  parsedType,
  useRepositoryLayer = true,
  settings = DEFAULT_GENERATION_SETTINGS,
}: {
  operation: string;
  moduleName: string;
  parsedType: ParsedTypePayload;
  useRepositoryLayer?: boolean;
  settings?: GenerationSettings;
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
    functionName: `${operation}${isList ? pluralize(naming.class) : naming.class}Handler`,
    logLabel: `${operation.toUpperCase()} ${naming.constant}`,
    failureMessage: `Failed to ${operation} ${isList ? pluralize(naming.variable) : naming.variable}`,
    subject: naming.class,
    parsedType,
    ...(readsOnlyId && { usedFields: fields.filter(f => f.name === idField) }),
    ...(canUseRepository && {
      repositoryImportName: operation === 'delete' ? 'remove' : operation,
    }),
    settings,
  });
};
