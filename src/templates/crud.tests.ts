/**
 * CRUD test templates
 */

/**
 * Gets the list of CRUD test file names for a module
 */
export const getCrudTestFileNames = (): string[] => {
  const operations = ['create', 'get', 'list', 'update', 'delete'];
  const testTypes = ['validation.test.ts', 'success.test.ts', 'errors.test.ts'];

  const testFiles: string[] = [];

  operations.forEach(operation => {
    testTypes.forEach(testType => {
      testFiles.push(`${operation}/${testType}`);
    });
  });

  // Add shared helpers
  testFiles.push('shared/helpers.ts');

  return testFiles;
};

/**
 * Generates test file content for CRUD operations
 */
export const generateCrudTestContent = ({
  operation,
  moduleName,
  testType,
}: {
  operation: string;
  moduleName: string;
  testType: 'validation' | 'success' | 'errors' | 'helpers';
}): string => {
  const capitalizedModule = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  const capitalizedOperation = operation.charAt(0).toUpperCase() + operation.slice(1);

  switch (testType) {
    case 'validation':
      return generateValidationTestContent(
        operation,
        capitalizedModule,
        capitalizedOperation,
        moduleName
      );
    case 'success':
      return generateSuccessTestContent(
        operation,
        capitalizedModule,
        capitalizedOperation,
        moduleName
      );
    case 'errors':
      return generateErrorsTestContent(
        operation,
        capitalizedModule,
        capitalizedOperation,
        moduleName
      );
    case 'helpers':
      return generateHelpersContent(capitalizedModule, moduleName);
    default:
      return generateGenericTestContent(
        operation,
        capitalizedModule,
        capitalizedOperation,
        moduleName,
        testType
      );
  }
};

/**
 * Generates validation test content
 */
const generateValidationTestContent = (
  operation: string,
  _capitalizedModule: string,
  capitalizedOperation: string,
  moduleName: string
): string => {
  return `import { describe, it, expect } from 'vitest';
import { validatePayload } from '../../../src/apis/${moduleName}/validators/${operation}.${moduleName}';
import type { typePayload, typeResult, typeResultData, typeResultError } from '../../../src/apis/${moduleName}/types/${operation}.${moduleName}';

describe('${capitalizedOperation} ${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} - Validation Tests', () => {
  describe('Success Cases', () => {
    it('should validate with required fields only', () => {
      const payload: typePayload = {
        ${getValidationSuccessPayload(operation, moduleName)}
      };

      const result = validatePayload(payload);
      expect(result.success).toBe(true);
    });

    it('should validate with all optional fields', () => {
      const payload: typePayload = {
        ${getValidationCompletePayload(operation, moduleName)}
      };

      const result = validatePayload(payload);
      expect(result.success).toBe(true);
    });
  });

  describe('Failure Cases', () => {
    ${getValidationFailureCases(operation, moduleName)}
  });

  describe('Boundary Cases', () => {
    ${getValidationBoundaryCases(operation, moduleName)}
  });
});
`;
};

/**
 * Generates success test content
 */
const generateSuccessTestContent = (
  operation: string,
  _capitalizedModule: string,
  capitalizedOperation: string,
  moduleName: string
): string => {
  return `import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../../src/app';
import type { typePayload, typeResult, typeResultData, typeResultError } from '../../../src/apis/${moduleName}/types/${operation}.${moduleName}';

describe('${capitalizedOperation} ${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} - Success Tests', () => {
  it('should ${operation} ${moduleName} successfully', async () => {
    const payload: typePayload = {
      ${getSuccessPayload(operation, moduleName)}
    };

    const response = await request(app)
      .${getHttpMethod(operation)}('${getApiEndpoint(operation, moduleName)}')
      ${getRequestBody(operation)}
      .expect(${getSuccessStatusCode(operation)});

    ${getSuccessAssertions(operation, moduleName)}
  });

  ${getAdditionalSuccessTests(operation, moduleName)}
});
`;
};

/**
 * Generates errors test content
 */
const generateErrorsTestContent = (
  operation: string,
  _capitalizedModule: string,
  capitalizedOperation: string,
  moduleName: string
): string => {
  return `import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../../src/app';
import type { typePayload, typeResult, typeResultData, typeResultError } from '../../../src/apis/${moduleName}/types/${operation}.${moduleName}';

describe('${capitalizedOperation} ${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} - Error Tests', () => {
  ${getIntegrationErrorTests(operation, moduleName)}
});
`;
};

/**
 * Generates shared helpers content
 */
