/**
 * Hono Custom controller templates
 */

import { getModuleNaming, ModuleNaming } from '../../shared/naming.utils';

export const getCustomControllerFileNames = ({ moduleName, customNames }: { moduleName: string; customNames: string[] }): string[] => {
  const naming = getModuleNaming(moduleName);
  return customNames.map(name => `${name}.${naming.file}.ts`);
};

export const getCustomValidatorFileNames = ({ moduleName, customNames }: { moduleName: string; customNames: string[] }): string[] => {
  const naming = getModuleNaming(moduleName);
  return customNames.map(name => `${name}.${naming.file}.ts`);
};

export const generateCustomControllerContent = ({
  operation,
  moduleName,
}: {
  operation: string;
  moduleName: string;
}): string => {
  const naming = getModuleNaming(moduleName);
  const capitalizedOperation = operation.charAt(0).toUpperCase() + operation.slice(1);

  return generateGenericControllerContent(naming, capitalizedOperation, operation);
};

/**
 * Generates generic controller content for custom operations
 */
const generateGenericControllerContent = (
  naming: ModuleNaming,
  _capitalizedOperation: string,
  operation: string,
): string => {
  return `import type { Context } from 'hono';
import { typeResult } from '../types/${operation}.${naming.file}';
import { validatePayload } from '../validators/${operation}.${naming.file}';
import { randomBytes } from 'crypto';
import ${operation}${naming.class}Handler from '../handlers/${operation}.${naming.file}';

export const ${operation}${naming.class} = async (c: Context): Promise<Response> => {
  const requestId = randomBytes(16).toString('hex');

  try {
    const body = await c.req.json();
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

    const payload = validation.data;

    // Call handler with requestId
    const result = await ${operation}${naming.class}Handler({ ...payload, requestId });

    const statusCode = result.error ? result.error.statusCode || 500 : 200;
    return c.json(result, statusCode);
  } catch (error) {
    return c.json({
      data: null,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Something went wrong',
        statusCode: 500,
        requestId
      }
    }, 500);
  }
};
`;
};