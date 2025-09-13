/**
 * tRPC test templates
 */

/**
 * Gets the list of tRPC test file names for a module
 */
export const getTrpcTestFileNames = (): string[] => {
  const operations = ['create', 'get', 'list', 'update', 'delete'];
  const testTypes = ['procedure.test.ts', 'validation.test.ts', 'errors.test.ts'];

  const testFiles: string[] = [];

  operations.forEach(operation => {
    testTypes.forEach(testType => {
      testFiles.push(`${operation}/${testType}`);
    });
  });

  // Add shared helpers
  testFiles.push('shared/trpc-helpers.ts');

  return testFiles;
};

/**
 * Generates test file content for tRPC procedures
 */
export const generateTrpcTestContent = ({
  operation,
  testType,
  moduleName,
}: {
  operation: string;
  testType: string;
  moduleName: string;
}): string => {
  switch (testType) {
    case 'procedure.test.ts':
      return generateProcedureTestContent(operation, moduleName);
    case 'validation.test.ts':
      return generateValidationTestContent(operation, moduleName);
    case 'errors.test.ts':
      return generateErrorTestContent(operation, moduleName);
    case 'trpc-helpers.ts':
      return generateTrpcHelpersContent(moduleName);
    default:
      return '';
  }
};

const generateProcedureTestContent = (operation: string, moduleName: string): string => {
  // const capitalizedOperation = operation.charAt(0).toUpperCase() + operation.slice(1);
  const capitalizedModuleName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);

  switch (operation) {
    case 'create':
      return `import { ${moduleName}Router } from '../../../src/apis/${moduleName}/${moduleName}.router';
import { createTrpcTestCaller } from '../shared/trpc-helpers';

describe('${capitalizedModuleName} tRPC Procedures - Create', () => {
  const caller = createTrpcTestCaller(${moduleName}Router);

  it('should create ${moduleName} successfully via tRPC', async () => {
    const input = {
      name: 'Test ${capitalizedModuleName}',
      description: 'Test description',
      status: 'active',
    };

    const result = await caller.create(input);

    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('${moduleName}Id');
    expect(result.data.name).toBe(input.name);
    expect(result.data.description).toBe(input.description);
    expect(result.data.status).toBe(input.status);
  });

  it('should return proper response structure', async () => {
    const input = {
      name: 'Response Test ${capitalizedModuleName}',
      description: 'Response test description',
      status: 'active',
    };

    const result = await caller.create(input);

    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('data');
    expect(result.data).toHaveProperty('${moduleName}Id');
    expect(result.data).toHaveProperty('created_at');
    expect(result.data).toHaveProperty('updated_at');
  });

  it('should handle creation with minimal data', async () => {
    const input = {
      name: 'Minimal ${capitalizedModuleName}',
    };

    const result = await caller.create(input);

    expect(result.success).toBe(true);
    expect(result.data.name).toBe(input.name);
  });
});
`;

    case 'get':
      return `import { ${moduleName}Router } from '../../../src/apis/${moduleName}/${moduleName}.router';
import { createTrpcTestCaller } from '../shared/trpc-helpers';

describe('${capitalizedModuleName} tRPC Procedures - Get', () => {
  const caller = createTrpcTestCaller(${moduleName}Router);

  it('should get ${moduleName} by ID via tRPC', async () => {
    const input = {
      ${moduleName}Id: 'test-${moduleName}-id-123',
    };

    const result = await caller.get(input);

    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('${moduleName}Id');
    expect(result.data.${moduleName}Id).toBe(input.${moduleName}Id);
  });

  it('should return proper response structure for get', async () => {
    const input = {
      ${moduleName}Id: 'test-${moduleName}-id-456',
    };

    const result = await caller.get(input);

    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('data');
    expect(result.data).toHaveProperty('${moduleName}Id');
    expect(result.data).toHaveProperty('name');
    expect(result.data).toHaveProperty('created_at');
    expect(result.data).toHaveProperty('updated_at');
  });

  it('should handle different ID formats', async () => {
    const testIds = ['uuid-format-id', 'numeric-123', 'custom-prefix-id'];

    for (const ${moduleName}Id of testIds) {
      const result = await caller.get({ ${moduleName}Id });
      expect(result.success).toBe(true);
      expect(result.data.${moduleName}Id).toBe(${moduleName}Id);
    }
  });
});
`;

    case 'list':
      return `import { ${moduleName}Router } from '../../../src/apis/${moduleName}/${moduleName}.router';
import { createTrpcTestCaller } from '../shared/trpc-helpers';

describe('${capitalizedModuleName} tRPC Procedures - List', () => {
  const caller = createTrpcTestCaller(${moduleName}Router);

  it('should list ${moduleName}s with default pagination via tRPC', async () => {
    const input = {};

    const result = await caller.list(input);

    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('items');
    expect(result.data).toHaveProperty('_metadata');
    expect(Array.isArray(result.data.items)).toBe(true);
  });

  it('should list ${moduleName}s with custom pagination', async () => {
    const input = {
      page: 2,
      limit: 5,
    };

    const result = await caller.list(input);

    expect(result.success).toBe(true);
    expect(result.data._metadata.page).toBe(input.page);
    expect(result.data._metadata.limit).toBe(input.limit);
  });

  it('should handle filtering and search', async () => {
    const input = {
      search: 'test query',
      status: 'active',
    };

    const result = await caller.list(input);

    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('items');
    expect(Array.isArray(result.data.items)).toBe(true);
  });

  it('should handle sorting options', async () => {
    const input = {
      sort_by: 'created_at',
      sort_order: 'desc' as const,
    };

    const result = await caller.list(input);

    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('items');
  });
});
`;

    case 'update':
      return `import { ${moduleName}Router } from '../../../src/apis/${moduleName}/${moduleName}.router';
import { createTrpcTestCaller } from '../shared/trpc-helpers';

describe('${capitalizedModuleName} tRPC Procedures - Update', () => {
  const caller = createTrpcTestCaller(${moduleName}Router);

  it('should update ${moduleName} successfully via tRPC', async () => {
    const input = {
      ${moduleName}Id: 'test-${moduleName}-id-update',
      name: 'Updated ${capitalizedModuleName} Name',
      description: 'Updated description',
      status: 'updated',
    };

    const result = await caller.update(input);

    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('${moduleName}Id');
    expect(result.data.${moduleName}Id).toBe(input.${moduleName}Id);
    expect(result.data.name).toBe(input.name);
  });

  it('should handle partial updates', async () => {
    const input = {
      ${moduleName}Id: 'test-${moduleName}-id-partial',
      name: 'Partially Updated Name',
    };

    const result = await caller.update(input);

    expect(result.success).toBe(true);
    expect(result.data.name).toBe(input.name);
    expect(result.data).toHaveProperty('${moduleName}Id');
  });

  it('should return updated timestamps', async () => {
    const input = {
      ${moduleName}Id: 'test-${moduleName}-id-timestamp',
      status: 'timestamp-test',
    };

    const result = await caller.update(input);

    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('updated_at');
    expect(new Date(result.data.updated_at)).toBeInstanceOf(Date);
  });
});
`;

    case 'delete':
      return `import { ${moduleName}Router } from '../../../src/apis/${moduleName}/${moduleName}.router';
import { createTrpcTestCaller } from '../shared/trpc-helpers';

describe('${capitalizedModuleName} tRPC Procedures - Delete', () => {
  const caller = createTrpcTestCaller(${moduleName}Router);

  it('should delete ${moduleName} successfully via tRPC', async () => {
    const input = {
      ${moduleName}Id: 'test-${moduleName}-id-delete',
    };

    const result = await caller.delete(input);

    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('deleted_id');
    expect(result.data.deleted_id).toBe(input.${moduleName}Id);
  });

  it('should return proper deletion confirmation', async () => {
    const input = {
      ${moduleName}Id: 'test-${moduleName}-id-confirm',
    };

    const result = await caller.delete(input);

    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('data');
    expect(result.data).toHaveProperty('deleted_id');
    expect(result.data).toHaveProperty('deleted_at');
  });

  it('should handle multiple deletion attempts gracefully', async () => {
    const input = {
      ${moduleName}Id: 'test-${moduleName}-id-multiple',
    };

    // First deletion
    const result1 = await caller.delete(input);
    expect(result1.success).toBe(true);

    // Second deletion attempt  
    const result2 = await caller.delete(input);
    expect(result2.success).toBe(true); // Should handle gracefully
  });
});
`;

    default:
      return '';
  }
};