const generateHelpersContent = (_capitalizedModule: string, moduleName: string): string => {
  return `import request from 'supertest';
import app from '../../../src/app';

/**
 * Test helper functions for ${moduleName} module
 */

export const create${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} = async (overrides = {}) => {
  const defaultPayload = {
    // Add default test payload here
    ...overrides
  };

  const response = await request(app)
    .post('/api/${moduleName}s')
    .send(defaultPayload);

  return response.body.data;
};

export const delete${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} = async (id: string) => {
  await request(app)
    .delete(\`/api/${moduleName}s/\${id}\`);
};

export const generateTestId = (): string => {
  return \`test-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;
};

export const waitFor = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
`;
};

// Helper functions for generating test content
const getValidationSuccessPayload = (operation: string, moduleName: string): string => {
  switch (operation) {
    case 'create':
      return `// Add minimal required fields for ${moduleName} creation`;
    case 'get':
      return `id: 'test-${moduleName}-id'`;
    case 'list':
      return `// Add query parameters for listing`;
    case 'update':
      return `id: 'test-${moduleName}-id'\n        // Add update fields`;
    case 'delete':
      return `id: 'test-${moduleName}-id'`;
    default:
      return `// Add validation payload for ${operation}`;
  }
};

const getValidationCompletePayload = (operation: string, moduleName: string): string => {
  return `// Add complete payload with all optional fields for ${operation} ${moduleName}`;
};

const getValidationFailureCases = (operation: string, moduleName: string): string => {
  return `it('should fail with invalid input', () => {
      const invalidPayload = {
        // Add invalid payload for ${operation} ${moduleName}
      };

      const result = validatePayload(invalidPayload);
      expect(result.success).toBe(false);
    });`;
};

const getValidationBoundaryCases = (operation: string, moduleName: string): string => {
  return `it('should handle boundary conditions', () => {
      // Add boundary test cases for ${operation} ${moduleName}
      expect(true).toBe(true); // Placeholder
    });`;
};

const getSuccessPayload = (operation: string, moduleName: string): string => {
  return `// Add success payload for ${operation} ${moduleName}`;
};

const getHttpMethod = (operation: string): string => {
  switch (operation) {
    case 'create':
      return 'post';
    case 'get':
      return 'get';
    case 'list':
      return 'get';
    case 'update':
      return 'put';
    case 'delete':
      return 'delete';
    default:
      return 'post';
  }
};

const getApiEndpoint = (operation: string, moduleName: string): string => {
  switch (operation) {
    case 'create':
      return `/api/${moduleName}s`;
    case 'get':
      return `/api/${moduleName}s/test-id`;
    case 'list':
      return `/api/${moduleName}s`;
    case 'update':
      return `/api/${moduleName}s/test-id`;
    case 'delete':
      return `/api/${moduleName}s/test-id`;
    default:
      return `/api/${moduleName}s`;
  }
};

const getRequestBody = (operation: string): string => {
  return operation === 'create' || operation === 'update' ? '.send(payload)' : '';
};

const getSuccessStatusCode = (operation: string): number => {
  switch (operation) {
    case 'create':
      return 201;
    case 'get':
      return 200;
    case 'list':
      return 200;
    case 'update':
      return 200;
    case 'delete':
      return 200;
    default:
      return 200;
  }
};

const getSuccessAssertions = (_operation: string, _moduleName: string): string => {
  return `expect(response.body.data).toBeDefined();
      expect(response.body.error).toBeNull();`;
};

const getAdditionalSuccessTests = (operation: string, moduleName: string): string => {
  switch (operation) {
    case 'create':
      return `
  it('should create ${moduleName} with minimal payload', async () => {
    const payload: typePayload = {
      // Add minimal required fields only
    };

    const response = await request(app)
      .post('/api/${moduleName}s')
      .send(payload)
      .expect(201);

    expect(response.body.data).toBeDefined();
    expect(response.body.error).toBeNull();
  });

  it('should create ${moduleName} with complete payload', async () => {
    const payload: typePayload = {
      // Add all optional fields
    };

    const response = await request(app)
      .post('/api/${moduleName}s')
      .send(payload)
      .expect(201);

    expect(response.body.data).toBeDefined();
    expect(response.body.error).toBeNull();
  });`;
    case 'get':
      return `
  it('should get existing ${moduleName}', async () => {
    const ${moduleName}Id = 'existing-${moduleName}-id';

    const response = await request(app)
      .get(\`/api/${moduleName}s/\${${moduleName}Id}\`)
      .expect(200);

    expect(response.body.data.id).toBe(${moduleName}Id);
    expect(response.body.error).toBeNull();
  });`;
    case 'list':
      return `
  it('should list ${moduleName}s with pagination', async () => {
    const response = await request(app)
      .get('/api/${moduleName}s?page=1&limit=10')
      .expect(200);

    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.error).toBeNull();
  });

  it('should list ${moduleName}s with filters', async () => {
    const response = await request(app)
      .get('/api/${moduleName}s?filter=active')
      .expect(200);

    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.error).toBeNull();
  });`;
    case 'update':
      return `
  it('should update existing ${moduleName}', async () => {
    const ${moduleName}Id = 'existing-${moduleName}-id';
    const payload: typePayload = {
      id: ${moduleName}Id,
      // Add update fields
    };

    const response = await request(app)
      .put(\`/api/${moduleName}s/\${${moduleName}Id}\`)
      .send(payload)
      .expect(200);

    expect(response.body.data.id).toBe(${moduleName}Id);
    expect(response.body.error).toBeNull();
  });`;
    case 'delete':
      return `
  it('should delete existing ${moduleName}', async () => {
    const ${moduleName}Id = 'existing-${moduleName}-id';

    const response = await request(app)
      .delete(\`/api/${moduleName}s/\${${moduleName}Id}\`)
      .expect(200);

    expect(response.body.data.deleted_id).toBe(${moduleName}Id);
    expect(response.body.error).toBeNull();
  });`;
    default:
      return '';
  }
};

