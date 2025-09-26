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
