/**
 * Service operation templates for third-party integrations
 */

import { getModuleNaming } from '../shared/utils/naming.utils';

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
  apiBasePath = '~/server/api',
}: {
  serviceName: string;
  moduleName: string;
  apiBasePath?: string;
}): string => {
  const naming = getModuleNaming(moduleName);
  const capitalizedService = serviceName.charAt(0).toUpperCase() + serviceName.slice(1);
  const functionName = `${serviceName}${naming.class}`;

  return `import { TRPC_ERROR_CODES, ERROR_MESSAGES } from "${apiBasePath}/constants/errors";
import { createScopedLogger } from "${apiBasePath}/utils/logger";
import type { typeResult, typeResultData } from "../types/${serviceName}.${naming.file}";

/**
 * ${capitalizedService} service for ${naming.variable}
 */
export const ${functionName} = async ({
  // Destructure your payload fields here
  requestId,
}: {
  // Add your specific fields here
  requestId: string;
}): Promise<typeResult> => {
  const log = createScopedLogger({ requestId, feature: "${naming.constant}" });

  try {
    const startTime = Date.now();
    log.info({}, "${capitalizedService} service started");

    // TODO: Replace with your third-party API call
    // Example using fetch:
    // const response = await fetch('https://api.example.com/endpoint', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': \`Bearer \${process.env.API_KEY}\`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     // Your request data
    //   }),
    // });

    // if (!response.ok) {
    //   const error = await response.json();
    //   log.error({ statusCode: response.status, error }, "API request failed");
    //   return {
    //     data: null,
    //     error: {
    //       code: TRPC_ERROR_CODES.INTERNAL_SERVER_ERROR,
    //       message: error.message || '${capitalizedService} failed',
    //       statusCode: response.status,
    //       requestId,
    //       details: error,
    //     },
    //   };
    // }

    // const data = await response.json();

    // TODO: Remove this placeholder and implement your logic
    const mockResult: typeResultData = {
      success: true,
      message: '${capitalizedService} completed successfully',
    } as typeResultData;

    const duration = Date.now() - startTime;
    log.info({ duration: \`\${duration}ms\` }, "${capitalizedService} service completed successfully");

    return {
      data: mockResult,
      error: null,
    };
  } catch (err) {
    const error = err as Error;
    log.error(
      {
        error: error.message,
        stack: error.stack,
      },
      "${capitalizedService} service error",
    );

    return {
      data: null,
      error: {
        code: TRPC_ERROR_CODES.INTERNAL_SERVER_ERROR,
        message: error.message || ERROR_MESSAGES.INTERNAL_ERROR,
        statusCode: 500,
        requestId,
        details: error,
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
