/**
 * Service tests templates
 */

import { getModuleNaming } from '../templates/shared/naming.utils';

export const generateServiceComprehensiveTestContent = ({ serviceName, moduleName }: { serviceName: string; moduleName: string }): string => {
  const naming = getModuleNaming(moduleName);

  return `import { describe, it, expect, vi } from 'vitest';
import { ${serviceName}${naming.class}Service } from '../services/${naming.file}.service';

vi.mock('../services/${naming.file}.service');

describe('${serviceName} ${naming.class} Service', () => {
  it('should handle ${serviceName} ${naming.variable} service operation', async () => {
    // Mock the service function to return test data
    (async ${serviceName}${naming.class}Service as any).mockResolvedValue({ success: true });

    // Add your test implementation here
    expect(true).toBe(true);
  });
});
`;
};