/**
 * Custom test templates
 */

/**
 * Gets custom test file names for a module
 */
export const getCustomTestFileNames = ({ customNames }: { customNames: string[] }): string[] => {
  const testFiles: string[] = [];

  customNames.forEach(customName => {
    const testTypes = getCustomTestTypesForOperation(customName);
    testTypes.forEach(testType => {
      testFiles.push(`${customName}/${testType}.test.ts`);
    });
  });

  return testFiles;
};

/**
 * Gets the test types for custom operations
 */
const getCustomTestTypesForOperation = (_customName: string): string[] => {
  // Custom operations typically have success, validation, and unauthorized tests
  return ['success', 'validation', 'unauthorized'];
};

/**
 * Generates test file content for custom operations
 */
export const generateCustomTestContent = ({
  customName,
  moduleName,
  testType,
}: {
  customName: string;
  moduleName: string;
  testType: 'success' | 'validation' | 'unauthorized';
}): string => {
  const capitalizedModule = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  const capitalizedCustom = customName.charAt(0).toUpperCase() + customName.slice(1);

  switch (testType) {
    case 'success':
      return generateCustomSuccessTestContent(customName, capitalizedModule, capitalizedCustom, moduleName);
    case 'validation':
      return generateCustomValidationTestContent(customName, capitalizedModule, capitalizedCustom, moduleName);
    case 'unauthorized':
      return generateCustomUnauthorizedTestContent(customName, capitalizedModule, capitalizedCustom, moduleName);
    default:
      return generateGenericCustomTestContent(
        customName,
        capitalizedModule,
        capitalizedCustom,
        moduleName,
        testType
      );
  }
};





/**
 * Generates success test content for custom operations
 */
const generateCustomSuccessTestContent = (
  customName: string,
  _capitalizedModule: string,
  capitalizedCustom: string,
  moduleName: string
): string => {
  return `import { describe, it, expect } from 'vitest';
import type { typePayload, typeResult, typeResultData, typeResultError } from '../../../src/apis/${moduleName}/types/${customName}.${moduleName}';

const BASE_URL = 'http://localhost:3001';

describe('${capitalizedCustom} ${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} - Success Tests', () => {
  it('should ${customName} ${moduleName} successfully', async () => {
    const payload: typePayload = {
      // Add success payload for ${customName} ${moduleName}
      id: 'test-${moduleName}-123'
    };

    const response = await fetch(\`\${BASE_URL}/api/${moduleName}s/${customName}\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json() as typeResult;
    
    expect(response.status).toBe(200);
    expect(result.data).toBeDefined();
    expect(result.error).toBeNull();
    
    if (result.data) {
      const data: typeResultData = result.data;
      expect(data).toBeDefined();
    }
  });
});
`;
};

/**
 * Generates validation test content for custom operations
 */
const generateCustomValidationTestContent = (
  customName: string,
  _capitalizedModule: string,
  capitalizedCustom: string,
  moduleName: string
): string => {
  return `import { describe, it, expect } from 'vitest';
import { validatePayload } from '../../../src/apis/${moduleName}/validators/${customName}.${moduleName}';
import type { typePayload, typeResult, typeResultData, typeResultError } from '../../../src/apis/${moduleName}/types/${customName}.${moduleName}';

describe('${capitalizedCustom} ${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} - Validation Tests', () => {
  describe('Success Cases', () => {
    it('should validate with required fields only', () => {
      const payload: typePayload = {
        // Add minimal required fields for ${customName} ${moduleName}
      };

      const result = validatePayload(payload);
      expect(result.success).toBe(true);
      
      if (result.success && result.data) {
        const data: typeResultData = result.data;
        expect(data).toBeDefined();
      }
    });

    it('should validate with all optional fields', () => {
      const payload: typePayload = {
        // Add complete payload with all optional fields for ${customName} ${moduleName}
      };

      const result = validatePayload(payload);
      expect(result.success).toBe(true);
      
      if (result.success && result.data) {
        const data: typeResultData = result.data;
        expect(data).toBeDefined();
      }
    });
  });

  describe('Failure Cases', () => {
    it('should fail with invalid input', () => {
      const invalidPayload = {
        // Add invalid payload for ${customName} ${moduleName}
      } as typePayload;

      const result = validatePayload(invalidPayload);
      expect(result.success).toBe(false);
      
      if (!result.success && result.error) {
        const error: typeResultError = result.error;
        expect(error).toBeDefined();
        expect(error.code).toBeDefined();
      }
    });

    it('should fail with missing required fields', () => {
      const incompletePayload = {
        // Add incomplete payload for ${customName} ${moduleName}
      } as typePayload;

      const result = validatePayload(incompletePayload);
      expect(result.success).toBe(false);
      
      if (!result.success && result.error) {
        const error: typeResultError = result.error;
        expect(error.code).toBe('VALIDATION_ERROR');
      }
    });
  });

  describe('Boundary Cases', () => {
    it('should handle boundary conditions', () => {
      const payload: typePayload = {
        // Add boundary test payload for ${customName} ${moduleName}
      };

      const result = validatePayload(payload);
      expect(result.success).toBe(true);
    });

    it('should handle edge case inputs', () => {
      const payload: typePayload = {
        // Add edge case payload for ${customName} ${moduleName}
      };

      const result = validatePayload(payload);
      expect(result.success).toBe(true);
    });
  });
});
`;
};

/**
 * Generates unauthorized test content for custom operations
 */
const generateCustomUnauthorizedTestContent = (
  customName: string,
  _capitalizedModule: string,
  capitalizedCustom: string,
  moduleName: string
): string => {
  return `import { describe, it, expect } from 'vitest';
import type { typePayload, typeResult, typeResultData, typeResultError } from '../../../src/apis/${moduleName}/types/${customName}.${moduleName}';

const BASE_URL = 'http://localhost:3001';

describe('${capitalizedCustom} ${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} - Unauthorized Tests', () => {
  it('should return 401 for missing authentication token', async () => {
    const payload: typePayload = {
      // Add success payload for ${customName} ${moduleName}
    };

    const response = await fetch(\`\${BASE_URL}/api/${moduleName}s/${customName}\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json() as typeResult;
    
    expect(response.status).toBe(401);
    expect(result.data).toBeNull();
    expect(result.error).toBeDefined();
    
    if (result.error) {
      const error: typeResultError = result.error;
      expect(error.code).toBe('UNAUTHORIZED');
      expect(error.statusCode).toBe(401);
    }
  });

  it('should return 401 for invalid authentication token', async () => {
    const payload: typePayload = {
      // Add success payload for ${customName} ${moduleName}
    };

    const response = await fetch(\`\${BASE_URL}/api/${moduleName}s/${customName}\`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid-token'
      },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json() as typeResult;
    
    expect(response.status).toBe(401);
    expect(result.data).toBeNull();
    expect(result.error).toBeDefined();
    
    if (result.error) {
      const error: typeResultError = result.error;
      expect(error.code).toBe('INVALID_TOKEN');
      expect(error.statusCode).toBe(401);
    }
  });
});
`;
};



const generateGenericCustomTestContent = (
  customName: string,
  _capitalizedModule: string,
  _capitalizedCustom: string,
  moduleName: string,
  testType: string
): string => {
  return `// Generic test content for ${customName} ${moduleName} - ${testType}`;
};
