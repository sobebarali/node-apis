/**
 * Typed custom service templates - generates custom services with actual field names from parsed types
 */

import { ParsedTypePayload, generateFieldDestructuring } from '../services/type-parser.service';

/**
 * Generates TypeScript service file content for custom operations with parsed types
 */
export const generateTypedCustomServiceContent = ({
  customName,
  moduleName,
  parsedType,
}: {
  customName: string;
  moduleName: string;
  parsedType: ParsedTypePayload;
}): string => {
  const capitalizedModule = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  const capitalizedCustom = customName.charAt(0).toUpperCase() + customName.slice(1);

  return generateTypedGenericCustomServiceContent(
    customName,
    capitalizedModule,
    capitalizedCustom,
    moduleName,
    parsedType
  );
};

/**
 * Generates generic custom service content with parsed types
 */
const generateTypedGenericCustomServiceContent = (
  customName: string,
  capitalizedModule: string,
  _capitalizedCustom: string,
  moduleName: string,
  parsedType: ParsedTypePayload
): string => {
  const fieldDestructuring = generateFieldDestructuring(parsedType.fields);

  return `import { typePayload, typeResult } from '../types/${customName}.${moduleName}';
import * as ${moduleName}Repository from '../repository/${moduleName}.repository';

export const ${customName}${capitalizedModule} = async ({
${fieldDestructuring}
}: typePayload): Promise<typeResult> => {
  try {
    // TODO: Add business logic here
    // Example: const result = await ${moduleName}Repository.${customName}({
    //   ${parsedType.fields.map(f => f.name).join(',\n    //   ')}
    // });

    // Add your custom business logic
    // This might involve multiple repository calls, external API calls, etc.

    const result = {}; // Replace with actual implementation

    return { data: result, error: null };
  } catch (error) {
    // Handle specific error types
    if (error instanceof Error && error.name === 'NotFoundError') {
      return {
        data: null,
        error: {
          code: 'NOT_FOUND',
          message: \`${capitalizedModule} not found\`,
          statusCode: 404
        }
      };
    }

    if (error instanceof Error && error.name === 'ValidationError') {
      return {
        data: null,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
          statusCode: 400
        }
      };
    }

    return {
      data: null,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Failed to ${customName} ${moduleName}',
        statusCode: 500
      }
    };
  }
};
`;
};
