/**
 * Hono CRUD test templates
 */

import { getModuleNaming } from '../../shared/naming.utils';

export const getCrudTestFileNames = ({ moduleName }: { moduleName: string }): string[] => {
  const naming = getModuleNaming(moduleName);
  return [
    `create.${naming.file}.spec.ts`,
    `get.${naming.file}.spec.ts`,
    `list.${naming.file}.spec.ts`,
    `update.${naming.file}.spec.ts`,
    `delete.${naming.file}.spec.ts`,
  ];
};

export const generateCrudTestContent = ({
  operation,
  moduleName,
  testType,
}: {
  operation: string;
  moduleName: string;
  testType: 'success' | 'validation' | 'duplicate' | 'unauthorized' | 'not-found' | 'invalid-id';
}): string => {
  const naming = getModuleNaming(moduleName);
  const capitalizedOperation = operation.charAt(0).toUpperCase() + operation.slice(1);

  // Generate different content based on testType
  switch (testType) {
    case 'success':
      switch (operation) {
        case 'create':
          return generateCreateTestContent(naming, capitalizedOperation);
        case 'get':
          return generateGetTestContent(naming, capitalizedOperation);
        case 'list':
          return generateListTestContent(naming, capitalizedOperation);
        case 'update':
          return generateUpdateTestContent(naming, capitalizedOperation);
        case 'delete':
          return generateDeleteTestContent(naming, capitalizedOperation);
        default:
          return generateGenericTestContent(naming, capitalizedOperation, operation);
      }
    case 'validation':
      // Return validation-specific test content
      return `import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createApp } from 'hono';
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
    case 'duplicate':
      // Return duplicate-specific test content for create operation
      return `import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createApp } from 'hono';
import { create${naming.class} } from '../controllers/create.${naming.file}';

describe('Duplicate tests for create ${naming.variable}', () => {
  let mockContext: any;

  beforeEach(() => {
    // Create a mock Hono context
    mockContext = {
      req: {
        json: vi.fn().mockResolvedValue({
          name: 'Test ${naming.class}',
          // Add fields that would cause a duplicate error
        }),
        header: vi.fn().mockReturnValue('test-request-id'),
      },
      json: vi.fn(),
    };
  });

  it('should handle duplicate ${naming.variable} error', async () => {
    // Mock the handler to return a duplicate error
    vi.mock('../handlers/create.${naming.file}', () => ({
      default: vi.fn().mockResolvedValue({
        data: null,
        error: {
          code: 'DUPLICATE_ENTRY',
          message: 'Duplicate entry error',
          statusCode: 409,
          requestId: 'test-request-id'
        }
      })
    }));

    const create${naming.class}Handler = (await import('../handlers/create.${naming.file}')).default;

    await create${naming.class}(mockContext);
    
    expect(mockContext.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'DUPLICATE_ENTRY',
        })
      }),
      409
    );
  });
});
`;
    case 'unauthorized':
      // Return unauthorized-specific test content
      return `import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createApp } from 'hono';
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
    case 'not-found':
      // Return not-found-specific test content for get, update, delete operations
      return `import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createApp } from 'hono';
import { ${operation}${naming.class} } from '../controllers/${operation}.${naming.file}';

describe('Not found tests for ${operation} ${naming.variable}', () => {
  let mockContext: any;

  beforeEach(() => {
    // Create a mock Hono context
    mockContext = {
      req: {
        param: vi.fn().mockReturnValue('non-existent-id'),
        json: vi.fn().mockResolvedValue({}),
        header: vi.fn().mockReturnValue('test-request-id'),
      },
      json: vi.fn(),
    };
  });

  it('should return not found error for non-existent ${naming.variable}', async () => {
    // Mock the handler to return a not found error
    vi.mock('../handlers/${operation}.${naming.file}', () => ({
      default: vi.fn().mockResolvedValue({
        data: null,
        error: {
          code: 'NOT_FOUND',
          message: '${naming.class} not found',
          statusCode: 404,
          requestId: 'test-request-id'
        }
      })
    }));

    const ${operation}${naming.class}Handler = (await import('../handlers/${operation}.${naming.file}')).default;

    await ${operation}${naming.class}(mockContext);
    
    expect(mockContext.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'NOT_FOUND',
        })
      }),
      404
    );
  });
});
`;
    case 'invalid-id':
      // Return invalid-id-specific test content
      return `import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createApp } from 'hono';
import { ${operation}${naming.class} } from '../controllers/${operation}.${naming.file}';

describe('Invalid ID tests for ${operation} ${naming.variable}', () => {
  let mockContext: any;

  beforeEach(() => {
    // Create a mock Hono context
    mockContext = {
      req: {
        param: vi.fn().mockReturnValue('invalid-id-format'),
        json: vi.fn().mockResolvedValue({}),
        header: vi.fn().mockReturnValue('test-request-id'),
      },
      json: vi.fn(),
    };
  });

  it('should return error for invalid ID format', async () => {
    // Mock the validator to return validation error
    vi.mock('../validators/${operation}.${naming.file}', () => ({
      validatePayload: vi.fn().mockReturnValue({
        success: false,
        error: { message: 'Invalid ID format' }
      })
    }));

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
    default:
      // Default to the operation-specific content
      switch (operation) {
        case 'create':
          return generateCreateTestContent(naming, capitalizedOperation);
        case 'get':
          return generateGetTestContent(naming, capitalizedOperation);
        case 'list':
          return generateListTestContent(naming, capitalizedOperation);
        case 'update':
          return generateUpdateTestContent(naming, capitalizedOperation);
        case 'delete':
          return generateDeleteTestContent(naming, capitalizedOperation);
        default:
          return generateGenericTestContent(naming, capitalizedOperation, operation);
      }
  }
};

const generateCreateTestContent = (
  naming: ReturnType<typeof getModuleNaming>,
  _capitalizedOperation: string,
): string => {
  return `import { describe, it, expect, beforeEach } from 'vitest';
