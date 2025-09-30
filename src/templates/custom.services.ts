/**
 * Custom service templates
 */

/**
 * Gets custom service file names for a module
 */
export const getCustomServiceFileNames = ({
  customNames,
  moduleName,
}: {
  customNames: string[];
  moduleName: string;
}): string[] => {
  return customNames.map(customName => `${customName}.${moduleName}.ts`);
};

/**
 * Generates TypeScript service file content for custom operations
 */
export const generateCustomServiceContent = ({
  customName,
  moduleName,
}: {
  customName: string;
  moduleName: string;
}): string => {
  const capitalizedModule = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  const capitalizedCustom = customName.charAt(0).toUpperCase() + customName.slice(1);

  return generateGenericCustomServiceContent(
    customName,
    capitalizedModule,
    capitalizedCustom,
    moduleName
  );
};

/**
 * Generates generic custom service content
 */
const generateGenericCustomServiceContent = (
  customName: string,
  capitalizedModule: string,
  _capitalizedCustom: string,
  moduleName: string
): string => {
  return `import type { typeResult } from '../types/${customName}.${moduleName}';
import * as ${moduleName}Repository from '../repository/${moduleName}.repository';

export const ${customName}${capitalizedModule} = async ({
  // TODO: Add your specific fields here, e.g.:
  // id,
  // query,
  // filters,
  requestId,
}: {
  // Add your parameter types here
  requestId: string;
}): Promise<typeResult> => {
  try {
    // TODO: Add business logic here
    // Example: const result = await ${moduleName}Repository.${customName}({
    //   // Pass your specific fields here
    // });

    // Add your custom business logic
    // This might involve multiple repository calls, external API calls, etc.

    const result = {}; // Replace with actual implementation

    return { data: result, error: null };
  } catch (err) {
    const error = err as Error;
    // Handle specific error types
    if (error.name === 'NotFoundError') {
      return {
        data: null,
        error: {
          code: 'NOT_FOUND',
          message: \`${capitalizedModule} not found\`,
          statusCode: 404,
          requestId
        }
      };
    }

    if (error.name === 'ValidationError') {
      return {
        data: null,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
          statusCode: 400,
          requestId
        }
      };
    }

    return {
      data: null,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to ${customName} ${moduleName}',
        statusCode: 500,
        requestId
      }
    };
  }
};
`;
};
