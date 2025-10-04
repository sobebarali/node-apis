/**
 * Typed custom handler templates
 * Generates handlers with proper field destructuring based on parsed TypeScript types
 */
import { getModuleNaming, ModuleNaming } from '../shared/utils/naming.utils';
import { ParsedTypePayload, generateFieldDestructuring } from '../services/type-parser.service';

export const generateTypedCustomHandlerContent = ({
  customName,
  moduleName,
  parsedType,
}: {
  customName: string;
  moduleName: string;
  parsedType: ParsedTypePayload;
}): string => {
  const naming = getModuleNaming(moduleName);
  return generateGenericTypedCustomHandlerContent(customName, naming, parsedType);
};

/**
 * Generates generic typed custom handler content
 */
const generateGenericTypedCustomHandlerContent = (
  customName: string,
  naming: ModuleNaming,
  parsedType: ParsedTypePayload
): string => {
  const fieldDestructuring = generateFieldDestructuring(parsedType.fields);
  const fieldTypes = parsedType.fields.length > 0
    ? parsedType.fields.map(field => `  ${field.name}${field.optional ? '?' : ''}: ${field.type};`).join('\n')
    : '  // No fields defined in typePayload';

  return `import { TRPC_ERROR_CODES, ERROR_MESSAGES, ERROR_NAMES } from "~/server/api/constants/errors";
import { createScopedLogger } from "~/server/api/utils/logger";
import ${customName} from "../repository/${customName}.${naming.file}";
import type { typeResult, typeResultData, typeResultError } from "../types/${customName}.${naming.file}";

export default async function ${customName}${naming.class}Handler({
  ${fieldDestructuring},
  requestId,
}: {
${fieldTypes}
  requestId: string;
}): Promise<typeResult> {
  const log = createScopedLogger({ requestId, feature: "${naming.constant}" });
  let data: typeResultData | null = null;
  let error: typeResultError | null = null;

  try {
    const startTime = Date.now();
    log.info({ ${parsedType.fields.length > 0 ? parsedType.fields.map(f => f.name).join(', ') : ''} }, "${customName.toUpperCase()} handler started");

    // Business logic here - call repository function
    const result = await ${customName}({
      ${parsedType.fields.map(field => field.name).join(',\n      ')}
    });

    data = result;

    const duration = Date.now() - startTime;
    log.info(
      {
        duration: \`\${duration}ms\`,
      },
      "${customName.toUpperCase()} handler completed successfully",
    );
  } catch (err) {
    const customError = err as Error;
    log.error(
      {
        error: customError.message,
        stack: customError.stack,
      },
      "${customName.toUpperCase()} handler error",
    );

    // Handle specific error types using ERROR_NAMES
    if (customError.name === ERROR_NAMES.NOT_FOUND) {
      error = {
        code: TRPC_ERROR_CODES.NOT_FOUND,
        message: ERROR_MESSAGES.NOT_FOUND,
        statusCode: 404,
        requestId,
      };
    } else if (customError.name === ERROR_NAMES.VALIDATION) {
      error = {
        code: TRPC_ERROR_CODES.BAD_REQUEST,
        message: customError.message,
        statusCode: 400,
        requestId,
      };
    } else {
      error = {
        code: TRPC_ERROR_CODES.INTERNAL_SERVER_ERROR,
        message: ERROR_MESSAGES.INTERNAL_ERROR,
        statusCode: 500,
        requestId,
      };
    }
  }

  return { data, error };
}
`;
};
