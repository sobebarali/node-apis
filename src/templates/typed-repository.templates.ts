import { ParsedField, ParsedTypePayload } from '../services/type-parser.service';
import { getModuleNaming } from '../shared/utils/naming.utils';
import {
  buildNotImplemented,
  buildSignature,
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
  parameterType = 'typePayload',
  errorCodes,
}: {
  typesFile: string;
  functionName: string;
  label: string;
  subject: string;
  fields: ParsedField[];
  /** Type of the object the repository takes. It comes from the type file where it can. */
  parameterType?: string;
  errorCodes?: string[] | undefined;
}): string => {
  const signature = buildSignature({
    start: `export default async function ${functionName}(`,
    names: fields.map(field => field.name),
    parameterType,
    end: '): Promise<typeResultData> {',
  });
  const usesPayloadType = fields.length > 0 && parameterType.includes('typePayload');
  const typeImports = usesPayloadType ? 'typePayload, typeResultData' : 'typeResultData';

  const errorHints = getMappedErrors(errorCodes)
    .map(
      known => `
  // To return ${known.code} (${known.statusCode}), throw an error named '${known.name}':
  //   throw Object.assign(new Error('${subject} ${known.message}'), { name: '${known.name}' });`
    )
    .join('');

  return `import type { ${typeImports} } from '../types/${typesFile}';

${signature}
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

  // get and delete only receive the ID. Without an ID in typePayload they take `<module>Id`.
  const readsOnlyId = operation === 'get' || operation === 'delete';
  const fallbackId = `${naming.variable}Id`;
  const idOnly = {
    fields: [{ name: idField ?? fallbackId, type: 'string', optional: false }],
    parameterType: idField ? `Pick<typePayload, '${idField}'>` : `{ ${fallbackId}: string }`,
  };

  return buildRepositoryContent({
    typesFile: `${operation}.${naming.file}`,
    functionName: operation === 'delete' ? 'remove' : operation,
    label: `${operation} ${naming.variable} repository`,
    subject: naming.class,
    ...(readsOnlyId ? idOnly : { fields: parsedType.fields }),
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
