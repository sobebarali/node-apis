/**
 * Typed custom validator templates
 * Generates Zod validation schemas based on parsed TypeScript types
 */
import { getModuleNaming } from '../shared/utils/naming.utils';
import { ParsedTypePayload } from '../services/type-parser.service';
import { buildValidatorContent } from './typed-crud.validators';

export const generateTypedCustomValidatorContent = ({
  customName,
  moduleName,
  parsedType,
}: {
  customName: string;
  moduleName: string;
  parsedType: ParsedTypePayload;
}): string =>
  buildValidatorContent({
    typesFile: `${customName}.${getModuleNaming(moduleName).file}`,
    fields: parsedType.fields,
  });