const generateValidationTestContent = (operation: string, moduleName: string): string => {
  const capitalizedModuleName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);

  return `import { ${moduleName}Router } from '../../../src/apis/${moduleName}/${moduleName}.router';
import { createTrpcTestCaller } from '../shared/trpc-helpers';

describe('${capitalizedModuleName} tRPC Procedures - ${operation.charAt(0).toUpperCase() + operation.slice(1)} Validation', () => {
  const caller = createTrpcTestCaller(${moduleName}Router);

  it('should validate required fields for ${operation}', async () => {
    const invalidInput = {}; // Missing required fields

    await expect(caller.${operation}(invalidInput)).rejects.toThrow();
  });

  it('should validate field types for ${operation}', async () => {
    const invalidInput = {
      // Add type-specific invalid data based on operation
      ${operation === 'create' ? `
      name: 123, // Should be string
      status: "invalid-status", // Should be valid enum
      ` : operation === 'get' ? `
      ${moduleName}Id: 123, // Should be string
      ` : operation === 'update' ? `
      ${moduleName}Id: null, // Should be string
      name: [], // Should be string
      ` : operation === 'delete' ? `
      ${moduleName}Id: {}, // Should be string
      ` : operation === 'list' ? `
      page: "invalid", // Should be number
      limit: -1, // Should be positive
      ` : '// Add validation cases for custom operation'}
    };

    await expect(caller.${operation}(invalidInput)).rejects.toThrow();
  });

  it('should handle edge cases for ${operation} validation', async () => {
    const edgeCases = [
      null,
      undefined,
      "",
      [],
      {},
    ];

    for (const invalidInput of edgeCases) {
      await expect(caller.${operation}(invalidInput)).rejects.toThrow();
    }
  });
});
`;
};

