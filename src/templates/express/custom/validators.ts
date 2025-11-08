/**
 * Express Custom validator templates
 */

import { getModuleNaming } from '../../shared/naming.utils';

export const getCustomValidatorFileNames = ({ moduleName, customNames }: { moduleName: string; customNames: string[] }): string[] => {
  const naming = getModuleNaming(moduleName);
  return customNames.map(name => `${name}.${naming.file}.ts`);
};

export const generateCustomValidatorContent = ({
  operation,
  moduleName,
}: {
  operation: string;
  moduleName: string;
}): string => {
  const naming = getModuleNaming(moduleName);

  return generateGenericValidatorContent(naming, operation);
};

const generateGenericValidatorContent = (
  naming: ReturnType<typeof getModuleNaming>,
  operation: string,
): string => {
  return `import { z } from 'zod';

// Define the payload schema for ${operation} ${naming.variable}
export const payloadSchema = z.object({
  // Define fields for ${operation} ${naming.variable} with validation
});

export type Payload = z.infer<typeof payloadSchema>;

export const validatePayload = (data: unknown) => {
  return payloadSchema.safeParse(data);
};
`;
};