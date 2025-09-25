/**
 * Service test templates
 */

import { getModuleNaming } from '../shared/utils/naming.utils';

/**
 * Generates validation test file content for service operations
 */
export const generateServiceValidationTestContent = ({
  serviceName,
  moduleName,
}: {
  serviceName: string;
  moduleName: string;
}): string => {
  const naming = getModuleNaming(moduleName);
  const functionName = `${serviceName}${naming.class}`;

  return `import { describe, it, expect } from 'vitest';
import { ${functionName} } from '../../../src/apis/${naming.file}/services/${serviceName}.${naming.file}';

describe('${functionName} - Validation Tests', () => {
  it('should handle empty payload', async () => {
    const result = await ${functionName}({} as any);
    
    // Add your validation assertions here
    expect(result).toBeDefined();
    expect(result.data).toBeDefined();
    expect(result.error).toBeNull();
  });

  it('should handle invalid payload types', async () => {
    const result = await ${functionName}({
      // Add invalid test data here
    } as any);
    
    // Add your validation assertions here
    expect(result).toBeDefined();
  });

  it('should handle missing required fields', async () => {
    const result = await ${functionName}({
      // Add incomplete test data here
    } as any);
    
    // Add your validation assertions here
    expect(result).toBeDefined();
  });
});
`;
};

/**
 * Generates success test file content for service operations
 */
export const generateServiceSuccessTestContent = ({
  serviceName,
  moduleName,
}: {
  serviceName: string;
  moduleName: string;
}): string => {
  const naming = getModuleNaming(moduleName);
  const functionName = `${serviceName}${naming.class}`;

  return `import { describe, it, expect, vi } from 'vitest';
import { ${functionName} } from '../../../src/apis/${naming.file}/services/${serviceName}.${naming.file}';

describe('${functionName} - Success Cases', () => {
  it('should execute ${serviceName} successfully', async () => {
    // TODO: Mock your external API calls here
    // Example:
    // global.fetch = vi.fn().mockResolvedValue({
    //   ok: true,
    //   json: () => Promise.resolve({
    //     // Your expected response data
    //   }),
    // });

    const testPayload = {
      // Add your test payload here
    };

    const result = await ${functionName}(testPayload);

    expect(result.error).toBeNull();
    expect(result.data).toBeDefined();
    // Add more specific assertions based on your expected response
  });

  it('should handle successful response with different data', async () => {
    // TODO: Mock different successful scenarios
    const testPayload = {
      // Add different test payload here
    };

    const result = await ${functionName}(testPayload);

    expect(result.error).toBeNull();
    expect(result.data).toBeDefined();
  });

  it('should process response data correctly', async () => {
    // TODO: Test data transformation and processing
    const testPayload = {
      // Add test payload here
    };

    const result = await ${functionName}(testPayload);

    expect(result.error).toBeNull();
    expect(result.data).toBeDefined();
    // Add assertions for data structure and values
  });
});
`;
};

/**
 * Generates error test file content for service operations
 */
export const generateServiceErrorTestContent = ({
  serviceName,
  moduleName,
}: {
  serviceName: string;
  moduleName: string;
}): string => {
  const naming = getModuleNaming(moduleName);
  const functionName = `${serviceName}${naming.class}`;

  return `import { describe, it, expect, vi } from 'vitest';
import { ${functionName} } from '../../../src/apis/${naming.file}/services/${serviceName}.${naming.file}';

describe('${functionName} - Error Cases', () => {
  it('should handle API errors', async () => {
    // TODO: Mock API error responses
    // Example:
    // global.fetch = vi.fn().mockResolvedValue({
    //   ok: false,
    //   status: 400,
    //   json: () => Promise.resolve({
    //     error: {
    //       code: 'INVALID_REQUEST',
    //       message: 'Invalid request parameters',
    //     },
    //   }),
    // });

    const testPayload = {
      // Add test payload that would cause an error
    };

    const result = await ${functionName}(testPayload);

    expect(result.data).toBeNull();
    expect(result.error).toBeDefined();
    // expect(result.error?.code).toBe('INVALID_REQUEST');
    // expect(result.error?.statusCode).toBe(400);
  });

  it('should handle network errors', async () => {
    // TODO: Mock network failures
    // global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const testPayload = {
      // Add test payload here
    };

    const result = await ${functionName}(testPayload);

    expect(result.data).toBeNull();
    expect(result.error).toBeDefined();
    expect(result.error?.code).toBe('NETWORK_ERROR');
    expect(result.error?.statusCode).toBe(500);
  });

  it('should handle timeout errors', async () => {
    // TODO: Mock timeout scenarios
    const testPayload = {
      // Add test payload here
    };

    const result = await ${functionName}(testPayload);

    // Add timeout-specific assertions
    expect(result).toBeDefined();
  });

  it('should handle authentication errors', async () => {
    // TODO: Mock authentication failures
    const testPayload = {
      // Add test payload here
    };

    const result = await ${functionName}(testPayload);

    // Add auth-specific assertions
    expect(result).toBeDefined();
  });
});
`;
};

/**
 * Generates comprehensive test file content for service operations
 */