const generateErrorTestContent = (operation: string, moduleName: string): string => {
  const capitalizedModuleName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);

  return `import { ${moduleName}Router } from '../../../src/apis/${moduleName}/${moduleName}.router';
import { createTrpcTestCaller } from '../shared/trpc-helpers';

describe('${capitalizedModuleName} tRPC Procedures - ${operation.charAt(0).toUpperCase() + operation.slice(1)} Error Handling', () => {
  const caller = createTrpcTestCaller(${moduleName}Router);

  it('should handle server errors gracefully for ${operation}', async () => {
    // Test with data that might cause server errors
    const problematicInput = {
      ${operation === 'create' ? `
      name: 'A'.repeat(10000), // Extremely long name
      description: 'Test description',
      ` : operation === 'get' || operation === 'delete' ? `
      ${moduleName}Id: 'non-existent-id-12345',
      ` : operation === 'update' ? `
      ${moduleName}Id: 'non-existent-id-12345',
      name: 'Updated name',
      ` : operation === 'list' ? `
      page: 999999, // Very high page number
      limit: 10000, // Very high limit
      ` : '// Add error cases for custom operation'}
    };

    const result = await caller.${operation}(problematicInput);
    
    // Should handle gracefully and return error response
    expect(result).toHaveProperty('success');
    if (!result.success) {
      expect(result).toHaveProperty('error');
    }
  });

  it('should return consistent error format for ${operation}', async () => {
    const invalidInput = {
      ${operation === 'get' || operation === 'delete' ? `
      ${moduleName}Id: 'definitely-not-found-id',
      ` : operation === 'update' ? `
      ${moduleName}Id: 'definitely-not-found-id',
      name: 'Some name',
      ` : operation === 'create' ? `
      name: '', // Empty required field
      ` : operation === 'list' ? `
      page: -5, // Invalid pagination
      ` : '// Add error cases for custom operation'}
    };

    try {
      const result = await caller.${operation}(invalidInput);
      
      if (!result.success) {
        expect(result).toHaveProperty('error');
        expect(typeof result.error).toBe('string');
      }
    } catch (error) {
      // tRPC validation errors are thrown
      expect(error).toBeDefined();
    }
  });

  it('should handle timeout scenarios for ${operation}', async () => {
    // This test simulates slow operations
    const timeoutInput = {
      ${operation === 'create' ? `
      name: 'Timeout Test ${capitalizedModuleName}',
      description: 'Testing timeout scenarios',
      ` : operation === 'get' || operation === 'delete' ? `
      ${moduleName}Id: 'timeout-test-id',
      ` : operation === 'update' ? `
      ${moduleName}Id: 'timeout-test-id',
      name: 'Timeout update',
      ` : operation === 'list' ? `
      search: 'timeout test query',
      ` : '// Add timeout cases for custom operation'}
    };

    // Should complete within reasonable time
    const startTime = Date.now();
    await caller.${operation}(timeoutInput);
    const duration = Date.now() - startTime;
    
    expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
  });
});
`;
};

const generateTrpcHelpersContent = (moduleName: string): string => {
  return `/**
 * tRPC test helpers for ${moduleName} module
 */
import { appRouter } from '../../../src/trpc/router';
import type { AppRouter } from '../../../src/trpc/router';

/**
 * Creates a test caller for tRPC procedures
 */
export const createTrpcTestCaller = (router: any) => {
  return router.createCaller({
    // Mock context for testing
    user: null,
    session: null,
  });
};

/**
 * Mock tRPC context for testing
 */
export const createMockTrpcContext = () => ({
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'user',
  },
  session: {
    id: 'test-session-id',
    userId: 'test-user-id',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour from now
  },
});

/**
 * Helper to create test data for ${moduleName}
 */
export const createTest${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Data = () => ({
  name: \`Test \${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} \${Date.now()}\`,
  description: 'Test description for automated testing',
  status: 'active',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

/**
 * Helper to assert tRPC response structure
 */
export const assertTrpcResponse = (response: any) => {
  expect(response).toHaveProperty('success');
  expect(typeof response.success).toBe('boolean');
  
  if (response.success) {
    expect(response).toHaveProperty('data');
  } else {
    expect(response).toHaveProperty('error');
  }
};

/**
 * Helper to assert ${moduleName} data structure
 */
export const assert${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Data = (data: any) => {
  expect(data).toHaveProperty('${moduleName}Id');
  expect(data).toHaveProperty('name');
  expect(data).toHaveProperty('created_at');
  expect(data).toHaveProperty('updated_at');
  
  expect(typeof data.${moduleName}Id).toBe('string');
  expect(typeof data.name).toBe('string');
  expect(typeof data.created_at).toBe('string');
  expect(typeof data.updated_at).toBe('string');
};
`;
};
