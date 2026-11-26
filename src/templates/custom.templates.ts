/**
 * Custom API operation templates
 */
import { getModuleNaming } from '../shared/utils/naming.utils';
import { DEFAULT_GENERATION_SETTINGS, GenerationSettings } from '../types/config.types';
import { buildResultTypes, buildTypeFileImports } from './crud.templates';

/**
 * Gets custom API file names for a module
 */
export const getCustomFileNames = ({
  customNames,
  moduleName,
}: {
  customNames: string[];
  moduleName: string;
}): string[] => {
  const naming = getModuleNaming(moduleName);
  return customNames.map(customName => `${customName}.${naming.file}.ts`);
};

/**
 * Generates TypeScript file content for custom API operations
 */
export const generateCustomFileContent = ({
  customName,
  moduleName,
  settings = DEFAULT_GENERATION_SETTINGS,
}: {
  customName: string;
  moduleName: string;
  settings?: GenerationSettings;
}): string => {
  const codes = ['VALIDATION_ERROR', 'NOT_FOUND', 'INTERNAL_ERROR'];

  return `${buildTypeFileImports({ codes, settings })}export type typePayload = {
  // Define payload for ${customName} ${moduleName}
};

export type typeResultData = {
  // Define result data for ${customName} ${moduleName}
};

${buildResultTypes({ codes, settings })}`;
};
