import { ParsedField, ParsedTypePayload } from '../services/type-parser.service';
import { getModuleNaming } from '../shared/utils/naming.utils';
import {
  buildFieldTypes,
  buildNotImplemented,
  findIdField,
  getMappedErrors,
} from './typed-crud.handlers';

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

/**
 * Builds a repository file. Every repository takes one object and is generated
 * as a stub that throws until the real data access is written, so made-up data
 * can never reach a caller.
 */
const buildRepositoryContent = ({
  typesFile,
  functionName,
  label,
  subject,
  fields,
  errorCodes,
}: {
  typesFile: string;
  functionName: string;
  label: string;
  subject: string;
  fields: ParsedField[];
  errorCodes?: string[] | undefined;
}): string => {
  const parameter =
    fields.length > 0
      ? `{
${fields.map(field => `  ${field.name},`).join('\n')}
}: {
${buildFieldTypes(fields)}
}`
      : '';

  const errorHints = getMappedErrors(errorCodes)
    .map(
      known => `
  // To return ${known.code} (${known.statusCode}), throw an error named '${known.name}':
  //   throw Object.assign(new Error('${subject} ${known.message}'), { name: '${known.name}' });`
    )
    .join('');

  return `import type { typeResultData } from '../types/${typesFile}';

export default async function ${functionName}(${parameter}): Promise<typeResultData> {
  // TODO: Replace with your data access and return typeResultData.${errorHints}
${buildNotImplemented({ label, fields, indent: '  ' })}
}
`;
};

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
  const idField = findIdField(parsedType, naming.variable);

  // get and delete only receive the ID
  const readsOnlyId = operation === 'get' || operation === 'delete';
  const idFields = parsedType.fields.filter(field => field.name === idField);
  const fallbackIdFields = [{ name: `${naming.variable}Id`, type: 'string', optional: false }];
  const onlyId = idFields.length > 0 ? idFields : fallbackIdFields;
  const fields = readsOnlyId ? onlyId : parsedType.fields;

  return buildRepositoryContent({
    typesFile: `${operation}.${naming.file}`,
    functionName: operation === 'delete' ? 'remove' : operation,
    label: `${operation} ${naming.variable} repository`,
    subject: naming.class,
    fields,
    errorCodes: parsedType.errorCodes,
  });
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

  return buildRepositoryContent({
    typesFile: `${customName}.${naming.file}`,
    functionName: customName,
    label: `${customName} ${naming.variable} repository`,
    subject: naming.class,
    fields: parsedType.fields,
    errorCodes: parsedType.errorCodes,
  });
};
