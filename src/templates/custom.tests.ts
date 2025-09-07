/**
 * Custom test templates
 */

/**
 * Gets custom test file names for a module
 */
export const getCustomTestFileNames = ({ 
  customNames, 
  moduleName 
}: { 
  customNames: string[]; 
  moduleName: string; 
}): string[] => {
  const testTypes = ['validation.test.ts', 'success.test.ts', 'errors.test.ts'];
  const testFiles: string[] = [];
  
  customNames.forEach(customName => {
    testTypes.forEach(testType => {
      testFiles.push(`${customName}-${moduleName}/${testType}`);
    });
  });
  
  // Add shared helpers
  testFiles.push('shared/helpers.ts');
  
  return testFiles;
};

/**
 * Generates test file content for custom operations
 */
export const generateCustomTestContent = ({ 
  customName, 
  moduleName,
  testType 
}: { 
  customName: string; 
  moduleName: string;
  testType: 'validation' | 'success' | 'errors' | 'helpers';
}): string => {
  const capitalizedModule = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  const capitalizedCustom = customName.charAt(0).toUpperCase() + customName.slice(1);
  
  switch (testType) {
    case 'validation':
      return generateCustomValidationTestContent(customName, capitalizedModule, capitalizedCustom, moduleName);
    case 'success':
      return generateCustomSuccessTestContent(customName, capitalizedModule, capitalizedCustom, moduleName);
    case 'errors':
      return generateCustomErrorsTestContent(customName, capitalizedModule, capitalizedCustom, moduleName);
    case 'helpers':
      return generateCustomHelpersContent(capitalizedModule, moduleName);
    default:
      return generateGenericCustomTestContent(customName, capitalizedModule, capitalizedCustom, moduleName, testType);
  }
};

/**
 * Generates validation test content for custom operations
 */
const generateCustomValidationTestContent = (customName: string, _capitalizedModule: string, capitalizedCustom: string, moduleName: string): string => {
  return `import { describe, it, expect } from 'vitest';
import { validatePayload } from '../../../src/apis/${moduleName}/validators/${customName}.${moduleName}';
import { typePayload, typeResult, typeResultData, typeResultError } from '../../../src/apis/${moduleName}/types/${customName}.${moduleName}';

describe('${capitalizedCustom} ${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} - Validation Tests', () => {
  describe('Success Cases', () => {
    it('should validate with required fields only', () => {
      const payload: typePayload = {
        // Add minimal required fields for ${customName} ${moduleName}
      };

      const result = validatePayload(payload);
      expect(result.success).toBe(true);
    });

    it('should validate with all optional fields', () => {
      const payload: typePayload = {
        // Add complete payload with all optional fields for ${customName} ${moduleName}
      };

      const result = validatePayload(payload);
      expect(result.success).toBe(true);
    });
  });

  describe('Failure Cases', () => {
    it('should fail with invalid input', () => {
      const invalidPayload = {
        // Add invalid payload for ${customName} ${moduleName}
      };

      const result = validatePayload(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('should fail with missing required fields', () => {
      const incompletePayload = {
        // Add incomplete payload for ${customName} ${moduleName}
      };

      const result = validatePayload(incompletePayload);
      expect(result.success).toBe(false);
    });
  });

  describe('Boundary Cases', () => {
    it('should handle boundary conditions', () => {
      // Add boundary test cases for ${customName} ${moduleName}
      expect(true).toBe(true); // Placeholder - implement specific boundary tests
    });

    it('should handle edge case inputs', () => {
      // Add edge case validation tests for ${customName} ${moduleName}
      expect(true).toBe(true); // Placeholder - implement specific edge case tests
    });
  });
});
`;
};

/**
 * Generates success test content for custom operations
 */
