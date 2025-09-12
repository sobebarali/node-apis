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
  details?: any;
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
}: {
  serviceName: string;
  moduleName: string;
}): string => {
  const naming = getModuleNaming(moduleName);
  const capitalizedService = serviceName.charAt(0).toUpperCase() + serviceName.slice(1);
  const functionName = `${serviceName}${naming.class}`;

  return `import { typePayload, typeResult } from '../types/${serviceName}.${naming.file}';

/**
 * ${capitalizedService} service for ${naming.variable}
 */
export const ${functionName} = async ({
  // Destructure your payload fields here
}: typePayload): Promise<typeResult> => {
  try {
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
    //   return {
    //     data: null,
    //     error: {
    //       code: error.code || 'API_ERROR',
    //       message: error.message || '${capitalizedService} failed',
    //       statusCode: response.status,
    //       details: error,
    //     },
    //   };
    // }

    // const data = await response.json();
    
    // TODO: Remove this placeholder and implement your logic
    const mockResult = {
      success: true,
      message: '${capitalizedService} completed successfully',
    };

    return {
      data: mockResult as any, // Replace with actual response data
      error: null,
    };
  } catch (error: any) {
    return {
      data: null,
      error: {
        code: 'NETWORK_ERROR',
        message: error.message || 'Failed to connect to external service',
        statusCode: 500,
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
