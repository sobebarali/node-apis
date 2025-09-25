/**
 * CRUD test templates
 */

/**
 * Gets the list of CRUD test file names for a module
 */
export const getCrudTestFileNames = (): string[] => {
  const operations = ['create', 'get', 'list', 'update', 'delete'];
  const testFiles: string[] = [];

  operations.forEach(operation => {
    const testTypes = getTestTypesForOperation(operation);
    testTypes.forEach(testType => {
      testFiles.push(`${operation}/${testType}.test.ts`);
    });
  });

  return testFiles;
};

/**
 * Gets the test types for each operation
 */
const getTestTypesForOperation = (operation: string): string[] => {
  switch (operation) {
    case 'create':
      return ['success', 'validation', 'duplicate', 'unauthorized'];
    case 'get':
      return ['success', 'not-found', 'invalid-id', 'unauthorized'];
    case 'list':
      return ['success', 'validation', 'unauthorized'];
    case 'update':
      return ['success', 'validation', 'not-found', 'unauthorized'];
    case 'delete':
      return ['success', 'not-found', 'invalid-id', 'unauthorized'];
    default:
      return ['success', 'validation', 'errors'];
  }
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
  testType: 'success' | 'validation' | 'duplicate' | 'unauthorized' | 'not-found' | 'invalid-id';
}): string => {
  const capitalizedModule = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  const capitalizedOperation = operation.charAt(0).toUpperCase() + operation.slice(1);

  switch (testType) {
    case 'success':
      return generateSuccessTestContent(operation, capitalizedModule, capitalizedOperation, moduleName);
    case 'validation':
      return generateValidationTestContent(operation, capitalizedModule, capitalizedOperation, moduleName);
    case 'duplicate':
      return generateDuplicateTestContent(operation, capitalizedModule, capitalizedOperation, moduleName);
    case 'unauthorized':
      return generateUnauthorizedTestContent(operation, capitalizedModule, capitalizedOperation, moduleName);
    case 'not-found':
      return generateNotFoundTestContent(operation, capitalizedModule, capitalizedOperation, moduleName);
    case 'invalid-id':
      return generateInvalidIdTestContent(operation, capitalizedModule, capitalizedOperation, moduleName);
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

    const result: typeResult = response.body;
    expect(result.data).toBeDefined();
    expect(result.error).toBeNull();
    
    if (result.data) {
      const data: typeResultData = result.data;
      expect(data).toHaveProperty('id');
    }
  });

  ${getAdditionalSuccessTests(operation, moduleName)}
});
`;
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
      
      if (result.success && result.data) {
        const data: typeResultData = result.data;
        expect(data).toBeDefined();
      }
    });

    it('should validate with all optional fields', () => {
      const payload: typePayload = {
        ${getValidationCompletePayload(operation, moduleName)}
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
        // Add invalid payload for ${operation} ${moduleName}
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
        // Missing required fields
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
        ${getValidationSuccessPayload(operation, moduleName)}
      };

      const result = validatePayload(payload);
      expect(result.success).toBe(true);
    });
  });
});
`;
};

/**
 * Generates duplicate test content
 */
const generateDuplicateTestContent = (
  operation: string,
  _capitalizedModule: string,
  capitalizedOperation: string,
  moduleName: string
): string => {
  return `import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../../src/app';
import type { typePayload, typeResult, typeResultData, typeResultError } from '../../../src/apis/${moduleName}/types/${operation}.${moduleName}';

describe('${capitalizedOperation} ${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} - Duplicate Tests', () => {
  it('should return 409 for duplicate ${moduleName}', async () => {
    const payload: typePayload = {
      ${getSuccessPayload(operation, moduleName)}
    };

    // First creation should succeed
    await request(app)
      .${getHttpMethod(operation)}('${getApiEndpoint(operation, moduleName)}')
      ${getRequestBody(operation)}
      .expect(${getSuccessStatusCode(operation)});

    // Second creation should fail with duplicate error
    const response = await request(app)
      .${getHttpMethod(operation)}('${getApiEndpoint(operation, moduleName)}')
      ${getRequestBody(operation)}
      .expect(409);

    const result: typeResult = response.body;
    expect(result.data).toBeNull();
    
    if (result.error) {
      const error: typeResultError = result.error;
      expect(error.code).toBe('DUPLICATE_ENTRY');
    }
  });

  it('should handle duplicate email addresses', async () => {
    const payload: typePayload = {
      ${getSuccessPayload(operation, moduleName)}
    };

    // Test duplicate email scenario
    const response = await request(app)
      .${getHttpMethod(operation)}('${getApiEndpoint(operation, moduleName)}')
      ${getRequestBody(operation)}
      .expect(409);

    const result: typeResult = response.body;
    expect(result.data).toBeNull();
    
    if (result.error) {
      const error: typeResultError = result.error;
      expect(error.code).toBe('DUPLICATE_EMAIL');
    }
  });
});
`;
};

