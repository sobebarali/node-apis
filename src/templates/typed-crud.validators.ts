/**
 * Typed CRUD validator templates with automatic field detection
 */

import { ParsedTypePayload, ParsedField } from '../services/type-parser.service';
import { getModuleNaming, ModuleNaming } from '../shared/utils/naming.utils';

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
 * Generates TypeScript validator file content for CRUD operations with parsed types
 */
export const generateCrudValidatorContent = ({
  operation,
  moduleName,
  parsedType,
}: {
  operation: string;
  moduleName: string;
  parsedType: ParsedTypePayload;
}): string => {
  const naming = getModuleNaming(moduleName);
  const capitalizedOperation = operation.charAt(0).toUpperCase() + operation.slice(1);

  // Generate operation-specific validator content
  switch (operation) {
    case 'create':
      return generateTypedCreateValidatorContent(naming, capitalizedOperation, parsedType);
    case 'get':
      return generateTypedGetValidatorContent(naming, capitalizedOperation, parsedType);
    case 'list':
      return generateTypedListValidatorContent(naming, capitalizedOperation, parsedType);
    case 'update':
      return generateTypedUpdateValidatorContent(naming, capitalizedOperation, parsedType);
    case 'delete':
      return generateTypedDeleteValidatorContent(naming, capitalizedOperation, parsedType);
    default:
      return generateGenericValidatorContent(naming, capitalizedOperation, operation, parsedType);
  }
};

/**
 * Converts TypeScript type to Zod validation schema
 */
const typeToZodSchema = (field: ParsedField): string => {
  const { type, optional } = field;

  let baseSchema: string;

  if (type === 'string') {
    baseSchema = 'z.string()';
  } else if (type === 'number') {
    baseSchema = 'z.number()';
  } else if (type === 'boolean') {
    baseSchema = 'z.boolean()';
  } else if (type === 'Date') {
    baseSchema = 'z.date()';
  } else if (type.includes('[]')) {
    // Array types
    const arrayType = type.replace('[]', '');
    if (arrayType === 'string') {
      baseSchema = 'z.array(z.string())';
    } else if (arrayType === 'number') {
      baseSchema = 'z.array(z.number())';
    } else {
      baseSchema = 'z.array(z.any())';
    }
  } else if (type.includes('|')) {
    // Union types - for now, just use string validation
    baseSchema = 'z.string()';
  } else {
    // Fallback for complex types
    baseSchema = 'z.any()';
  }

  // Add common validations based on field name patterns
  if (field.name.toLowerCase().includes('email')) {
    baseSchema = 'z.string().email()';
  } else if (field.name.toLowerCase().includes('url')) {
    baseSchema = 'z.string().url()';
  } else if (field.name.toLowerCase().includes('id') && type === 'string') {
    baseSchema = 'z.string().uuid()';
  } else if (field.name.toLowerCase().includes('phone')) {
    baseSchema = 'z.string().min(10)';
  }

  return optional ? `${baseSchema}.optional()` : baseSchema;
};

/**
 * Finds the ID field in the parsed type (either 'id' or '${moduleName}Id')
 */
const findIdField = (parsedType: ParsedTypePayload, moduleName: string): string | null => {
  const moduleIdField = `${moduleName}Id`;

  // Prefer module-specific ID field if it exists
  if (parsedType.fields.some(f => f.name === moduleIdField)) {
    return moduleIdField;
  }

  // Fallback to generic 'id' field
  if (parsedType.fields.some(f => f.name === 'id')) {
    return 'id';
  }

  return null;
};

/**
 * Generates CREATE validator content with parsed types
 */
