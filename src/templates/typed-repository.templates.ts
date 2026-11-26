import { ParsedField, ParsedTypePayload } from '../services/type-parser.service';
import { getModuleNaming } from '../shared/utils/naming.utils';
import { DEFAULT_GENERATION_SETTINGS, GenerationSettings } from '../types/config.types';
import {
  buildNotImplemented,
  buildSignature,
  findIdField,
  getMappedErrors,
  payloadTypeName,
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
  settings,
}: {
  typesFile: string;
  functionName: string;
  label: string;
  subject: string;
  fields: ParsedField[];
  /** Type of the object the repository takes. It comes from the type file where it can. */
  parameterType?: string;
  errorCodes?: string[] | undefined;
  settings: GenerationSettings;
}): string => {
  const signature = buildSignature({
    start: `export default async function ${functionName}(`,
    names: fields.map(field => field.name),
    parameterType,
    end: '): Promise<typeResultData> {',
  });
  const usesPayloadType = fields.length > 0 && parameterType.includes('typePayload');
  const typeImports = usesPayloadType ? 'typePayload, typeResultData' : 'typeResultData';

  // With a shared errors file there is one way to return an error: throw a Refusal
  const errorHints = settings.errorsFile
    ? `
  // To return an error, throw a Refusal (from '${settings.errorsFile.importPath}'):
  //   throw new Refusal({ code: 'NOT_FOUND', message: '${subject} not found', statusCode: 404 });`
    : getMappedErrors(errorCodes)
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
  settings = DEFAULT_GENERATION_SETTINGS,
}: {
  operation: string;
  moduleName: string;
  parsedType: ParsedTypePayload;
  settings?: GenerationSettings;
}): string => {
  const naming = getModuleNaming(moduleName);
  const idField = findIdField(parsedType, naming.variable);

  // get and delete only receive the ID. Without an ID in typePayload they take `<module>Id`.
  const readsOnlyId = operation === 'get' || operation === 'delete';
  const fallbackId = `${naming.variable}Id`;
  const payloadType = payloadTypeName(parsedType);
  const idOnly = {
    fields: [{ name: idField ?? fallbackId, type: 'string', optional: false }],
    parameterType: idField ? `Pick<${payloadType}, '${idField}'>` : `{ ${fallbackId}: string }`,
  };

  return buildRepositoryContent({
    typesFile: `${operation}.${naming.file}`,
    functionName: operation === 'delete' ? 'remove' : operation,
    label: `${operation} ${naming.variable} repository`,
    subject: naming.class,
    ...(readsOnlyId ? idOnly : { fields: parsedType.fields, parameterType: payloadType }),
    errorCodes: parsedType.errorCodes,
    settings,
  });
};

/**
 * Generate individual custom repository file content
 */
export const generateCustomRepositoryContent = ({
  customName,
  moduleName,
  parsedType,
  settings = DEFAULT_GENERATION_SETTINGS,
}: {
  customName: string;
  moduleName: string;
  parsedType: ParsedTypePayload;
  settings?: GenerationSettings;
}): string => {
  const naming = getModuleNaming(moduleName);

  return buildRepositoryContent({
    typesFile: `${customName}.${naming.file}`,
    functionName: customName,
    label: `${customName} ${naming.variable} repository`,
    subject: naming.class,
    fields: parsedType.fields,
    parameterType: payloadTypeName(parsedType),
    errorCodes: parsedType.errorCodes,
    settings,
  });
};
