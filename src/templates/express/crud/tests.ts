/**
 * Express CRUD test templates
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
      return `import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app from '../../../app'; // Adjust path to your express app

describe('Validation tests for ${operation} ${naming.variable}', () => {
  it('should return validation error for invalid input', async () => {
    const invalidPayload = {}; // Provide an invalid payload for ${operation}
    
    let endpoint = '';
    switch('${operation}') {
      case 'create':
        endpoint = '/api/${naming.url}s';
        break;
      case 'get':
        endpoint = '/api/${naming.url}s/invalid-id';
        break;
      case 'update':
        endpoint = '/api/${naming.url}s/invalid-id';
        break;
      case 'delete':
        endpoint = '/api/${naming.url}s/invalid-id';
        break;
      case 'list':
        endpoint = '/api/${naming.url}s';
        break;
      default:
        endpoint = '/api/${naming.url}s';
    }

    const response = await request(app)
      .${operation === 'get' || operation === 'list' ? 'get' : operation === 'create' ? 'post' : operation === 'update' ? 'put' : 'delete'}(endpoint)
      .send(invalidPayload)
      .expect(400);

    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
`;
    case 'duplicate':
      // Return duplicate-specific test content for create operation
      return `import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app from '../../../app'; // Adjust path to your express app

describe('Duplicate tests for ${operation} ${naming.variable}', () => {
  it('should handle duplicate ${naming.variable} error', async () => {
    // Test for duplicate data case (only applicable for create)
    const duplicate${naming.class} = {
      name: 'Test ${naming.class}',
      // Add fields that would cause a duplicate error
    };

    const response = await request(app)
      .post('/api/${naming.url}s')
      .send(duplicate${naming.class})
      .expect(409); // Conflict status for duplicate

    expect(response.body.error.code).toBe('DUPLICATE_ENTRY');
  });
});
`;
    case 'unauthorized':
      // Return unauthorized-specific test content
      return `import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app from '../../../app'; // Adjust path to your express app

describe('Unauthorized tests for ${operation} ${naming.variable}', () => {
  it('should return unauthorized error when no auth provided', async () => {
    const response = await request(app)
      .${operation === 'get' || operation === 'list' ? 'get' : operation === 'create' ? 'post' : operation === 'update' ? 'put' : 'delete'}('/api/${naming.url}s')
      .expect(401);

    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });
});
`;
    case 'not-found':
      // Return not-found-specific test content for get, update, delete operations
      return `import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app from '../../../app'; // Adjust path to your express app

describe('Not found tests for ${operation} ${naming.variable}', () => {
  it('should return not found error for non-existent ${naming.variable}', async () => {
    const invalidId = 'non-existent-id';

    const response = await request(app)
      .${operation === 'get' ? 'get' : operation === 'update' ? 'put' : 'delete'}('/api/${naming.url}s/\${invalidId}')
      .expect(404);

    expect(response.body.error.code).toBe('NOT_FOUND');
  });
});
`;
    case 'invalid-id':
      // Return invalid-id-specific test content
      return `import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app from '../../../app'; // Adjust path to your express app

describe('Invalid ID tests for ${operation} ${naming.variable}', () => {
  it('should return error for invalid ID format', async () => {
    const invalidId = 'invalid-id-format';

    const response = await request(app)
      .${operation === 'get' ? 'get' : operation === 'update' ? 'put' : 'delete'}('/api/${naming.url}s/\${invalidId}')
      .expect(400);

    expect(response.body.error.code).toBe('VALIDATION_ERROR');
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
  return `import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app from '../../../app'; // Adjust path to your express app

describe('POST /api/${naming.url}s', () => {
  it('should create a new ${naming.variable}', async () => {
    const new${naming.class} = {
      name: 'Test ${naming.class}',
      description: 'Test description',
    };

    const response = await request(app)
      .post('/api/${naming.url}s')
      .send(new${naming.class})
      .expect(201);

    expect(response.body.data).toHaveProperty('${naming.variable}Id');
    expect(response.body.data.name).toBe(new${naming.class}.name);
  });

  it('should return validation error for invalid input', async () => {
    const invalid${naming.class} = {
      name: '', // Invalid: empty name
    };

    const response = await request(app)
      .post('/api/${naming.url}s')
      .send(invalid${naming.class})
      .expect(400);

    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
`;
};

const generateGetTestContent = (
  naming: ReturnType<typeof getModuleNaming>,
  _capitalizedOperation: string,
): string => {
  return `import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app from '../../../app'; // Adjust path to your express app

describe('GET /api/${naming.url}s/:id', () => {
  it('should retrieve an existing ${naming.variable}', async () => {
    const ${naming.variable}Id = 'test-id'; // Replace with a valid ID

    const response = await request(app)
      .get(\`/api/${naming.url}s/\${${naming.variable}Id}\`)
      .expect(200);

    expect(response.body.data).toHaveProperty('${naming.variable}Id', ${naming.variable}Id);
  });

  it('should return not found error for non-existent ${naming.variable}', async () => {
    const invalidId = 'invalid-id';

    const response = await request(app)
      .get(\`/api/${naming.url}s/\${invalidId}\`)
      .expect(404);

    expect(response.body.error.code).toBe('NOT_FOUND');
  });
});
`;
};

const generateListTestContent = (
  naming: ReturnType<typeof getModuleNaming>,
  _capitalizedOperation: string,
): string => {
  return `import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app from '../../../app'; // Adjust path to your express app

describe('GET /api/${naming.url}s', () => {
  it('should retrieve a list of ${naming.plural}', async () => {
    const response = await request(app)
      .get('/api/${naming.url}s')
      .query({ page: 1, limit: 10 })
      .expect(200);

    expect(response.body.data).toHaveProperty('items');
    expect(Array.isArray(response.body.data.items)).toBe(true);
    expect(response.body.data).toHaveProperty('_metadata');
  });

  it('should handle query parameters correctly', async () => {
    const response = await request(app)
      .get('/api/${naming.url}s')
      .query({ search: 'test', status: 'active' })
      .expect(200);

    expect(response.body.data).toHaveProperty('items');
  });
});
`;
};

const generateUpdateTestContent = (
  naming: ReturnType<typeof getModuleNaming>,
  _capitalizedOperation: string,
): string => {
  return `import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app from '../../../app'; // Adjust path to your express app

describe('PUT /api/${naming.url}s/:id', () => {
  it('should update an existing ${naming.variable}', async () => {
    const ${naming.variable}Id = 'test-id'; // Replace with a valid ID
    const updateData = {
      name: 'Updated ${naming.class}',
      description: 'Updated description',
    };

    const response = await request(app)
      .put(\`/api/${naming.url}s/\${${naming.variable}Id}\`)
      .send(updateData)
      .expect(200);

    expect(response.body.data.name).toBe(updateData.name);
  });

  it('should return validation error for invalid input', async () => {
    const invalidId = 'invalid-id';
    const updateData = {
      name: '', // Invalid: empty name
    };

    const response = await request(app)
      .put(\`/api/${naming.url}s/\${invalidId}\`)
      .send(updateData)
      .expect(400);

    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
`;
};

const generateDeleteTestContent = (
  naming: ReturnType<typeof getModuleNaming>,
  _capitalizedOperation: string,
): string => {
  return `import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app from '../../../app'; // Adjust path to your express app

describe('DELETE /api/${naming.url}s/:id', () => {
  it('should delete an existing ${naming.variable}', async () => {
    const ${naming.variable}Id = 'test-id'; // Replace with a valid ID

    const response = await request(app)
      .delete(\`/api/${naming.url}s/\${${naming.variable}Id}\`)
      .expect(200);

    expect(response.body.data).toHaveProperty('deleted_at');
  });

  it('should return not found error for non-existent ${naming.variable}', async () => {
    const invalidId = 'invalid-id';

    const response = await request(app)
      .delete(\`/api/${naming.url}s/\${invalidId}\`)
      .expect(404);

    expect(response.body.error.code).toBe('NOT_FOUND');
  });
});
`;
};

const generateGenericTestContent = (
  naming: ReturnType<typeof getModuleNaming>,
  _capitalizedOperation: string,
  operation: string,
): string => {
  return `import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app from '../../../app'; // Adjust path to your express app

describe('${operation.toUpperCase()} /api/${naming.url}s/${operation}', () => {
  it('should handle ${operation} ${naming.variable} request', async () => {
    const payload = {
      // Add appropriate payload for ${operation} ${naming.variable}
    };

    const response = await request(app)
      .post('/api/${naming.url}s/${operation}')
      .send(payload)
      .expect(200);

    // Add appropriate assertions for ${operation} response
    expect(response.body).toBeDefined();
  });
});
`;
};