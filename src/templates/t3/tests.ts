/**
 * T3 test templates
 */

import { getModuleNaming } from '../shared/naming.utils';

export const generateTestsContent = ({ moduleName }: { moduleName: string }): string => {
  const naming = getModuleNaming(moduleName);

  return `import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createCaller } from '../router';
import { 
  create${naming.class}Service,
  get${naming.class}Service,
  list${naming.class}sService,
  update${naming.class}Service,
  delete${naming.class}Service,
} from '../services/${naming.file}.service';

// Mock the service functions
vi.mock('../services/${naming.file}.service');

describe('${naming.variable} procedures', () => {
  let caller: ReturnType<typeof createCaller>;

  beforeEach(() => {
    // Create a caller with mocked context
    caller = createCaller({} as any);
  });

  describe('create${naming.class}', () => {
    it('should create a new ${naming.variable}', async () => {
      const mock${naming.class} = {
        ${naming.variable}Id: 'test-id',
        name: 'Test ${naming.class}',
        description: 'Test description',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Mock the service function to return the test data
      (create${naming.class}Service as vi.Mock).mockResolvedValue(mock${naming.class});

      const result = await caller.create${naming.class}({
        name: 'Test ${naming.class}',
        description: 'Test description',
      });

      expect(result).toEqual(mock${naming.class});
      expect(create${naming.class}Service).toHaveBeenCalledWith({
        name: 'Test ${naming.class}',
        description: 'Test description',
      });
    });
  });

  describe('get${naming.class}', () => {
    it('should retrieve an existing ${naming.variable}', async () => {
      const mock${naming.class} = {
        ${naming.variable}Id: 'test-id',
        name: 'Test ${naming.class}',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      (get${naming.class}Service as vi.Mock).mockResolvedValue(mock${naming.class});

      const result = await caller.get${naming.class}({
        ${naming.variable}Id: 'test-id',
      });

      expect(result).toEqual(mock${naming.class});
      expect(get${naming.class}Service).toHaveBeenCalledWith('test-id');
    });
  });

  describe('list${naming.class}s', () => {
    it('should return a list of ${naming.plural}', async () => {
      const mockResult = {
        items: [{
          ${naming.variable}Id: 'test-id',
          name: 'Test ${naming.class}',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }],
        _metadata: {
          page: 1,
          limit: 10,
          total_count: 1,
          total_pages: 1,
          has_next: false,
          has_prev: false,
        }
      };

      (list${naming.class}sService as vi.Mock).mockResolvedValue(mockResult);

      const result = await caller.list${naming.class}s({
        page: 1,
        limit: 10,
      });

      expect(result).toEqual(mockResult);
      expect(list${naming.class}sService).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
    });
  });

  describe('update${naming.class}', () => {
    it('should update an existing ${naming.variable}', async () => {
      const mock${naming.class} = {
        ${naming.variable}Id: 'test-id',
        name: 'Updated ${naming.class}',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      (update${naming.class}Service as vi.Mock).mockResolvedValue(mock${naming.class});

      const result = await caller.update${naming.class}({
        ${naming.variable}Id: 'test-id',
        name: 'Updated ${naming.class}',
      });

      expect(result).toEqual(mock${naming.class});
      expect(update${naming.class}Service).toHaveBeenCalledWith('test-id', {
        name: 'Updated ${naming.class}',
      });
    });
  });

  describe('delete${naming.class}', () => {
    it('should delete an existing ${naming.variable}', async () => {
      (delete${naming.class}Service as vi.Mock).mockResolvedValue(true);

      const result = await caller.delete${naming.class}({
        ${naming.variable}Id: 'test-id',
      });

      expect(result).toBe(true);
      expect(delete${naming.class}Service).toHaveBeenCalledWith('test-id');
    });
  });
});
`;
};

// For more specific test files based on operation and test type
export const generateSpecificTestContent = ({ operation, testType, moduleName }: { operation: string; testType: string; moduleName: string }): string => {
  const naming = getModuleNaming(moduleName);
  
  // For t3 test structure with operation and testType (e.g., "success/basic.test.ts")
  const [category, testFileName] = testType.split('/');
  if (!category || !testFileName) {
    // If it's not in the expected format, generate basic content
    return `// Test file for ${operation} operation in ${naming.class}
// Category: ${testType}
// This is a T3 test file
`;
  }

  // Different content based on test type
  switch (category) {
    case 'success':
      return `import { describe, it, expect, vi } from 'vitest';
import { ${operation}${naming.class} } from '../../procedures/${operation}.${naming.file}';
import { ${naming.class}Service } from '../../services/${naming.file}.service';

vi.mock('../../services/${naming.file}.service');

describe('${operation} ${naming.variable} - Success Tests', () => {
  it('should handle ${operation} ${naming.variable} successfully', async () => {
    // Mock the service function to return success data
    (async ${naming.class}Service as any).mockResolvedValue({ success: true });

    // Add your test implementation here
    expect(true).toBe(true);
  });

  it('should handle ${operation} ${naming.variable} with variations', async () => {
    // Test other success variations
    expect(true).toBe(true);
  });
});
`;
    case 'validation':
      return `import { describe, it, expect } from 'vitest';
import { ${operation}${naming.class} } from '../../procedures/${operation}.${naming.file}';

describe('${operation} ${naming.variable} - Validation Tests', () => {
  it('should validate required fields for ${operation}', async () => {
    // Add validation tests here
    expect(true).toBe(true);
  });

  it('should validate field types for ${operation}', async () => {
    // Add type validation tests here
    expect(true).toBe(true);
  });
});
`;
    case 'failure':
      return `import { describe, it, expect, vi } from 'vitest';
import { ${operation}${naming.class} } from '../../procedures/${operation}.${naming.file}';

vi.mock('../../services/${naming.file}.service');

describe('${operation} ${naming.variable} - Failure Tests', () => {
  it('should handle unauthorized ${operation} ${naming.variable}', async () => {
    // Mock service to throw unauthorized error
    (async ${naming.class}Service as any).mockRejectedValue(new Error('UNAUTHORIZED'));

    // Add your failure test implementation here
    await expect(Promise.reject(new Error('UNAUTHORIZED'))).rejects.toThrow('UNAUTHORIZED');
  });
});
`;
    default:
      return `// Test file for ${operation} operation in ${naming.class}
// Category: ${category}, Test: ${testFileName}
// This is a T3 test file
`;
  }
};

export const getTestsFileName = ({ moduleName }: { moduleName: string }): string => {
  const naming = getModuleNaming(moduleName);
  return `${naming.file}.test.ts`;
};