/**
 * CRUD operation templates
 */

import { getModuleNaming } from '../shared/utils/naming.utils';
import { DEFAULT_GENERATION_SETTINGS, GenerationSettings } from '../types/config.types';
import { SHARED_ERROR_TYPES } from './errors.templates';

/**
 * Gets the list of CRUD operation file names for a module
 */
export const getCrudFileNames = ({ moduleName }: { moduleName: string }): string[] => {
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
 * Name of the entity file: the one type file named after the module alone
 */
export const getEntityFileName = ({ moduleName }: { moduleName: string }): string =>
  `${getModuleNaming(moduleName).file}.ts`;

/**
 * Generates the entity file. It holds the module's main type once, so the
 * operation type files do not each repeat it.
 */
export const generateEntityFileContent = ({ moduleName }: { moduleName: string }): string => {
  const naming = getModuleNaming(moduleName);

  return `/**
 * The ${naming.variable} as the API returns it. create, get, update and list
 * build on this type, so a field added here reaches all of them.
 */
export type type${naming.class} = {
  ${naming.file}Id: string;
  // Add the ${naming.variable} fields you return
};
`;
};

const ERROR_STATUS: Record<string, number> = {
  VALIDATION_ERROR: 400,
  NOT_FOUND: 404,
  DUPLICATE_ENTRY: 409,
  INTERNAL_ERROR: 500,
};

/**
 * Builds typeResultError and typeResult, the end of every type file.
 * - With a handler context there is no requestId to return.
 * - Handlers that throw unexpected errors never return INTERNAL_ERROR.
 * The result is a union: it holds either data or an error, never both.
 */
type ResultTypeOptions = {
  codes: string[];
  settings: GenerationSettings;
  /** A type needs at least one code: keep INTERNAL_ERROR when it is the only one */
  keepInternalError?: boolean;
};

const MAX_LINE_LENGTH = 100;

const declaredCodes = ({
  codes,
  settings,
  keepInternalError = false,
}: ResultTypeOptions): string[] =>
  settings.errors === 'throw' && !keepInternalError
    ? codes.filter(code => code !== 'INTERNAL_ERROR')
    : codes;

const sharedTypeNames = (options: ResultTypeOptions): string[] =>
  declaredCodes(options).map(code => SHARED_ERROR_TYPES[code] ?? 'typeInternalError');

const RESULT_TYPE = `export type typeResult =
  | { data: typeResultData; error: null }
  | { data: null; error: typeResultError };
`;

/**
 * The imports that open a type file: the shared error types (with an errors
 * file) and the lines given, followed by a blank line. Nothing when there are none.
 */
export const buildTypeFileImports = ({
  lines = [],
  ...options
}: ResultTypeOptions & { lines?: string[] }): string => {
  const errorsFile = options.settings.errorsFile;
  const names = sharedTypeNames(options).sort();
  const oneLine = `import type { ${names.join(', ')} } from '${errorsFile?.importPath}';`;
  const errorsImport =
    oneLine.length <= MAX_LINE_LENGTH
      ? oneLine
      : `import type {\n${names.map(name => `  ${name},`).join('\n')}\n} from '${errorsFile?.importPath}';`;
  const all = [...(errorsFile ? [errorsImport] : []), ...lines];

  return all.length > 0 ? `${all.join('\n')}\n\n` : '';
};

export const buildResultTypes = (options: ResultTypeOptions): string => {
  const { settings } = options;
  const declared = declaredCodes(options);

  // With a shared errors file the error is a union of its types, edited one name at a time
  if (settings.errorsFile) {
    const names = sharedTypeNames(options);
    const oneLine = `export type typeResultError = ${names.join(' | ')};`;
    const alias =
      oneLine.length <= MAX_LINE_LENGTH
        ? oneLine
        : `export type typeResultError =\n${names.map(name => `  | ${name}`).join('\n')};`;

    return `${alias}\n\n${RESULT_TYPE}`;
  }

  const members = [
    `code: ${declared.map(code => `'${code}'`).join(' | ')};`,
    'message: string;',
    `statusCode: ${declared.map(code => ERROR_STATUS[code]).join(' | ')};`,
    ...(settings.context ? [] : ['requestId: string;']),
    ...(declared.includes('VALIDATION_ERROR') ? ['field?: string;'] : []),
  ];

  return `export type typeResultError = {
${members.map(member => `  ${member}`).join('\n')}
};

${RESULT_TYPE}`;
};

const entityImport = (capitalizedModule: string, moduleName: string): string =>
  `import type { type${capitalizedModule} } from './${moduleName}';`;

/**
 * Generates TypeScript file content for CRUD operations
 */
export const generateCrudFileContent = ({
  operation,
  moduleName,
  settings = DEFAULT_GENERATION_SETTINGS,
}: {
  operation: string;
  moduleName: string;
  settings?: GenerationSettings;
}): string => {
  const naming = getModuleNaming(moduleName);
  const capitalizedOperation = operation.charAt(0).toUpperCase() + operation.slice(1);

  // Generate operation-specific content
  switch (operation) {
    case 'create':
      return generateCreateContent(naming.class, capitalizedOperation, naming.file, settings);
    case 'get':
      return generateGetContent(naming.class, capitalizedOperation, naming.file, settings);
    case 'list':
      return generateListContent(naming.class, capitalizedOperation, naming.file, settings);
    case 'update':
      return generateUpdateContent(naming.class, capitalizedOperation, naming.file, settings);
    case 'delete':
      return generateDeleteContent(naming.class, capitalizedOperation, naming.file, settings);
    default:
      return generateGenericContent(
        naming.class,
        capitalizedOperation,
        operation,
        naming.file,
        settings
      );
  }
};

/**
 * Generates CREATE operation content
 */
const generateCreateContent = (
  capitalizedModule: string,
  _capitalizedOperation: string,
  moduleName: string,
  settings: GenerationSettings
): string => {
  const codes = ['VALIDATION_ERROR', 'DUPLICATE_ENTRY', 'INTERNAL_ERROR'];
  const imports = buildTypeFileImports({
    codes,
    settings,
    lines: [entityImport(capitalizedModule, moduleName)],
  });

  return `${imports}export type typePayload = {
  // Add the fields needed to create a ${moduleName}
};

export type typeResultData = type${capitalizedModule};

${buildResultTypes({ codes, settings })}`;
};

/**
 * Generates GET operation content
 */
const generateGetContent = (
  capitalizedModule: string,
  _capitalizedOperation: string,
  moduleName: string,
  settings: GenerationSettings
): string => {
  const codes = ['NOT_FOUND', 'INTERNAL_ERROR'];
  const imports = buildTypeFileImports({
    codes,
    settings,
    lines: [entityImport(capitalizedModule, moduleName)],
  });

  return `${imports}export type typePayload = {
  ${moduleName}Id: string; // ${capitalizedModule} ID to retrieve
};

export type typeResultData = type${capitalizedModule};

${buildResultTypes({ codes, settings })}`;
};

/**
 * Generates LIST operation content
 */
const generateListContent = (
  capitalizedModule: string,
  _capitalizedOperation: string,
  moduleName: string,
  settings: GenerationSettings
): string => {
  const codes = ['VALIDATION_ERROR', 'INTERNAL_ERROR'];
  const imports = buildTypeFileImports({
    codes,
    settings,
    lines: [entityImport(capitalizedModule, moduleName)],
  });

  return `${imports}export type typePayload = {
  page?: number;
  limit?: number;
  // Add the ${moduleName} filters and sorting here
};

export type typeResultData = {
  items: type${capitalizedModule}[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

${buildResultTypes({ codes, settings })}`;
};

/**
 * Generates UPDATE operation content
 */
const generateUpdateContent = (
  capitalizedModule: string,
  _capitalizedOperation: string,
  moduleName: string,
  settings: GenerationSettings
): string => {
  const codes = ['VALIDATION_ERROR', 'NOT_FOUND', 'DUPLICATE_ENTRY', 'INTERNAL_ERROR'];
  const imports = buildTypeFileImports({
    codes,
    settings,
    lines: [entityImport(capitalizedModule, moduleName)],
  });

  return `${imports}export type typePayload = {
  ${moduleName}Id: string;
  // Add the ${moduleName} fields that can be updated, each optional
};

export type typeResultData = type${capitalizedModule};

${buildResultTypes({ codes, settings })}`;
};

/**
 * Generates DELETE operation content
 */
const generateDeleteContent = (
  _capitalizedModule: string,
  _capitalizedOperation: string,
  moduleName: string,
  settings: GenerationSettings
): string => {
  const codes = ['NOT_FOUND', 'INTERNAL_ERROR'];

  return `${buildTypeFileImports({ codes, settings })}export type typePayload = {
  ${moduleName}Id: string;
};

export type typeResultData = {
  deletedAt: string;
};

${buildResultTypes({ codes, settings })}`;
};

/**
 * Generates generic operation content (fallback)
 */
const generateGenericContent = (
  _capitalizedModule: string,
  _capitalizedOperation: string,
  operation: string,
  moduleName: string,
  settings: GenerationSettings
): string => {
  const codes = ['VALIDATION_ERROR', 'NOT_FOUND', 'INTERNAL_ERROR'];

  return `${buildTypeFileImports({ codes, settings })}export type typePayload = {
  // Define payload for ${operation} ${moduleName}
};

export type typeResultData = {
  // Define result data for ${operation} ${moduleName}
};

${buildResultTypes({ codes, settings })}`;
};
