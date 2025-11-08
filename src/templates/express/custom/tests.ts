/**
 * Express Custom test templates
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
      return `import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app from '../../../app'; // Adjust path to your express app

describe('Validation tests for ${operation} ${naming.variable}', () => {
  it('should return validation error for invalid input', async () => {
    const invalidPayload = {}; // Provide an invalid payload for ${operation}
    
    const response = await request(app)
      .post('/api/${naming.url}s/${operation}')
      .send(invalidPayload)
      .expect(400);

    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
`;
    case 'unauthorized':
      return `import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app from '../../../app'; // Adjust path to your express app

describe('Unauthorized tests for ${operation} ${naming.variable}', () => {
  it('should return unauthorized error when no auth provided', async () => {
    const response = await request(app)
      .post('/api/${naming.url}s/${operation}')
      .expect(401);

    expect(response.body.error.code).toBe('UNAUTHORIZED');
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