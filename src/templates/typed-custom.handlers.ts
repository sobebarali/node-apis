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
  useRepositoryLayer = true,
}: {
  customName: string;
  moduleName: string;
  parsedType: ParsedTypePayload;
  useRepositoryLayer?: boolean;
}): string => {
  const naming = getModuleNaming(moduleName);
  return generateGenericTypedCustomHandlerContent(customName, naming, parsedType, useRepositoryLayer);
};

/**
 * Generates generic typed custom handler content
 */
const generateGenericTypedCustomHandlerContent = (
  customName: string,
  naming: ModuleNaming,
  parsedType: ParsedTypePayload,
  useRepositoryLayer: boolean
): string => {
  const fieldDestructuring = generateFieldDestructuring(parsedType.fields);
  const fieldTypes = parsedType.fields.length > 0
    ? parsedType.fields.map(field => `  ${field.name}${field.optional ? '?' : ''}: ${field.type};`).join('\n')
    : '  // No fields defined in typePayload';

  const repositoryImport = useRepositoryLayer
    ? `import ${customName} from "../repository/${customName}.${naming.file}";
`
    : '';

  const businessLogic = useRepositoryLayer
    ? `    const result = await ${customName}({
      ${parsedType.fields.map(field => field.name).join(',\n      ')}
    });`
    : `    // TODO: Implement your ${customName.toUpperCase()} ${naming.constant} logic without the repository layer
    const result = {} as typeResult;`;

  return `${repositoryImport}import type { typeResult } from "../types/${customName}.${naming.file}";

export default async function ${customName}${naming.class}Handler({
  ${fieldDestructuring}
  requestId,
}: {
${fieldTypes}
  requestId: string;
}): Promise<typeResult> {
  try {
    console.info(\`\${requestId} [HANDLER] - ${customName.toUpperCase()} ${naming.constant} started\`);

    // Business logic here - call repository function or inline logic
${businessLogic}

    console.info(\`\${requestId} [HANDLER] - ${customName.toUpperCase()} ${naming.constant} completed successfully\`);

    return result;
  } catch (error) {
    console.error(\`\${requestId} [HANDLER] - ${customName.toUpperCase()} ${naming.constant} error:\`, error);

    return {
      data: null,
      error: {
        code: 'INTERNAL_ERROR',
        message: (error as Error).message || 'Failed to execute ${customName} operation for ${naming.variable}',
        statusCode: 500
      }
    };
  }
}
`;
};
