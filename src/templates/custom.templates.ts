/**
 * Custom API operation templates
 */

/**
 * Gets custom API file names for a module
 */
export const getCustomFileNames = ({ 
  customNames, 
  moduleName 
}: { 
  customNames: string[]; 
  moduleName: string; 
}): string[] => {
  return customNames.map(customName => `${customName}.${moduleName}.ts`);
};

/**
 * Generates TypeScript file content for custom API operations
 */
export const generateCustomFileContent = ({
  customName,
  moduleName
}: {
  customName: string;
  moduleName: string;
}): string => {
  const capitalizedModule = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  const capitalizedCustom = customName.charAt(0).toUpperCase() + customName.slice(1);

  // Generate operation-specific content based on common patterns
  return generateCustomOperationContent(customName, capitalizedModule, capitalizedCustom, moduleName);
};

/**
 * Generates custom operation content - completely generic
 */
const generateCustomOperationContent = (
  customName: string,
  capitalizedModule: string,
  capitalizedCustom: string,
  moduleName: string
): string => {
  return generateGenericCustomContent(customName, capitalizedModule, capitalizedCustom, moduleName);
};

/**
 * Generates generic custom operation content
 */
const generateGenericCustomContent = (customName: string, _capitalizedModule: string, _capitalizedCustom: string, moduleName: string): string => {
  return `export type typePayload = {
  // Define payload for ${customName} ${moduleName}
  id?: string;
};

export type typeResultData = {
  // Define result data for ${customName} ${moduleName}
};

export type typeResultError = {
  code: 'VALIDATION_ERROR' | 'NOT_FOUND' | 'UNAUTHORIZED' | 'INTERNAL_ERROR';
  message: string;
  statusCode: 400 | 404 | 401 | 500;
  field?: string;
};

export type typeResult = {
  data: null | typeResultData;
  error: null | typeResultError;
};
`;
};
