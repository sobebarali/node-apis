/**
 * CRUD validator templates
 */

import { getModuleNaming } from '../shared/utils/naming.utils';

/**
 * Gets the list of CRUD validator file names for a module
 */
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

/**
 * Generates TypeScript validator file content for CRUD operations
 */
export const generateCrudValidatorContent = ({
  operation,
  moduleName,
}: {
  operation: string;
  moduleName: string;
}): string => {
  const naming = getModuleNaming(moduleName);
  const capitalizedOperation = operation.charAt(0).toUpperCase() + operation.slice(1);

  // Generate operation-specific validator content
  switch (operation) {
    case 'create':
      return generateCreateValidatorContent(naming.class, capitalizedOperation, naming.file);
    case 'get':
      return generateGetValidatorContent(naming.class, capitalizedOperation, naming.file);
    case 'list':
      return generateListValidatorContent(naming.class, capitalizedOperation, naming.file);
    case 'update':
      return generateUpdateValidatorContent(naming.class, capitalizedOperation, naming.file);
    case 'delete':
      return generateDeleteValidatorContent(naming.class, capitalizedOperation, naming.file);
    default:
      return generateGenericValidatorContent(
        naming.class,
        capitalizedOperation,
        operation,
        naming.file
      );
  }
};

/**
 * Generates CREATE validator content
 */
const generateCreateValidatorContent = (
  _capitalizedModule: string,
  _capitalizedOperation: string,
  moduleName: string
): string => {
  return `import { z } from 'zod';
import type { typePayload } from '../types/create.${moduleName}';

export const payloadSchema = z.object({
  // Define your ${moduleName} creation validation rules here
  // Example: name: z.string().min(1).max(255),
  // Example: email: z.string().email().min(3).max(255),
  // Example: age: z.number().int().min(0).max(150),
});

export const validatePayload = (data: unknown): { success: true; data: typePayload } | { success: false; error: z.ZodError } => {
  const result = payloadSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data as typePayload };
  }
  return { success: false, error: result.error };
};
`;
};

/**
 * Generates GET validator content
 */
const generateGetValidatorContent = (
  _capitalizedModule: string,
  _capitalizedOperation: string,
  moduleName: string
): string => {
  return `import { z } from 'zod';
import type { typePayload } from '../types/get.${moduleName}';

export const payloadSchema = z.object({
  id: z.string().min(1).max(255), // Customize based on your ID format (UUID, nanoid, numeric, etc.)
});

export const validatePayload = (data: unknown): { success: true; data: typePayload } | { success: false; error: z.ZodError } => {
  const result = payloadSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data as typePayload };
  }
  return { success: false, error: result.error };
};
`;
};

/**
 * Generates LIST validator content
 */
const generateListValidatorContent = (
  _capitalizedModule: string,
  _capitalizedOperation: string,
  moduleName: string
): string => {
  return `import { z } from 'zod';
import type { typePayload } from '../types/list.${moduleName}';

export const payloadSchema = z.object({
  page: z.number().int().positive().min(1).max(1000000).optional(), // Adjust max page limit as needed
  limit: z.number().int().positive().min(1).max(100).optional(), // Adjust max items per page
  sort_by: z.string().min(1).max(100).optional(), // Field name to sort by
  sort_order: z.enum(['asc', 'desc']).optional(),
  search: z.string().min(1).max(500).optional(), // Search query string
  // Add your ${moduleName} specific filter validations here
  // Example: status: z.enum(['active', 'inactive']).optional(),
  // Example: category_id: z.string().min(1).max(255).optional(),
});

export const validatePayload = (data: unknown): { success: true; data: typePayload } | { success: false; error: z.ZodError } => {
  const result = payloadSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data as typePayload };
  }
  return { success: false, error: result.error };
};
`;
};

/**
 * Generates UPDATE validator content
 */
const generateUpdateValidatorContent = (
  _capitalizedModule: string,
  _capitalizedOperation: string,
  moduleName: string
): string => {
  return `import { z } from 'zod';
import type { typePayload } from '../types/update.${moduleName}';

export const payloadSchema = z.object({
  id: z.string().min(1).max(255), // Customize based on your ID format
  // Add your ${moduleName} update validation rules here (make fields optional for partial updates)
  // Example: name: z.string().min(1).max(255).optional(),
  // Example: status: z.enum(['active', 'inactive']).optional(),
});

export const validatePayload = (data: unknown): { success: true; data: typePayload } | { success: false; error: z.ZodError } => {
  const result = payloadSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data as typePayload };
  }
  return { success: false, error: result.error };
};
`;
};

/**
 * Generates DELETE validator content
 */
const generateDeleteValidatorContent = (
  _capitalizedModule: string,
  _capitalizedOperation: string,
  moduleName: string
): string => {
  return `import { z } from 'zod';
import type { typePayload } from '../types/delete.${moduleName}';

export const payloadSchema = z.object({
  id: z.string().min(1).max(255), // Customize based on your ID format
  permanent: z.boolean().optional(), // Set to true for hard delete, false/undefined for soft delete
});

export const validatePayload = (data: unknown): { success: true; data: typePayload } | { success: false; error: z.ZodError } => {
  const result = payloadSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data as typePayload };
  }
  return { success: false, error: result.error };
};
`;
};

/**
 * Generates generic validator content (fallback)
 */
const generateGenericValidatorContent = (
  _capitalizedModule: string,
  _capitalizedOperation: string,
  operation: string,
  moduleName: string
): string => {
  return `import { z } from 'zod';
import type { typePayload } from '../types/${operation}.${moduleName}';

export const payloadSchema = z.object({
  // Define validation rules for ${operation} ${moduleName}
  // Common patterns:
  // - Strings: z.string().min(1).max(500)
  // - IDs: z.string().min(1).max(255)
  // - Email: z.string().email().min(3).max(255)
  // - Numbers: z.number().min(0).max(999999999)
  // - Booleans: z.boolean()
  // - Enums: z.enum(['value1', 'value2'])
});

export const validatePayload = (data: unknown): { success: true; data: typePayload } | { success: false; error: z.ZodError } => {
  const result = payloadSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data as typePayload };
  }
  return { success: false, error: result.error };
};
`;
};