import { createApp } from 'hono';
import create${naming.class}Controller from '../controllers/create.${naming.file}';
import { typeResult } from '../types/create.${naming.file}';

// Mock the handler
vi.mock('../handlers/create.${naming.file}', () => ({
  default: vi.fn().mockResolvedValue({
    data: { ${naming.variable}Id: 'test-id', name: 'Test ${naming.class}', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    error: null
  })
}));

import create${naming.class}Handler from '../handlers/create.${naming.file}';

describe('create${naming.class}Controller', () => {
  let app: ReturnType<typeof createApp>;
  let mockContext: any;

  beforeEach(() => {
    app = createApp();
    app.post('/', create${naming.class}Controller);
    
    // Create a mock Hono context
    mockContext = {
      req: {
        json: vi.fn().mockResolvedValue({
          name: 'Test ${naming.class}',
          description: 'Test description',
        }),
        header: vi.fn().mockReturnValue('test-request-id'),
      },
      json: vi.fn(),
    };
  });

  it('should create a new ${naming.variable}', async () => {
    const result = await create${naming.class}Controller(mockContext);
    
    expect(create${naming.class}Handler).toHaveBeenCalledWith({
      name: 'Test ${naming.class}',
      description: 'Test description',
      requestId: 'test-request-id'
    });
    expect(mockContext.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: 'Test ${naming.class}',
        })
      }),
      201
    );
  });

  it('should return validation error for invalid input', async () => {
    // Test with an invalid payload
    const invalidContext = {
      req: {
        json: vi.fn().mockResolvedValue({ name: '' }), // Invalid: empty name
        header: vi.fn().mockReturnValue('test-request-id'),
      },
      json: vi.fn(),
    };

    await create${naming.class}Controller(invalidContext);
    
    expect(invalidContext.json).toHaveBeenCalledWith(
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
};

const generateGetTestContent = (
  naming: ReturnType<typeof getModuleNaming>,
  _capitalizedOperation: string,
): string => {
  return `import { describe, it, expect, beforeEach } from 'vitest';
import { createApp } from 'hono';
import get${naming.class}Controller from '../controllers/get.${naming.file}';

// Mock the handler
vi.mock('../handlers/get.${naming.file}', () => ({
  default: vi.fn().mockResolvedValue({
    data: { ${naming.variable}Id: 'test-id', name: 'Test ${naming.class}', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    error: null
  })
}));

import get${naming.class}Handler from '../handlers/get.${naming.file}';

describe('get${naming.class}Controller', () => {
  let mockContext: any;

  beforeEach(() => {
    // Create a mock Hono context
    mockContext = {
      req: {
        param: vi.fn().mockReturnValue('test-id'),
        header: vi.fn().mockReturnValue('test-request-id'),
      },
      json: vi.fn(),
    };
  });

  it('should retrieve an existing ${naming.variable}', async () => {
    await get${naming.class}Controller(mockContext);
    
    expect(get${naming.class}Handler).toHaveBeenCalledWith({
      id: 'test-id',
      requestId: 'test-request-id'
    });
    expect(mockContext.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          ${naming.variable}Id: 'test-id',
        })
      }),
      200
    );
  });

  it('should return validation error for invalid input', async () => {
    // Test with an invalid id
    const invalidContext = {
      req: {
        param: vi.fn().mockReturnValue(''), // Invalid: empty id
        header: vi.fn().mockReturnValue('test-request-id'),
      },
      json: vi.fn(),
    };

    await get${naming.class}Controller(invalidContext);
    
    expect(invalidContext.json).toHaveBeenCalledWith(
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
};

const generateListTestContent = (
  naming: ReturnType<typeof getModuleNaming>,
  _capitalizedOperation: string,
): string => {
  return `import { describe, it, expect, beforeEach } from 'vitest';
import { createApp } from 'hono';
import list${naming.class}sController from '../controllers/list.${naming.file}';

// Mock the handler
vi.mock('../handlers/list.${naming.file}', () => ({
  default: vi.fn().mockResolvedValue({
    data: {
      items: [{ ${naming.variable}Id: 'test-id', name: 'Test ${naming.class}', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }],
      _metadata: { page: 1, limit: 10, total_count: 1, total_pages: 1, has_next: false, has_prev: false }
    },
    error: null
  })
}));

import list${naming.class}sHandler from '../handlers/list.${naming.file}';

describe('list${naming.class}sController', () => {
  let mockContext: any;

  beforeEach(() => {
    // Create a mock Hono context
    mockContext = {
      req: {
        query: vi.fn().mockReturnValue({ page: '1', limit: '10' }),
        header: vi.fn().mockReturnValue('test-request-id'),
      },
      json: vi.fn(),
    };
  });

  it('should retrieve a list of ${naming.plural}', async () => {
    await list${naming.class}sController(mockContext);
    
    expect(list${naming.class}sHandler).toHaveBeenCalledWith({
      page: '1',
      limit: '10',
      requestId: 'test-request-id'
    });
    expect(mockContext.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          items: expect.arrayContaining([expect.objectContaining({
            name: 'Test ${naming.class}',
          })])
        })
      }),
      200
    );
  });
});
`;
};

const generateUpdateTestContent = (
  naming: ReturnType<typeof getModuleNaming>,
  _capitalizedOperation: string,
): string => {
  return `import { describe, it, expect, beforeEach } from 'vitest';
