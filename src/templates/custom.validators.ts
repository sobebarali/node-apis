/**
 * Custom validator templates
 */

import { getModuleNaming } from '../shared/utils/naming.utils';

/**
 * Gets custom validator file names for a module
 */
export const getCustomValidatorFileNames = ({
  customNames,
  moduleName,
}: {
  customNames: string[];
  moduleName: string;
}): string[] => {
  const naming = getModuleNaming(moduleName);
  return customNames.map(customName => `${customName}.${naming.file}.ts`);
};

/**
 * Generates TypeScript validator file content for custom operations
 */
export const generateCustomValidatorContent = ({
  customName,
  moduleName,
}: {
  customName: string;
  moduleName: string;
}): string => {
  const naming = getModuleNaming(moduleName);
  const capitalizedCustom = customName.charAt(0).toUpperCase() + customName.slice(1);

  return generateGenericCustomValidatorContent(
    customName,
    naming.class,
    capitalizedCustom,
    naming.file
  );
};

/**
 * Generates generic custom validator content
 */
const generateGenericCustomValidatorContent = (
  customName: string,
  _capitalizedModule: string,
  _capitalizedCustom: string,
  moduleName: string
): string => {
  return `import { z } from 'zod';
import type { typePayload } from '../types/${customName}.${moduleName}';

export const payloadSchema = z.object({
  // Define validation rules for ${customName} ${moduleName}
  id: z.string().uuid().optional(),
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
