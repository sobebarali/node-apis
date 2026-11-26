/**
 * Typed custom validator templates
 * Generates Zod validation schemas based on parsed TypeScript types
 */
import { getModuleNaming } from '../shared/utils/naming.utils';
import { ParsedTypePayload } from '../services/type-parser.service';
import { buildValidatorContent } from './typed-crud.validators';
import { DEFAULT_GENERATION_SETTINGS, GenerationSettings } from '../types/config.types';

export const generateTypedCustomValidatorContent = ({
  customName,
  moduleName,
  parsedType,
  settings = DEFAULT_GENERATION_SETTINGS,
}: {
  customName: string;
  moduleName: string;
  parsedType: ParsedTypePayload;
  settings?: GenerationSettings;
}): string =>
  buildValidatorContent({
    typesFile: `${customName}.${getModuleNaming(moduleName).file}`,
    fields: parsedType.fields,
    ...(parsedType.isOptional && { isOptional: true }),
    settings,
  });