const getIntegrationErrorTests = (operation: string, moduleName: string): string => {
  switch (operation) {
    case 'create':
      return `it('should return 400 for invalid payload', async () => {
    const invalidPayload = {
      // Add invalid fields
      invalidField: 'invalid-value'
    };

    const response = await request(app)
      .post('/api/${moduleName}s')
      .send(invalidPayload)
      .expect(400);

    expect(response.body.data).toBeNull();
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 for missing required fields', async () => {
    const incompletePayload = {
      // Missing required fields
    };

    const response = await request(app)
      .post('/api/${moduleName}s')
      .send(incompletePayload)
      .expect(400);

    expect(response.body.data).toBeNull();
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should handle malformed JSON', async () => {
    const response = await request(app)
      .post('/api/${moduleName}s')
      .send('{ invalid json }')
      .set('Content-Type', 'application/json')
      .expect(400);

    expect(response.body.error.code).toBe('INVALID_JSON');
  });`;
    case 'get':
      return `it('should return 404 for non-existent ${moduleName}', async () => {
    const nonExistentId = 'non-existent-id';

    const response = await request(app)
      .get(\`/api/${moduleName}s/\${nonExistentId}\`)
      .expect(404);

    expect(response.body.data).toBeNull();
    expect(response.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 400 for invalid ID format', async () => {
    const invalidId = 'invalid-id-format';

    const response = await request(app)
      .get(\`/api/${moduleName}s/\${invalidId}\`)
      .expect(400);

    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });`;
    case 'list':
      return `it('should return 400 for invalid query parameters', async () => {
    const response = await request(app)
      .get('/api/${moduleName}s?page=invalid&limit=abc')
      .expect(400);

    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should handle invalid filters', async () => {
    const response = await request(app)
      .get('/api/${moduleName}s?invalidFilter=value')
      .expect(400);

    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });`;
    case 'update':
      return `it('should return 404 for non-existent ${moduleName}', async () => {
    const nonExistentId = 'non-existent-id';
    const payload: typePayload = {
      id: nonExistentId,
      // Add update fields
    };

    const response = await request(app)
      .put(\`/api/${moduleName}s/\${nonExistentId}\`)
      .send(payload)
      .expect(404);

    expect(response.body.data).toBeNull();
    expect(response.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 400 for invalid update payload', async () => {
    const ${moduleName}Id = 'existing-${moduleName}-id';
    const invalidPayload = {
      id: ${moduleName}Id,
      invalidField: 'invalid-value'
    };

    const response = await request(app)
      .put(\`/api/${moduleName}s/\${${moduleName}Id}\`)
      .send(invalidPayload)
      .expect(400);

    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });`;
    case 'delete':
      return `it('should return 404 for non-existent ${moduleName}', async () => {
    const nonExistentId = 'non-existent-id';

    const response = await request(app)
      .delete(\`/api/${moduleName}s/\${nonExistentId}\`)
      .expect(404);

    expect(response.body.data).toBeNull();
    expect(response.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 400 for invalid ID format', async () => {
    const invalidId = 'invalid-id-format';

    const response = await request(app)
      .delete(\`/api/${moduleName}s/\${invalidId}\`)
      .expect(400);

    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });`;
    default:
      return `it('should return error for invalid request', async () => {
    const response = await request(app)
      .${getHttpMethod(operation)}('${getApiEndpoint(operation, moduleName)}')
      .send({})
      .expect(400);

    expect(response.body.error).toBeTruthy();
  });`;
  }
};

const generateGenericTestContent = (
  operation: string,
  _capitalizedModule: string,
  _capitalizedOperation: string,
  moduleName: string,
  testType: string
): string => {
  return `// Generic test content for ${operation} ${moduleName} - ${testType}`;
};