/**
 * Generates unauthorized test content
 */
const generateUnauthorizedTestContent = (
  operation: string,
  _capitalizedModule: string,
  capitalizedOperation: string,
  moduleName: string
): string => {
  return `import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../../src/app';
import type { typePayload, typeResult, typeResultData, typeResultError } from '../../../src/apis/${moduleName}/types/${operation}.${moduleName}';

describe('${capitalizedOperation} ${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} - Unauthorized Tests', () => {
  it('should return 401 for missing authentication token', async () => {
    const payload: typePayload = {
      ${getSuccessPayload(operation, moduleName)}
    };

    const response = await request(app)
      .${getHttpMethod(operation)}('${getApiEndpoint(operation, moduleName)}')
      ${getRequestBody(operation)}
      .expect(401);

    const result: typeResult = response.body;
    expect(result.data).toBeNull();
    
    if (result.error) {
      const error: typeResultError = result.error;
      expect(error.code).toBe('UNAUTHORIZED');
    }
  });

  it('should return 401 for invalid authentication token', async () => {
    const payload: typePayload = {
      ${getSuccessPayload(operation, moduleName)}
    };

    const response = await request(app)
      .${getHttpMethod(operation)}('${getApiEndpoint(operation, moduleName)}')
      ${getRequestBody(operation)}
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);

    const result: typeResult = response.body;
    expect(result.data).toBeNull();
    
    if (result.error) {
      const error: typeResultError = result.error;
      expect(error.code).toBe('INVALID_TOKEN');
    }
  });

  it('should return 403 for insufficient permissions', async () => {
    const payload: typePayload = {
      ${getSuccessPayload(operation, moduleName)}
    };

    const response = await request(app)
      .${getHttpMethod(operation)}('${getApiEndpoint(operation, moduleName)}')
      ${getRequestBody(operation)}
      .set('Authorization', 'Bearer limited-permissions-token')
      .expect(403);

    const result: typeResult = response.body;
    expect(result.data).toBeNull();
    
    if (result.error) {
      const error: typeResultError = result.error;
      expect(error.code).toBe('INSUFFICIENT_PERMISSIONS');
    }
  });
});
`;
};


/**
 * Generates not found test content
 */
