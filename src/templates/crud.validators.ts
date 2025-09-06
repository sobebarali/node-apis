/**
 * CRUD validator templates
 */

/**
 * Gets the list of CRUD validator file names for a module
 */
export const getCrudValidatorFileNames = ({ moduleName }: { moduleName: string }): string[] => {
  return [
    `create.${moduleName}.ts`,
    `get.${moduleName}.ts`,
    `list.${moduleName}.ts`,
    `delete.${moduleName}.ts`,
    `update.${moduleName}.ts`
  ];
};

/**
 * Generates TypeScript validator file content for CRUD operations
 */
export const generateCrudValidatorContent = ({ 
  operation, 
  moduleName 
}: { 
  operation: string; 
  moduleName: string; 
}): string => {
  const capitalizedModule = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  const capitalizedOperation = operation.charAt(0).toUpperCase() + operation.slice(1);
  
  // Generate operation-specific validator content
  switch (operation) {
    case 'create':
      return generateCreateValidatorContent(capitalizedModule, capitalizedOperation, moduleName);
    case 'get':
      return generateGetValidatorContent(capitalizedModule, capitalizedOperation, moduleName);
    case 'list':
      return generateListValidatorContent(capitalizedModule, capitalizedOperation, moduleName);
    case 'update':
      return generateUpdateValidatorContent(capitalizedModule, capitalizedOperation, moduleName);
    case 'delete':
      return generateDeleteValidatorContent(capitalizedModule, capitalizedOperation, moduleName);
    default:
      return generateGenericValidatorContent(capitalizedModule, capitalizedOperation, operation, moduleName);
  }
};

/**
 * Generates CREATE validator content
 */
const generateCreateValidatorContent = (_capitalizedModule: string, _capitalizedOperation: string, moduleName: string): string => {
  return `import { z } from 'zod';

export const payloadSchema = z.object({
  // Define your ${moduleName} creation validation rules here
});

export type ValidatedPayload = z.infer<typeof payloadSchema>;

export const validatePayload = (data: unknown): { success: true; data: ValidatedPayload } | { success: false; error: z.ZodError } => {
  const result = payloadSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
};
`;
};

/**
 * Generates GET validator content
 */
const generateGetValidatorContent = (_capitalizedModule: string, _capitalizedOperation: string, moduleName: string): string => {
  return `import { z } from 'zod';
import { typePayload } from '../types/get.${moduleName}';

export const payloadSchema = z.object({
  id: z.string().uuid(),
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
const generateListValidatorContent = (_capitalizedModule: string, _capitalizedOperation: string, moduleName: string): string => {
  return `import { z } from 'zod';
import { typePayload } from '../types/list.${moduleName}';

export const payloadSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
  // Add your ${moduleName} specific filter validations here
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
const generateUpdateValidatorContent = (_capitalizedModule: string, _capitalizedOperation: string, moduleName: string): string => {
  return `import { z } from 'zod';
import { typePayload } from '../types/update.${moduleName}';

export const payloadSchema = z.object({
  id: z.string().uuid(),
  // Add your ${moduleName} update validation rules here
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
const generateDeleteValidatorContent = (_capitalizedModule: string, _capitalizedOperation: string, moduleName: string): string => {
  return `import { z } from 'zod';
import { typePayload } from '../types/delete.${moduleName}';

export const payloadSchema = z.object({
  id: z.string().uuid(),
  permanent: z.boolean().optional(),
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
const generateGenericValidatorContent = (_capitalizedModule: string, _capitalizedOperation: string, operation: string, moduleName: string): string => {
  return `import { z } from 'zod';
import { typePayload } from '../types/${operation}.${moduleName}';

export const payloadSchema = z.object({
  // Define validation rules for ${operation} ${moduleName}
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