const generateCustomSuccessTestContent = (customName: string, _capitalizedModule: string, capitalizedCustom: string, moduleName: string): string => {
  return `import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../../src/app';
import { typePayload, typeResult, typeResultData, typeResultError } from '../../../src/apis/${moduleName}/types/${customName}.${moduleName}';

describe('${capitalizedCustom} ${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} - Success Tests', () => {
  it('should ${customName} ${moduleName} successfully', async () => {
    const payload: typePayload = {
      // Add success payload for ${customName} ${moduleName}
      id: 'test-${moduleName}-123'
    };

    const response = await request(app)
      .post('/api/${moduleName}s/${customName}')
      .send(payload)
      .expect(200);

    expect(response.body.data).toBeDefined();
    expect(response.body.error).toBeNull();
  });

  it('should handle minimal payload', async () => {
    const payload: typePayload = {
      // Add minimal required fields only
    };

    const response = await request(app)
      .post('/api/${moduleName}s/${customName}')
      .send(payload)
      .expect(200);

    expect(response.body.data).toBeDefined();
    expect(response.body.error).toBeNull();
  });

  it('should handle complete payload', async () => {
    const payload: typePayload = {
      // Add all optional fields
      id: 'test-${moduleName}-complete'
    };

    const response = await request(app)
      .post('/api/${moduleName}s/${customName}')
      .send(payload)
      .expect(200);

    expect(response.body.data).toBeDefined();
    expect(response.body.error).toBeNull();
  });
});
`;
};

/**
 * Generates errors test content for custom operations
 */
const generateCustomErrorsTestContent = (customName: string, _capitalizedModule: string, capitalizedCustom: string, moduleName: string): string => {
  return `import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../../src/app';
import { typePayload, typeResult, typeResultData, typeResultError } from '../../../src/apis/${moduleName}/types/${customName}.${moduleName}';

describe('${capitalizedCustom} ${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} - Error Tests', () => {
  it('should return 400 for invalid payload', async () => {
    const invalidPayload = {
      // Add invalid payload that fails validation
      invalidField: 'invalid-value'
    };

    const response = await request(app)
      .post('/api/${moduleName}s/${customName}')
      .send(invalidPayload)
      .expect(400);

    expect(response.body.data).toBeNull();
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.message).toBeDefined();
  });

  it('should return 400 for missing required fields', async () => {
    const incompletePayload = {
      // Missing required fields
    };

    const response = await request(app)
      .post('/api/${moduleName}s/${customName}')
      .send(incompletePayload)
      .expect(400);

    expect(response.body.data).toBeNull();
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should handle malformed JSON', async () => {
    const response = await request(app)
      .post('/api/${moduleName}s/${customName}')
      .send('{ invalid json }')
      .set('Content-Type', 'application/json')
      .expect(400);

    expect(response.body.error.code).toBe('INVALID_JSON');
  });

  it('should handle empty request body', async () => {
    const response = await request(app)
      .post('/api/${moduleName}s/${customName}')
      .send({})
      .expect(400);

    expect(response.body.data).toBeNull();
    expect(response.body.error).toBeDefined();
  });

  it('should handle unsupported content type', async () => {
    const response = await request(app)
      .post('/api/${moduleName}s/${customName}')
      .send('field=value')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .expect(415);

    expect(response.body.error.code).toBe('UNSUPPORTED_MEDIA_TYPE');
  });
});
`;
};

/**
 * Generates shared helpers content for custom operations
 */
const generateCustomHelpersContent = (_capitalizedModule: string, moduleName: string): string => {
  return `import request from 'supertest';
import app from '../../../src/app';

/**
 * Test helper functions for ${moduleName} module (custom operations)
 */

export const performCustomOperation = async (operationName: string, payload: any) => {
  const response = await request(app)
    .post(\`/api/${moduleName}s/\${operationName}\`)
    .send(payload);

  return response.body.data;
};

export const create${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}ForTesting = async (overrides = {}) => {
  const defaultPayload = {
    // Add default test payload for ${moduleName}
    ...overrides
  };

  const response = await request(app)
    .post('/api/${moduleName}s')
    .send(defaultPayload);

  return response.body.data;
};

export const cleanup${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} = async (id: string) => {
  await request(app)
    .delete(\`/api/${moduleName}s/\${id}\`);
};

export const generateTestId = (): string => {
  return \`test-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;
};

export const waitFor = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const mockExternalService = () => {
  // Add mocking utilities for external services
  return {
    success: (data: any) => Promise.resolve(data),
    error: (error: Error) => Promise.reject(error),
    timeout: () => new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 5000)
    )
  };
};
`;
};

const generateGenericCustomTestContent = (customName: string, _capitalizedModule: string, _capitalizedCustom: string, moduleName: string, testType: string): string => {
  return `// Generic test content for ${customName} ${moduleName} - ${testType}`;
};
