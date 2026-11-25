/**
 * Service operation templates for third-party integrations
 */

import { ParsedTypePayload } from '../services/type-parser.service';
import { getModuleNaming } from '../shared/utils/naming.utils';
import { buildPayloadObject } from './typed-crud.handlers';

/**
 * Gets the list of service operation file names for a module
 */
export const getServiceFileNames = ({
  moduleName,
  serviceNames,
}: {
  moduleName: string;
  serviceNames: string[];
}): string[] => {
  const naming = getModuleNaming(moduleName);
  return serviceNames.map(serviceName => `${serviceName}.${naming.file}.ts`);
};

/**
 * Generates TypeScript type file content for service operations
 */
export const generateServiceTypeContent = ({
  serviceName,
  moduleName,
}: {
  serviceName: string;
  moduleName: string;
}): string => {
  const naming = getModuleNaming(moduleName);

  return `export type typePayload = {
  // Define payload for ${serviceName} ${naming.variable}
  // Add your ${serviceName} specific fields here
};

export type typeResultData = {
  // Define result data for ${serviceName} ${naming.variable}
  // Add your ${serviceName} response fields here
};

export type typeResultError = {
  code: string;
  message: string;
  statusCode: number;
  requestId: string;
  details?: unknown;
};

export type typeResult = {
  data: typeResultData | null;
  error: typeResultError | null;
};
`;
};

/**
 * Generates service implementation file content
 */
export const generateServiceContent = ({
  serviceName,
  moduleName,
  parsedType,
}: {
  serviceName: string;
  moduleName: string;
  parsedType: ParsedTypePayload;
}): string => {
  const naming = getModuleNaming(moduleName);
  const { fields } = parsedType;
  const functionName = `${serviceName}${naming.class}`;
  const logLabel = `${serviceName.toUpperCase()} ${naming.constant}`;

  const fieldDestructuring =
    fields.length > 0
      ? fields.map(field => `${field.name},`).join('\n  ')
      : '// No fields defined in typePayload';

  const fieldTypes =
    fields.length > 0
      ? fields.map(field => `  ${field.name}${field.optional ? '?' : ''}: ${field.type};`).join('\n')
      : '  // No fields defined in typePayload';

  return `import type { typeResult, typeResultData } from "../types/${serviceName}.${naming.file}";

export const ${functionName} = async ({
  ${fieldDestructuring}
  requestId,
}: {
${fieldTypes}
  requestId: string;
}): Promise<typeResult> => {
  try {
    console.info(\`\${requestId} [SERVICE] - ${logLabel} started\`);

    // TODO: Replace with your third-party API call and return the real result
    const payload = ${buildPayloadObject(fields)};
    const data = payload as unknown as typeResultData;

    console.info(\`\${requestId} [SERVICE] - ${logLabel} completed\`);

    return { data, error: null };
  } catch (error) {
    console.error(\`\${requestId} [SERVICE] - ${logLabel} error:\`, error);

    return {
      data: null,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Failed to execute ${serviceName} service for ${naming.variable}',
        statusCode: 500,
        requestId,
      },
    };
  }
};
`;
};

/**
 * Generates the list of service names from a comma-separated string
 */
export const parseServiceNames = (servicesString: string): string[] => {
  return servicesString
    .split(',')
    .map(name => name.trim())
    .filter(name => name.length > 0);
};
