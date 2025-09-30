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

  return `import type { typeResult, typeResultData, typeResultError } from '../types/${customName}.${naming.file}';
import { ${customName} } from '../repository/${naming.directory}.repository';

export default async function ${customName}${naming.class}Handler({
  ${fieldDestructuring},
  requestId,
}: {
${fieldTypes}
  requestId: string;
}): Promise<typeResult> {
  let data: typeResultData | null = null;
  let error: typeResultError | null = null;

  try {
    const startTime = Date.now();
    console.info(\`\${requestId} [${naming.constant}] - ${customName.toUpperCase()} handler started\`);

    // Business logic here - call repository function
    const result = await ${customName}({
      ${parsedType.fields.map(field => field.name).join(',\n      ')}
    });

    data = result;

    const duration = Date.now() - startTime;
    console.info(\`\${requestId} [${naming.constant}] - ${customName.toUpperCase()} handler completed successfully in \${duration}ms\`);
  } catch (err) {
    const customError = err as Error;
    console.error(
      \`\${requestId} [${naming.constant}] - ${customName.toUpperCase()} handler error: \${customError.message}\`
    );

    if (customError.name === 'NotFoundError') {
      error = {
        code: 'NOT_FOUND',
        message: \`${naming.class} not found\`,
        statusCode: 404,
        requestId,
      };
    } else if (customError.name === 'ValidationError') {
      error = {
        code: 'VALIDATION_ERROR',
        message: customError.message,
        statusCode: 400,
        requestId,
      };
    } else {
      error = {
        code: (customError as any).errorCode ?? 'INTERNAL_ERROR',
        message: customError.message ?? 'An unexpected error occurred',
        statusCode: (customError as any).statusCode ?? 500,
        requestId,
      };
    }
  }

  return { data, error };
}
`;
};
