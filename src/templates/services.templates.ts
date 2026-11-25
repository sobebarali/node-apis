/**
 * Service operation templates for third-party integrations
 */

import { ParsedTypePayload } from '../services/type-parser.service';
import { getModuleNaming } from '../shared/utils/naming.utils';
import { buildNotImplemented, buildSignature } from './typed-crud.handlers';

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
  code: 'INTERNAL_ERROR';
  message: string;
  statusCode: 500;
  requestId: string;
};

export type typeResult = {
  data: null | typeResultData;
  error: null | typeResultError;
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

  const payloadNames = fields.map(field => field.name).filter(name => name !== 'requestId');
  const hasPayload = fields.length > 0;
  const signature = buildSignature({
    start: `export const ${functionName} = async (`,
    names: [...payloadNames, 'requestId'],
    parameterType: hasPayload ? 'typePayload & { requestId: string }' : '{ requestId: string }',
    end: '): Promise<typeResult> => {',
  });
  const typeImports = hasPayload ? 'typePayload, typeResult' : 'typeResult';

  return `import type { ${typeImports} } from '../types/${serviceName}.${naming.file}';

${signature}
  try {
    // TODO: Call the third-party API here and return { data, error: null }
${buildNotImplemented({ label: `${logLabel} service`, fields, indent: '    ' })}
  } catch (error) {
    console.error(\`\${requestId} [SERVICE] - ${logLabel} error:\`, error);

    return {
      data: null,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to execute ${serviceName} service for ${naming.variable}',
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
