import { getModuleNaming, ModuleNaming } from '../../shared/naming.utils';
import { ParsedTypePayload } from '../../../services/type-parser.service';

export const getCustomHandlerFileNames = ({ moduleName, customNames }: { moduleName: string; customNames: string[] }): string[] => {
  const naming = getModuleNaming(moduleName);
  return customNames.map(name => `${name}.${naming.file}.ts`);
};

export const generateTypedCustomHandlerContent = ({
  customName,  // Using the same parameter name as the original for consistency
  moduleName,
  parsedType,
}: {
  customName: string;
  moduleName: string;
  parsedType: ParsedTypePayload;
}): string => {
  const naming = getModuleNaming(moduleName);

  return generateGenericHandlerContent(naming, customName, parsedType);
};

/**
 * Generates generic handler content for custom operations
 */
const generateGenericHandlerContent = (
  naming: ModuleNaming,
  operation: string,
  parsedType: ParsedTypePayload,
): string => {
  // Build field type definitions
  const fieldTypes = parsedType.fields.length > 0
    ? parsedType.fields.map(field => `  ${field.name}${field.optional ? '?' : ''}: ${field.type};`).join('\n') + '\n  requestId: string;'
    : '  requestId: string;';

  // Build the payload object for the repository call
  const payloadObject = parsedType.fields.length > 0
    ? `{ ${parsedType.fields.map(field =>
        field.optional
          ? `...(${field.name} !== undefined && { ${field.name} })`
          : field.name
      ).join(', ')} }`
    : '{}';

  return `import ${operation} from "../repository/${operation}.${naming.file}";
import type { typeResult } from "../types/${operation}.${naming.file}";

export default async function ${operation}${naming.class}Handler({
  ${parsedType.fields.length > 0 ? parsedType.fields.map(f => f.name).join(',\n  ') + ',' : ''}
  requestId,
}: {
${fieldTypes}
}): Promise<typeResult> {
  try {
    console.info(\`\${requestId} [HANDLER] - ${operation.toUpperCase()} ${naming.constant} started\`);

    // Business logic here - call repository function
    const result = await ${operation}(${payloadObject});

    console.info(\`\${requestId} [HANDLER] - ${operation.toUpperCase()} ${naming.constant} completed successfully\`);

    return result;
  } catch (error) {
    console.error(\`\${requestId} [HANDLER] - ${operation.toUpperCase()} ${naming.constant} error:\`, error);

    return {
      data: null,
      error: {
        code: 'INTERNAL_ERROR',
        message: (error as Error).message || 'Failed to execute ${operation} operation',
        statusCode: 500
      }
    };
  }
}
`;
};