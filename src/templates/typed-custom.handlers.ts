/**
 * Typed custom handler templates
 * Generates handlers with proper field destructuring based on parsed TypeScript types
 */
import { getModuleNaming } from '../shared/utils/naming.utils';
import { ParsedTypePayload } from '../services/type-parser.service';
import { buildHandlerContent } from './typed-crud.handlers';

export const getCustomHandlerFileNames = ({
  moduleName,
  customNames,
}: {
  moduleName: string;
  customNames: string[];
}): string[] => {
  const naming = getModuleNaming(moduleName);
  return customNames.map(name => `${name}.${naming.file}.ts`);
};

export const generateTypedCustomHandlerContent = ({
  customName,
  moduleName,
  parsedType,
  useRepositoryLayer = true,
}: {
  customName: string;
  moduleName: string;
  parsedType: ParsedTypePayload;
  useRepositoryLayer?: boolean;
}): string => {
  const naming = getModuleNaming(moduleName);

  return buildHandlerContent({
    typesFile: `${customName}.${naming.file}`,
    functionName: `${customName}${naming.class}Handler`,
    logLabel: `${customName.toUpperCase()} ${naming.constant}`,
    failureMessage: `Failed to execute ${customName} operation for ${naming.variable}`,
    subject: naming.class,
    fields: parsedType.fields,
    ...(useRepositoryLayer && { repositoryImportName: customName }),
    ...(parsedType.errorCodes && { errorCodes: parsedType.errorCodes }),
  });
};
