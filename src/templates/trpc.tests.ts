/**
 * TRPC test templates
 */

import { getModuleNaming } from '../templates/shared/naming.utils';

export const generateTrpcTestContent = ({ operation, testType, moduleName }: { operation: string; testType: string; moduleName: string }): string => {
  const naming = getModuleNaming(moduleName);

  // Different test content based on test type
  switch (testType) {
    case 'procedure.test.ts':
      return `import { describe, it, expect } from 'vitest';
import { createCaller } from '../router';
import { ${operation}${naming.class} } from '../procedures/${operation}.${naming.file}';

describe('${operation} ${naming.class} TRPC Procedure', () => {
  it('should handle ${operation} ${naming.variable} request', async () => {
    const caller = createCaller({} as any);
    // Add your test implementation here
    expect(true).toBe(true);
  });
});
`;
    case 'validation.test.ts':
      return `import { describe, it, expect } from 'vitest';
import { ${operation}${naming.class} } from '../procedures/${operation}.${naming.file}';

describe('${operation} ${naming.class} TRPC Validation', () => {
  it('should validate input for ${operation}', async () => {
    // Add validation tests here
    expect(true).toBe(true);
  });
});
`;
    case 'errors.test.ts':
      return `import { describe, it, expect } from 'vitest';
import { ${operation}${naming.class} } from '../procedures/${operation}.${naming.file}';

describe('${operation} ${naming.class} TRPC Error Handling', () => {
  it('should handle errors for ${operation}', async () => {
    // Add error handling tests here
    expect(true).toBe(true);
  });
`;
    case 'trpc-helpers.ts':
      return `import { createCaller } from '../router';

// TRPC test helpers for ${naming.plural}
export const create${naming.class}Caller = (ctx: any) => createCaller(ctx);
`;
    default:
      return `// ${testType} tests for ${operation} ${naming.class}
// This is a TRPC test file
`;
  }
};