const generateNotFoundTestContent = (
  operation: string,
  _capitalizedModule: string,
  capitalizedOperation: string,
  moduleName: string
): string => {
  return `import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../../src/app';
import type { typePayload, typeResult, typeResultData, typeResultError } from '../../../src/apis/${moduleName}/types/${operation}.${moduleName}';

describe('${capitalizedOperation} ${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} - Not Found Tests', () => {
  it('should return 404 for non-existent ${moduleName}', async () => {
    const nonExistentId = 'non-existent-id';
    const payload: typePayload = {
      ${getSuccessPayload(operation, moduleName)}
    };

    const response = await request(app)
      .${getHttpMethod(operation)}('${getApiEndpoint(operation, moduleName)}')
      ${getRequestBody(operation)}
      .expect(404);

    const result: typeResult = response.body;
    expect(result.data).toBeNull();
    
    if (result.error) {
      const error: typeResultError = result.error;
      expect(error.code).toBe('NOT_FOUND');
    }
  });

  it('should return 404 for deleted ${moduleName}', async () => {
    const deletedId = 'deleted-id';
    const payload: typePayload = {
      ${getSuccessPayload(operation, moduleName)}
    };

    const response = await request(app)
      .${getHttpMethod(operation)}('${getApiEndpoint(operation, moduleName)}')
      ${getRequestBody(operation)}
      .expect(404);

    const result: typeResult = response.body;
    expect(result.data).toBeNull();
    
    if (result.error) {
      const error: typeResultError = result.error;
      expect(error.code).toBe('NOT_FOUND');
    }
  });

  it('should return 404 for soft-deleted ${moduleName}', async () => {
    const softDeletedId = 'soft-deleted-id';
    const payload: typePayload = {
      ${getSuccessPayload(operation, moduleName)}
    };

    const response = await request(app)
      .${getHttpMethod(operation)}('${getApiEndpoint(operation, moduleName)}')
      ${getRequestBody(operation)}
      .expect(404);

    const result: typeResult = response.body;
    expect(result.data).toBeNull();
    
    if (result.error) {
      const error: typeResultError = result.error;
      expect(error.code).toBe('NOT_FOUND');
    }
  });
});
`;
};

/**
 * Generates invalid ID test content
 */
const generateInvalidIdTestContent = (
  operation: string,
  _capitalizedModule: string,
  capitalizedOperation: string,
  moduleName: string
): string => {
  return `import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../../src/app';
import type { typePayload, typeResult, typeResultData, typeResultError } from '../../../src/apis/${moduleName}/types/${operation}.${moduleName}';

describe('${capitalizedOperation} ${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} - Invalid ID Tests', () => {
  it('should return 400 for invalid ID format', async () => {
    const invalidId = 'invalid-id-format';
    const payload: typePayload = {
      ${getSuccessPayload(operation, moduleName)}
    };

    const response = await request(app)
      .${getHttpMethod(operation)}('${getApiEndpoint(operation, moduleName)}')
      ${getRequestBody(operation)}
      .expect(400);

    const result: typeResult = response.body;
    expect(result.data).toBeNull();
    
    if (result.error) {
      const error: typeResultError = result.error;
      expect(error.code).toBe('INVALID_ID_FORMAT');
    }
  });

  it('should return 400 for malformed UUID', async () => {
    const malformedUuid = 'not-a-uuid';
    const payload: typePayload = {
      ${getSuccessPayload(operation, moduleName)}
    };

    const response = await request(app)
      .${getHttpMethod(operation)}('${getApiEndpoint(operation, moduleName)}')
      ${getRequestBody(operation)}
      .expect(400);

    const result: typeResult = response.body;
    expect(result.data).toBeNull();
    
    if (result.error) {
      const error: typeResultError = result.error;
      expect(error.code).toBe('INVALID_UUID');
    }
  });

  it('should return 400 for empty ID', async () => {
    const emptyId = '';
    const payload: typePayload = {
      ${getSuccessPayload(operation, moduleName)}
    };

    const response = await request(app)
      .${getHttpMethod(operation)}('${getApiEndpoint(operation, moduleName)}')
      ${getRequestBody(operation)}
      .expect(400);

    const result: typeResult = response.body;
    expect(result.data).toBeNull();
    
    if (result.error) {
      const error: typeResultError = result.error;
      expect(error.code).toBe('INVALID_ID_FORMAT');
    }
  });

  it('should return 400 for null ID', async () => {
    const nullId = null;
    const payload: typePayload = {
      ${getSuccessPayload(operation, moduleName)}
    };

    const response = await request(app)
      .${getHttpMethod(operation)}('${getApiEndpoint(operation, moduleName)}')
      ${getRequestBody(operation)}
      .expect(400);

    const result: typeResult = response.body;
    expect(result.data).toBeNull();
    
    if (result.error) {
      const error: typeResultError = result.error;
      expect(error.code).toBe('INVALID_ID_FORMAT');
    }
  });
});
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


const generateGenericTestContent = (
  operation: string,
  _capitalizedModule: string,
  _capitalizedOperation: string,
  moduleName: string,
  testType: string
): string => {
  return `// Generic test content for ${operation} ${moduleName} - ${testType}`;
};
