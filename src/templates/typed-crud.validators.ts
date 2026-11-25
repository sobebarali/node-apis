/**
 * Typed validator templates: a Zod schema built from the parsed typePayload
 */

import { ParsedTypePayload, ParsedField } from '../services/type-parser.service';
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

const ID_NAME_REGEX = /(^id|Id|ID|_id)$/;
const STRING_LITERAL_REGEX = /^(['"])([^'"]*)\1$/;
const NUMBER_LITERAL_REGEX = /^-?\d+(\.\d+)?$/;
const WRAPPING_PARENS_REGEX = /^\((.*)\)$/;
const DOUBLE_QUOTE_REGEX = /"/g;

/** Limits for string fields, chosen by what the field name says it holds */
const STRING_RULES: Array<{ keywords: string[]; schema: string }> = [
  { keywords: ['email'], schema: 'z.string().email().max(255)' },
  { keywords: ['url', 'link'], schema: 'z.string().url().max(2048)' },
  { keywords: ['phone', 'mobile'], schema: 'z.string().min(10).max(20)' },
  { keywords: ['password'], schema: 'z.string().min(8).max(255)' },
  { keywords: ['name', 'title'], schema: 'z.string().min(1).max(255)' },
  { keywords: ['description', 'content', 'text'], schema: 'z.string().min(1).max(5000)' },
  { keywords: ['code', 'slug', 'key'], schema: 'z.string().min(1).max(100)' },
];

const NUMBER_RULES: Array<{ keywords: string[]; schema: string }> = [
  { keywords: ['price', 'amount', 'cost'], schema: 'z.number().min(0).max(999999999)' },
  { keywords: ['quantity', 'count'], schema: 'z.number().int().min(0).max(999999999)' },
];

const stringSchema = (name: string): string => {
  if (ID_NAME_REGEX.test(name)) {
    return 'z.string().min(1).max(255)';
  }

  const lowerName = name.toLowerCase();
  const rule = STRING_RULES.find(({ keywords }) => keywords.some(word => lowerName.includes(word)));

  return rule?.schema ?? 'z.string().min(1).max(500)';
};

const numberSchema = (name: string): string => {
  if (name === 'page') {
    return 'z.number().int().min(1).max(1000000)';
  }

  if (name === 'limit') {
    return 'z.number().int().min(1).max(100)';
  }

  if (name === 'age') {
    return 'z.number().int().min(0).max(150)';
  }

  const lowerName = name.toLowerCase();
  const rule = NUMBER_RULES.find(({ keywords }) => keywords.some(word => lowerName.includes(word)));

  return rule?.schema ?? 'z.number().min(-999999999).max(999999999)';
};

const unionSchema = (name: string, members: string[]): string => {
  const literals = members.map(member => STRING_LITERAL_REGEX.exec(member)?.[2]);

  if (literals.every(literal => literal !== undefined)) {
    return `z.enum([${literals.map(literal => `'${literal}'`).join(', ')}])`;
  }

  const schemas = members.map(member =>
    NUMBER_LITERAL_REGEX.test(member) ? `z.literal(${member})` : baseSchema(name, member)
  );

  return schemas.includes('z.any()') ? 'z.any()' : `z.union([${schemas.join(', ')}])`;
};

/**
 * Converts a TypeScript type to a Zod schema. Types it cannot read become z.any().
 */
const baseSchema = (name: string, rawType: string): string => {
  const type = rawType.trim();

  // `string | string[]` is a union with an array member; `(string | number)[]` is an array
  const element = type.slice(0, -2).trim();
  const isArray =
    type.endsWith('[]') && (!element.includes('|') || WRAPPING_PARENS_REGEX.test(element));

  if (isArray) {
    return `z.array(${baseSchema('', element.replace(WRAPPING_PARENS_REGEX, '$1'))}).max(1000)`;
  }

  if (type.includes('|')) {
    const members = type.split('|').map(member => member.trim());
    const withoutNull = members.filter(member => member !== 'null');
    const inner =
      withoutNull.length === 1
        ? baseSchema(name, withoutNull[0] ?? '')
        : unionSchema(name, withoutNull);

    return withoutNull.length < members.length ? `${inner}.nullable()` : inner;
  }

  if (STRING_LITERAL_REGEX.test(type) || NUMBER_LITERAL_REGEX.test(type)) {
    return `z.literal(${type.replace(DOUBLE_QUOTE_REGEX, "'")})`;
  }

  switch (type) {
    case 'string':
      return stringSchema(name);
    case 'number':
      return numberSchema(name);
    case 'boolean':
      return 'z.boolean()';
    case 'Date':
      return 'z.date()';
    default:
      return 'z.any()';
  }
};

export const typeToZodSchema = (field: ParsedField): string => {
  const schema = baseSchema(field.name, field.type);
  return field.optional ? `${schema}.optional()` : schema;
};

/**
 * Builds a validator file. The schema is checked against typePayload at compile
 * time, so a validator that drifts from its type file stops compiling.
 */
export const buildValidatorContent = ({
  typesFile,
  fields,
}: {
  typesFile: string;
  fields: ParsedField[];
}): string => {
  const schemaBody =
    fields.length > 0
      ? `{\n${fields.map(field => `  ${field.name}: ${typeToZodSchema(field)},`).join('\n')}\n}`
      : '{}';

  return `import { z } from 'zod';
import type { typePayload } from '../types/${typesFile}';

export const payloadSchema = z.object(${schemaBody}) satisfies z.ZodType<typePayload>;

export const validatePayload = (
  data: unknown
): { success: true; data: typePayload } | { success: false; error: z.ZodError } => {
  const result = payloadSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, error: result.error };
};
`;
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
}): string =>
  buildValidatorContent({
    typesFile: `${operation}.${getModuleNaming(moduleName).file}`,
    fields: parsedType.fields,
  });
