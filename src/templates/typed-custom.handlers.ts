/**
 * Typed custom handler templates
 * Generates handlers with proper field destructuring based on parsed TypeScript types
 */
import { getModuleNaming } from '../shared/utils/naming.utils';
import { ParsedTypePayload } from '../services/type-parser.service';
import { buildHandlerContent } from './typed-crud.handlers';
import { DEFAULT_GENERATION_SETTINGS, GenerationSettings } from '../types/config.types';

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
  settings = DEFAULT_GENERATION_SETTINGS,
}: {
  customName: string;
  moduleName: string;
  parsedType: ParsedTypePayload;
  useRepositoryLayer?: boolean;
  settings?: GenerationSettings;
}): string => {
  const naming = getModuleNaming(moduleName);

  return buildHandlerContent({
    typesFile: `${customName}.${naming.file}`,
    functionName: `${customName}${naming.class}Handler`,
    logLabel: `${customName.toUpperCase()} ${naming.constant}`,
    failureMessage: `Failed to execute ${customName} operation for ${naming.variable}`,
    subject: naming.class,
    parsedType,
    ...(useRepositoryLayer && { repositoryImportName: customName }),
    settings,
  });
};
