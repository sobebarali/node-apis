/**
 * Custom controller templates
 */

/**
 * Gets custom controller file names for a module
 */
export const getCustomControllerFileNames = ({ 
  customNames, 
  moduleName 
}: { 
  customNames: string[]; 
  moduleName: string; 
}): string[] => {
  return customNames.map(customName => `${customName}.${moduleName}.ts`);
};

/**
 * Generates TypeScript controller file content for custom operations
 */
export const generateCustomControllerContent = ({ 
  customName, 
  moduleName 
}: { 
  customName: string; 
  moduleName: string; 
}): string => {
  const capitalizedModule = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  const capitalizedCustom = customName.charAt(0).toUpperCase() + customName.slice(1);
  
  return generateGenericCustomControllerContent(customName, capitalizedModule, capitalizedCustom, moduleName);
};

/**
 * Generates generic custom controller content
 */
const generateGenericCustomControllerContent = (customName: string, capitalizedModule: string, _capitalizedCustom: string, moduleName: string): string => {
  return `import { Request, Response } from 'express';
import { validatePayload } from '../validators/${customName}.${moduleName}';
import { ${customName}${capitalizedModule} as ${customName}${capitalizedModule}Service } from '../services/${customName}.${moduleName}';

export const ${customName}${capitalizedModule} = async (req: Request, res: Response): Promise<void> => {
  // Validate request payload
  const validation = validatePayload(req.body);
  if (!validation.success) {
    res.status(400).json({
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: validation.error.message,
        statusCode: 400
      }
    });
    return;
  }

  // Call service layer
  const result = await ${customName}${capitalizedModule}Service(validation.data);

  // Return service result
  const statusCode = result.error ? result.error.statusCode || 500 : 200;
  res.status(statusCode).json(result);
};
`;
};