export const generateServiceComprehensiveTestContent = ({
  serviceName,
  moduleName,
}: {
  serviceName: string;
  moduleName: string;
}): string => {
  const naming = getModuleNaming(moduleName);
  const functionName = `${serviceName}${naming.class}`;

  return `import { describe, it, expect, vi } from 'vitest';
import { ${functionName} } from '../../../src/apis/${naming.file}/services/${serviceName}.${naming.file}';

describe('${functionName} - Comprehensive Tests', () => {
  describe('Validation Tests', () => {
    it('should handle empty payload', async () => {
      const result = await ${functionName}({} as any);
      
      // Add your validation assertions here
      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
    });

    it('should handle invalid payload types', async () => {
      const result = await ${functionName}({
        // Add invalid test data here
      } as any);
      
      // Add your validation assertions here
      expect(result).toBeDefined();
    });

    it('should handle missing required fields', async () => {
      const result = await ${functionName}({
        // Add incomplete test data here
      } as any);
      
      // Add your validation assertions here
      expect(result).toBeDefined();
    });
  });

  describe('Success Tests', () => {
    it('should execute ${serviceName} successfully', async () => {
      // TODO: Mock your external API calls here
      // Example:
      // global.fetch = vi.fn().mockResolvedValue({
      //   ok: true,
      //   json: () => Promise.resolve({
      //     // Your expected response data
      //   }),
      // });

      const testPayload = {
        // Add your test payload here
      };

      const result = await ${functionName}(testPayload);

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      // Add more specific assertions based on your expected response
    });

    it('should handle successful response with different data', async () => {
      // TODO: Mock different successful scenarios
      const testPayload = {
        // Add different test payload here
      };

      const result = await ${functionName}(testPayload);

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
    });

    it('should process response data correctly', async () => {
      // TODO: Test data transformation and processing
      const testPayload = {
        // Add test payload here
      };

      const result = await ${functionName}(testPayload);

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      // Add assertions for data structure and values
    });
  });

  describe('Error Tests', () => {
    it('should handle API errors', async () => {
      // TODO: Mock API error responses
      // Example:
      // global.fetch = vi.fn().mockResolvedValue({
      //   ok: false,
      //   status: 400,
      //   json: () => Promise.resolve({
      //     error: {
      //       code: 'INVALID_REQUEST',
      //       message: 'Invalid request parameters',
      //     },
      //   }),
      // });

      const testPayload = {
        // Add test payload that would cause an error
      };

      const result = await ${functionName}(testPayload);

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      // expect(result.error?.code).toBe('INVALID_REQUEST');
      // expect(result.error?.statusCode).toBe(400);
    });

    it('should handle network errors', async () => {
      // TODO: Mock network failures
      // global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const testPayload = {
        // Add test payload here
      };

      const result = await ${functionName}(testPayload);

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('NETWORK_ERROR');
      expect(result.error?.statusCode).toBe(500);
    });

    it('should handle timeout errors', async () => {
      // TODO: Mock timeout scenarios
      const testPayload = {
        // Add test payload here
      };

      const result = await ${functionName}(testPayload);

      // Add timeout-specific assertions
      expect(result).toBeDefined();
    });

    it('should handle authentication errors', async () => {
      // TODO: Mock authentication failures
      const testPayload = {
        // Add test payload here
      };

      const result = await ${functionName}(testPayload);

      // Add auth-specific assertions
      expect(result).toBeDefined();
    });
  });
});
`;
};

/**
 * Generates shared helpers file content for service tests
 */
export const generateServiceTestHelpersContent = ({
  moduleName,
}: {
  moduleName: string;
  serviceNames: string[];
}): string => {
  const naming = getModuleNaming(moduleName);
  const capitalizedModule = naming.class;

  return `/**
 * Shared test helpers for ${capitalizedModule} service tests
 */

/**
 * Mock successful API response
 */
export const mockSuccessResponse = (data: any) => ({
  ok: true,
  status: 200,
  json: () => Promise.resolve(data),
});

/**
 * Mock API error response
 */
export const mockErrorResponse = (error: any, status: number = 400) => ({
  ok: false,
  status,
  json: () => Promise.resolve({ error }),
});

/**
 * Mock network error
 */
export const mockNetworkError = (message: string = 'Network error') => {
  return Promise.reject(new Error(message));
};

/**
 * Sample test data for ${capitalizedModule} services
 */
export const sampleTestData = {
  // Add common test data here
  // Example:
  // validPayload: {
  //   field1: 'value1',
  //   field2: 'value2',
  // },
  // invalidPayload: {
  //   field1: null,
  // },
};

/**
 * Common test utilities
 */
export const testUtils = {
  /**
   * Generate random test ID
   */
  generateTestId: () => \`test_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`,
  
  /**
   * Wait for specified milliseconds
   */
  wait: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  
  /**
   * Create mock environment variables
   */
  mockEnvVars: (vars: Record<string, string>) => {
    const originalEnv = process.env;
    process.env = { ...originalEnv, ...vars };
    return () => {
      process.env = originalEnv;
    };
  },
};
`;
};
