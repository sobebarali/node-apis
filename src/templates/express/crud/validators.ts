/**
 * Express CRUD validator templates
 */

import { getModuleNaming } from '../../shared/naming.utils';

export const getCrudValidatorFileNames = ({ moduleName }: { moduleName: string }): string[] => {
  const naming = getModuleNaming(moduleName);
  return [
    `create.${naming.file}.ts`,
    `get.${naming.file}.ts`,
    `list.${naming.file}.ts`,
    `delete.${naming.file}.ts`,
    `update.${naming.file}.ts`,
  ];
};

export const generateCrudValidatorContent = ({
  operation,
  moduleName,
}: {
  operation: string;
  moduleName: string;
}): string => {
  const naming = getModuleNaming(moduleName);
  const capitalizedOperation = operation.charAt(0).toUpperCase() + operation.slice(1);

  switch (operation) {
    case 'create':
      return generateCreateValidatorContent(naming, capitalizedOperation);
    case 'get':
      return generateGetValidatorContent(naming, capitalizedOperation);
    case 'list':
      return generateListValidatorContent(naming, capitalizedOperation);
    case 'update':
      return generateUpdateValidatorContent(naming, capitalizedOperation);
    case 'delete':
      return generateDeleteValidatorContent(naming, capitalizedOperation);
    default:
      return generateGenericValidatorContent(naming, capitalizedOperation, operation);
  }
};

const generateCreateValidatorContent = (
  naming: ReturnType<typeof getModuleNaming>,
  _capitalizedOperation: string,
): string => {
  return `import { z } from 'zod';

export const payloadSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  status: z.string().optional(),
  // Add more ${naming.variable} creation fields with validation here
});

export type Payload = z.infer<typeof payloadSchema>;

export const validatePayload = (data: unknown) => {
  return payloadSchema.safeParse(data);
};
`;
};

const generateGetValidatorContent = (
  naming: ReturnType<typeof getModuleNaming>,
  _capitalizedOperation: string,
): string => {
  return `import { z } from 'zod';

export const payloadSchema = z.object({
  id: z.string().min(1, '${naming.class} ID is required'),
});

export type Payload = z.infer<typeof payloadSchema>;

export const validatePayload = (data: unknown) => {
  return payloadSchema.safeParse(data);
};
`;
};

const generateListValidatorContent = (
  naming: ReturnType<typeof getModuleNaming>,
  _capitalizedOperation: string,
): string => {
  return `import { z } from 'zod';

export const payloadSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
  status: z.string().optional(),
  // Add more ${naming.variable} specific filters here
});

export type Payload = z.infer<typeof payloadSchema>;

export const validatePayload = (data: unknown) => {
  return payloadSchema.safeParse(data);
};
`;
};

const generateUpdateValidatorContent = (
  naming: ReturnType<typeof getModuleNaming>,
  _capitalizedOperation: string,
): string => {
  return `import { z } from 'zod';

export const payloadSchema = z.object({
  id: z.string().min(1, '${naming.class} ID is required'),
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  status: z.string().optional(),
  // Add more ${naming.variable} update fields with validation here
});

export type Payload = z.infer<typeof payloadSchema>;

export const validatePayload = (data: unknown) => {
  return payloadSchema.safeParse(data);
};
`;
};

const generateDeleteValidatorContent = (
  naming: ReturnType<typeof getModuleNaming>,
  _capitalizedOperation: string,
): string => {
  return `import { z } from 'zod';

export const payloadSchema = z.object({
  id: z.string().min(1, '${naming.class} ID is required'),
});

export type Payload = z.infer<typeof payloadSchema>;

export const validatePayload = (data: unknown) => {
  return payloadSchema.safeParse(data);
};
`;
};

const generateGenericValidatorContent = (
  naming: ReturnType<typeof getModuleNaming>,
  _capitalizedOperation: string,
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