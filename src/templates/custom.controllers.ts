/**
 * Custom controller templates
 */

/**
 * Gets custom controller file names for a module
 */
export const getCustomControllerFileNames = ({
  customNames,
  moduleName,
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
  moduleName,
  framework = 'express',
}: {
  customName: string;
  moduleName: string;
  framework?: string;
}): string => {
  const capitalizedModule = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  const capitalizedCustom = customName.charAt(0).toUpperCase() + customName.slice(1);

  return generateGenericCustomControllerContent(
    customName,
    capitalizedModule,
    capitalizedCustom,
    moduleName,
    framework
  );
};

/**
 * Generates generic custom controller content
 */
const generateGenericCustomControllerContent = (
  customName: string,
  capitalizedModule: string,
  _capitalizedCustom: string,
  moduleName: string,
  framework: string = 'express'
): string => {
  if (framework === 'hono') {
    return `import type { Context } from 'hono';
import { validatePayload } from '../validators/${customName}.${moduleName}';
import { ${customName}${capitalizedModule} as ${customName}${capitalizedModule}Service } from '../services/${customName}.${moduleName}';
import { randomBytes } from 'crypto';

export const ${customName}${capitalizedModule} = async (c: Context): Promise<Response> => {
  const requestId = randomBytes(16).toString('hex');
  
  try {
    const body = await c.req.json();

    // Validate request payload
    const validation = validatePayload(body);
    if (!validation.success) {
      return c.json({
        data: null,
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.error.message,
          statusCode: 400,
          requestId
        }
      }, 400);
    }

    // Call service layer with requestId
    const result = await ${customName}${capitalizedModule}Service({ ...validation.data, requestId });

    // Return service result
    const statusCode = result.error ? result.error.statusCode || 500 : 200;
    return c.json(result, statusCode);
  } catch (error) {
    return c.json({
      data: null,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to process request',
        statusCode: 500,
        requestId
      }
    }, 500);
  }
};
`;
  }

  return `import type { Request, Response } from 'express';
import { validatePayload } from '../validators/${customName}.${moduleName}';
import { ${customName}${capitalizedModule} as ${customName}${capitalizedModule}Service } from '../services/${customName}.${moduleName}';
import { randomBytes } from 'crypto';

export const ${customName}${capitalizedModule} = async (req: Request, res: Response): Promise<void> => {
  const requestId = randomBytes(16).toString('hex');
  
  try {
    // Validate request payload
    const validation = validatePayload(req.body);
    if (!validation.success) {
      res.status(400).json({
        data: null,
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.error.message,
          statusCode: 400,
          requestId
        }
      });
      return;
    }

    // Call service layer with requestId
    const result = await ${customName}${capitalizedModule}Service({ ...validation.data, requestId });

    // Return service result
    const statusCode = result.error ? result.error.statusCode || 500 : 200;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({
      data: null,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to process request',
        statusCode: 500,
        requestId
      }
    });
  }
};
`;
};
