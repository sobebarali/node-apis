/**
 * Typed custom validator templates
 * Generates Zod validation schemas based on parsed TypeScript types
 */
import { getModuleNaming, ModuleNaming } from '../shared/utils/naming.utils';
import { ParsedTypePayload } from '../services/type-parser.service';

export const generateTypedCustomValidatorContent = ({
  customName,
  moduleName,
  parsedType,
}: {
  customName: string;
  moduleName: string;
  parsedType: ParsedTypePayload;
}): string => {
  const naming = getModuleNaming(moduleName);
  return generateGenericTypedCustomValidatorContent(customName, naming, parsedType);
};

/**
 * Converts TypeScript type to Zod validation schema
 */
const typeToZodSchema = (field: { name: string; type: string; optional: boolean }): string => {
  const { type, optional } = field;
  const fieldName = field.name.toLowerCase();

  let baseSchema: string;

  // Field name-based intelligent validation
  if (fieldName.includes('email')) {
    baseSchema = 'z.string().email().min(3).max(255)';
  } else if (fieldName.includes('url') || fieldName.includes('link')) {
    baseSchema = 'z.string().url().min(3).max(2048)';
  } else if (fieldName.includes('phone') || fieldName.includes('mobile')) {
    baseSchema = 'z.string().min(10).max(20)';
  } else if ((fieldName.includes('id') || fieldName.endsWith('id')) && type === 'string') {
    baseSchema = 'z.string().min(1).max(255)'; // Customize based on your ID format (UUID, nanoid, etc.)
  } else if (fieldName.includes('name') || fieldName.includes('title')) {
    baseSchema = 'z.string().min(1).max(255)';
  } else if (fieldName.includes('description') || fieldName.includes('content') || fieldName.includes('text')) {
    baseSchema = 'z.string().min(1).max(5000)';
  } else if (fieldName.includes('code') || fieldName.includes('slug') || fieldName.includes('key')) {
    baseSchema = 'z.string().min(1).max(100)';
  } else if (fieldName.includes('password')) {
    baseSchema = 'z.string().min(8).max(255)';
  } else if (fieldName.includes('age')) {
    baseSchema = 'z.number().int().min(0).max(150)';
  } else if (fieldName.includes('price') || fieldName.includes('amount') || fieldName.includes('cost')) {
    baseSchema = 'z.number().min(0).max(999999999)';
  } else if (fieldName.includes('quantity') || fieldName.includes('count')) {
    baseSchema = 'z.number().int().min(0).max(999999999)';
  } else if (type === 'string') {
    baseSchema = 'z.string().min(1).max(500)'; // Customize length limits as needed
  } else if (type === 'number') {
    baseSchema = 'z.number().min(-999999999).max(999999999)'; // Adjust range as needed
  } else if (type === 'boolean') {
    baseSchema = 'z.boolean()';
  } else if (type === 'Date') {
    baseSchema = 'z.date()';
  } else if (type.includes('[]')) {
    // Array types
    const arrayType = type.replace('[]', '');
    if (arrayType === 'string') {
      baseSchema = 'z.array(z.string().min(1).max(500)).min(0).max(1000)'; // Customize array and element limits
    } else if (arrayType === 'number') {
      baseSchema = 'z.array(z.number().min(-999999999).max(999999999)).min(0).max(1000)';
    } else {
      baseSchema = 'z.array(z.any()).min(0).max(1000)';
    }
  } else if (type.includes('|')) {
    // Union types
    baseSchema = 'z.string().min(1).max(500)';
  } else {
    // Fallback for complex types
    baseSchema = 'z.any()';
  }

  return optional ? `${baseSchema}.optional()` : baseSchema;
};

/**
 * Generates generic typed custom validator content
 */
const generateGenericTypedCustomValidatorContent = (
  customName: string,
  naming: ModuleNaming,
  parsedType: ParsedTypePayload
): string => {
  // Generate validation for all fields
  const zodFields =
    parsedType.fields.length > 0
      ? parsedType.fields
          .map(field => {
            const schema = typeToZodSchema(field);
            return `  ${field.name}: ${schema},`;
          })
          .join('\n')
      : `  // No fields defined in typePayload`;

  return `import { z } from 'zod';
import type { typePayload } from '../types/${customName}.${naming.file}';

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
