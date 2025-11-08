/**
 * Hono Custom test templates
 */

import { getModuleNaming } from '../../shared/naming.utils';

export const getCustomTestFileNames = ({ moduleName, customNames }: { moduleName: string; customNames: string[] }): string[] => {
  const naming = getModuleNaming(moduleName);
  return customNames.map(name => `${name}.${naming.file}.spec.ts`);
};

export const generateCustomTestContent = ({
  operation,
  moduleName,
  testType,
}: {
  operation: string;
  moduleName: string;
  testType: 'success' | 'validation' | 'unauthorized';
}): string => {
  const naming = getModuleNaming(moduleName);

  // Generate different content based on testType
  switch (testType) {
    case 'success':
      return generateGenericTestContent(naming, operation);
    case 'validation':
      return `import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ${operation}${naming.class} } from '../controllers/${operation}.${naming.file}';

describe('Validation tests for ${operation} ${naming.variable}', () => {
  let mockContext: any;

  beforeEach(() => {
    // Create a mock Hono context
    mockContext = {
      req: {
        json: vi.fn().mockResolvedValue({}), // Provide an invalid payload for ${operation}
        header: vi.fn().mockReturnValue('test-request-id'),
      },
      json: vi.fn(),
    };
  });

  it('should return validation error for invalid input', async () => {
    await ${operation}${naming.class}(mockContext);
    
    expect(mockContext.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'VALIDATION_ERROR',
        })
      }),
      400
    );
  });
});
`;
    case 'unauthorized':
      return `import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ${operation}${naming.class} } from '../controllers/${operation}.${naming.file}';

describe('Unauthorized tests for ${operation} ${naming.variable}', () => {
  let mockContext: any;

  beforeEach(() => {
    // Create a mock Hono context
    mockContext = {
      req: {
        json: vi.fn().mockResolvedValue({}),
        header: vi.fn().mockReturnValue('test-request-id'),
      },
      json: vi.fn(),
    };
  });

  it('should return unauthorized error when no auth provided', async () => {
    // Mock the handler to return an unauthorized error
    vi.mock('../handlers/${operation}.${naming.file}', () => ({
      default: vi.fn().mockResolvedValue({
        data: null,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Unauthorized access',
          statusCode: 401,
          requestId: 'test-request-id'
        }
      })
    }));

    const ${operation}${naming.class}Handler = (await import('../handlers/${operation}.${naming.file}')).default;

    await ${operation}${naming.class}(mockContext);
    
    expect(mockContext.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'UNAUTHORIZED',
        })
      }),
      401
    );
  });
});
`;
    default:
      return generateGenericTestContent(naming, operation);
  }
};

const generateGenericTestContent = (
  naming: ReturnType<typeof getModuleNaming>,
  operation: string,
): string => {
  return `import { describe, it, expect, beforeEach } from 'vitest';
import { ${operation}${naming.class} } from '../controllers/${operation}.${naming.file}';

// Mock the handler
vi.mock('../handlers/${operation}.${naming.file}', () => ({
  default: vi.fn().mockResolvedValue({
    data: { success: true },
    error: null
  })
}));

import ${operation}${naming.class}Handler from '../handlers/${operation}.${naming.file}';

describe('${operation}${naming.class}', () => {
  let mockContext: any;

  beforeEach(() => {
    // Create a mock Hono context
    mockContext = {
      req: {
        json: vi.fn().mockResolvedValue({
          // Add appropriate payload for ${operation} ${naming.variable}
        }),
        header: vi.fn().mockReturnValue('test-request-id'),
      },
      json: vi.fn(),
    };
  });

  it('should handle ${operation} ${naming.variable} request', async () => {
    const result = await ${operation}${naming.class}(mockContext);
    
    // Add appropriate assertions for ${operation} ${naming.variable} response
    expect(mockContext.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.any(Object),
      }),
      200
    );
  });
});
`;
};