import { createApp } from 'hono';
import update${naming.class}Controller from '../controllers/update.${naming.file}';

// Mock the handler
vi.mock('../handlers/update.${naming.file}', () => ({
  default: vi.fn().mockResolvedValue({
    data: { ${naming.variable}Id: 'test-id', name: 'Updated ${naming.class}', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    error: null
  })
}));

import update${naming.class}Handler from '../handlers/update.${naming.file}';

describe('update${naming.class}Controller', () => {
  let mockContext: any;

  beforeEach(() => {
    // Create a mock Hono context
    mockContext = {
      req: {
        param: vi.fn().mockReturnValue('test-id'),
        json: vi.fn().mockResolvedValue({
          name: 'Updated ${naming.class}',
          description: 'Updated description',
        }),
        header: vi.fn().mockReturnValue('test-request-id'),
      },
      json: vi.fn(),
    };
  });

  it('should update an existing ${naming.variable}', async () => {
    await update${naming.class}Controller(mockContext);
    
    expect(update${naming.class}Handler).toHaveBeenCalledWith({
      id: 'test-id',
      name: 'Updated ${naming.class}',
      description: 'Updated description',
      requestId: 'test-request-id'
    });
    expect(mockContext.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: 'Updated ${naming.class}',
        })
      }),
      200
    );
  });
});
`;
};

const generateDeleteTestContent = (
  naming: ReturnType<typeof getModuleNaming>,
  _capitalizedOperation: string,
): string => {
  return `import { describe, it, expect, beforeEach } from 'vitest';
import { createApp } from 'hono';
import delete${naming.class}Controller from '../controllers/delete.${naming.file}';

// Mock the handler
vi.mock('../handlers/delete.${naming.file}', () => ({
  default: vi.fn().mockResolvedValue({
    data: { deleted_at: new Date().toISOString() },
    error: null
  })
}));

import delete${naming.class}Handler from '../handlers/delete.${naming.file}';

describe('delete${naming.class}Controller', () => {
  let mockContext: any;

  beforeEach(() => {
    // Create a mock Hono context
    mockContext = {
      req: {
        param: vi.fn().mockReturnValue('test-id'),
        json: vi.fn().mockResolvedValue({}), // DELETE might not have body
        header: vi.fn().mockReturnValue('test-request-id'),
      },
      json: vi.fn(),
    };
  });

  it('should delete an existing ${naming.variable}', async () => {
    await delete${naming.class}Controller(mockContext);
    
    expect(delete${naming.class}Handler).toHaveBeenCalledWith({
      id: 'test-id',
      requestId: 'test-request-id'
    });
    expect(mockContext.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          deleted_at: expect.any(String),
        })
      }),
      200
    );
  });
});
`;
};

const generateGenericTestContent = (
  naming: ReturnType<typeof getModuleNaming>,
  _capitalizedOperation: string,
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