const generateTypedCreateValidatorContent = (
  naming: ModuleNaming,
  _capitalizedOperation: string,
  parsedType: ParsedTypePayload
): string => {
  const zodFields =
    parsedType.fields.length > 0
      ? parsedType.fields.map(field => `  ${field.name}: ${typeToZodSchema(field)},`).join('\n')
      : '  // No fields defined in typePayload';

  return `import { z } from 'zod';
import type { typePayload } from '../types/create.${naming.file}';

export const payloadSchema = z.object({
${zodFields}
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
 * Generates GET validator content with parsed types
 */
const generateTypedGetValidatorContent = (
  naming: ModuleNaming,
  _capitalizedOperation: string,
  parsedType: ParsedTypePayload
): string => {
  // Generate validation for all fields in the typePayload
  const zodFields =
    parsedType.fields.length > 0
      ? parsedType.fields.map(field => `  ${field.name}: ${typeToZodSchema(field)},`).join('\n')
      : `  // No fields defined in typePayload`;

  return `import { z } from 'zod';
import type { typePayload } from '../types/get.${naming.file}';

export const payloadSchema = z.object({
${zodFields}
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
 * Generates LIST validator content with parsed types
 */
const generateTypedListValidatorContent = (
  naming: ModuleNaming,
  _capitalizedOperation: string,
  parsedType: ParsedTypePayload
): string => {
  // List operations typically have pagination + filtering fields
  const hasCustomFilters = parsedType.fields.some(
    f => !['page', 'limit', 'sort_by', 'sort_order', 'search'].includes(f.name)
  );

  let zodFields = `  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),`;

  if (hasCustomFilters) {
    const filterFields = parsedType.fields
      .filter(field => !['page', 'limit', 'sort_by', 'sort_order', 'search'].includes(field.name))
      .map(field => `  ${field.name}: ${typeToZodSchema(field)},`)
      .join('\n');

    if (filterFields) {
      zodFields += '\n' + filterFields;
    }
  }

  return `import { z } from 'zod';
import type { typePayload } from '../types/list.${naming.file}';

export const payloadSchema = z.object({
${zodFields}
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
 * Generates UPDATE validator content with parsed types
 */
const generateTypedUpdateValidatorContent = (
  naming: ModuleNaming,
  _capitalizedOperation: string,
  parsedType: ParsedTypePayload
): string => {
  const idField = findIdField(parsedType, naming.variable);

  // Generate validation for all fields, making non-ID fields optional for partial updates
  const zodFields =
    parsedType.fields.length > 0
      ? parsedType.fields
          .map(field => {
            if (field.name === idField) {
              // ID field is required
              return `  ${field.name}: ${typeToZodSchema(field)},`;
            } else {
              // Make other fields optional for partial updates
              const schema = typeToZodSchema(field);
              const optionalSchema = schema.includes('.optional()')
                ? schema
                : `${schema}.optional()`;
              return `  ${field.name}: ${optionalSchema},`;
            }
          })
          .join('\n')
      : `  // No fields defined in typePayload`;

  return `import { z } from 'zod';
import type { typePayload } from '../types/update.${naming.file}';

export const payloadSchema = z.object({
${zodFields}
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
 * Generates DELETE validator content with parsed types
 */
const generateTypedDeleteValidatorContent = (
  naming: ModuleNaming,
  _capitalizedOperation: string,
  parsedType: ParsedTypePayload
): string => {
  // Generate validation for all fields in the typePayload
  const zodFields =
    parsedType.fields.length > 0
      ? parsedType.fields.map(field => `  ${field.name}: ${typeToZodSchema(field)},`).join('\n')
      : `  // No fields defined in typePayload`;

  return `import { z } from 'zod';
import type { typePayload } from '../types/delete.${naming.file}';

export const payloadSchema = z.object({
${zodFields}
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
 * Generates generic validator content with parsed types (fallback)
 */
const generateGenericValidatorContent = (
  naming: ModuleNaming,
  _capitalizedOperation: string,
  operation: string,
  parsedType: ParsedTypePayload
): string => {
  const zodFields =
    parsedType.fields.length > 0
      ? parsedType.fields.map(field => `  ${field.name}: ${typeToZodSchema(field)},`).join('\n')
      : `  // Define validation rules for ${operation} ${naming.variable}`;

  return `import { z } from 'zod';
import type { typePayload } from '../types/${operation}.${naming.file}';

export const payloadSchema = z.object({
${zodFields}
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
