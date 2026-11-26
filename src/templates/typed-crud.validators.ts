/**
 * Typed validator templates: a Zod schema built from the parsed typePayload
 */

import {
  ParsedTypePayload,
  ParsedField,
  parseObjectMembers,
  splitTopLevel,
  unwrapBrackets,
} from '../services/type-parser.service';
import { getModuleNaming } from '../shared/utils/naming.utils';
import { DEFAULT_GENERATION_SETTINGS, GenerationSettings } from '../types/config.types';

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

const STRING_LITERAL_REGEX = /^(['"])([^'"]*)\1$/;
const NUMBER_LITERAL_REGEX = /^-?\d+(\.\d+)?$/;
const DOUBLE_QUOTE_REGEX = /"/g;
const ARRAY_GENERIC_REGEX = /^(?:Readonly)?Array<([\s\S]+)>$/;
const RECORD_GENERIC_REGEX = /^Record<([\s\S]+)>$/;
const EMAIL_NAME_REGEX = /(^email|Email)$/;
const URL_NAME_REGEX = /(^url|Url|URL)$/;

const MAX_LINE_LENGTH = 100;
/** Room kept on a line for what follows a schema: `.nullable().optional(),` */
const SUFFIX_ROOM = 24;

const PRIMITIVE_SCHEMAS = new Map([
  ['number', 'z.number()'],
  ['boolean', 'z.boolean()'],
  ['Date', 'z.date()'],
  ['null', 'z.null()'],
  ['unknown', 'z.unknown()'],
  ['any', 'z.any()'],
  ['true', 'z.literal(true)'],
  ['false', 'z.literal(false)'],
]);

/**
 * A string schema. The type file cannot say "this is an email", so the two
 * unambiguous field names are the only ones that add a format check. Nothing
 * else is guessed (`string` allows ''): add trimming and length limits by hand.
 */
const stringSchema = (name: string): string => {
  if (EMAIL_NAME_REGEX.test(name)) {
    return 'z.string().email()';
  }

  if (URL_NAME_REGEX.test(name)) {
    return 'z.string().url()';
  }

  return 'z.string()';
};

/**
 * Writes `open` + items + `close` on one line when it fits, otherwise one item per line.
 * `indent` is the indentation of the line the schema starts on.
 */
const wrapItems = ({
  open,
  items,
  close,
  indent,
}: {
  open: string;
  items: string[];
  close: string;
  indent: string;
}): string => {
  const oneLine = `${open}${items.join(', ')}${close}`;
  const fits = indent.length + oneLine.length + SUFFIX_ROOM <= MAX_LINE_LENGTH;

  if (fits && !oneLine.includes('\n')) {
    return oneLine;
  }

  return `${open}\n${items.map(item => `${indent}  ${item},`).join('\n')}\n${indent}${close}`;
};

const objectSchema = (body: string, indent: string): string => {
  const { fields, complete } = parseObjectMembers(body);

  if (!complete) {
    return 'z.any()';
  }

  if (fields.length === 0) {
    return 'z.object({})';
  }

  const lines = fields.map(
    field => `${indent}  ${field.name}: ${fieldSchema(field, `${indent}  `)},`
  );

  return `z.object({\n${lines.join('\n')}\n${indent}})`;
};

const arraySchema = (element: string, indent: string): string => {
  const inner = toSchema({ name: '', rawType: element, indent: `${indent}  ` });

  return inner.includes('\n') ? `z.array(\n${indent}  ${inner}\n${indent})` : `z.array(${inner})`;
};

const unionSchema = ({
  name,
  members,
  indent,
}: {
  name: string;
  members: string[];
  indent: string;
}): string => {
  const defined = members.filter(member => member !== 'null');
  const nullable = defined.length < members.length ? '.nullable()' : '';
  const literals = defined.map(member => STRING_LITERAL_REGEX.exec(member)?.[2]);
  const [only] = defined;

  if (only === undefined) {
    return 'z.null()';
  }

  if (defined.length === 1) {
    return `${toSchema({ name, rawType: only, indent })}${nullable}`;
  }

  if (literals.every(literal => literal !== undefined)) {
    const items = literals.map(literal => `'${literal}'`);

    return `${wrapItems({ open: 'z.enum([', items, close: '])', indent })}${nullable}`;
  }

  // Union members sit one level deeper when the union is written over several lines
  const items = defined.map(member =>
    toSchema({ name: '', rawType: member, indent: `${indent}  ` })
  );

  if (items.includes('z.any()')) {
    return 'z.any()';
  }

  return `${wrapItems({ open: 'z.union([', items, close: '])', indent })}${nullable}`;
};

/**
 * Converts a TypeScript type to a Zod schema. Types it cannot read become z.any().
 */
const toSchema = ({
  name,
  rawType,
  indent,
}: {
  name: string;
  rawType: string;
  indent: string;
}): string => {
  const trimmed = rawType.trim();
  const type = unwrapBrackets(trimmed, '(', ')') ?? trimmed;

  // `string | string[]` is a union with an array member; `(string | number)[]` is an array
  const members = splitTopLevel(type, ['|']);

  if (members.length > 1) {
    return unionSchema({ name, members, indent });
  }

  // Intersections are not read: `A & B[]` is not an array
  if (splitTopLevel(type, ['&']).length > 1) {
    return 'z.any()';
  }

  if (type.endsWith('[]')) {
    return arraySchema(type.slice(0, -2), indent);
  }

  const arrayElement = ARRAY_GENERIC_REGEX.exec(type)?.[1];

  if (arrayElement !== undefined) {
    return arraySchema(arrayElement, indent);
  }

  const [recordKey, recordValue, ...rest] = splitTopLevel(
    RECORD_GENERIC_REGEX.exec(type)?.[1] ?? '',
    [',']
  );

  if (recordKey === 'string' && recordValue !== undefined && rest.length === 0) {
    return `z.record(z.string(), ${toSchema({ name: '', rawType: recordValue, indent })})`;
  }

  const objectBody = unwrapBrackets(type, '{', '}');

  if (objectBody !== null) {
    return objectSchema(objectBody, indent);
  }

  if (STRING_LITERAL_REGEX.test(type) || NUMBER_LITERAL_REGEX.test(type)) {
    return `z.literal(${type.replace(DOUBLE_QUOTE_REGEX, "'")})`;
  }

  if (type === 'string') {
    return stringSchema(name);
  }

  return PRIMITIVE_SCHEMAS.get(type) ?? 'z.any()';
};

const fieldSchema = (field: ParsedField, indent: string): string => {
  const schema = toSchema({ name: field.name, rawType: field.type, indent });

  return field.optional ? `${schema}.optional()` : schema;
};

/**
 * Builds a validator file. The schema is checked against typePayload at compile
 * time, so a validator that drifts from its type file stops compiling.
 */
export const buildValidatorContent = ({
  typesFile,
  fields,
  isOptional = false,
  settings = DEFAULT_GENERATION_SETTINGS,
}: {
  typesFile: string;
  fields: ParsedField[];
  /** True when typePayload is `{ ... } | undefined`: the caller may send nothing */
  isOptional?: boolean;
  settings?: GenerationSettings;
}): string => {
  // Prettier breaks the chain once `.optional()` follows a schema with fields
  const chained = isOptional && fields.length > 0;
  const indent = chained ? '    ' : '  ';
  const closing = chained ? '  ' : '';
  const schemaBody =
    fields.length > 0
      ? `{\n${fields.map(field => `${indent}${field.name}: ${fieldSchema(field, indent)},`).join('\n')}\n${closing}}`
      : '{}';
  const optional = isOptional ? '.optional()' : '';
  const schema = chained
    ? `z\n  .object(${schemaBody})\n  .optional()`
    : `z.object(${schemaBody})${optional}`;

  // A router that takes the schema itself (oRPC, tRPC) has no use for the wrapper
  const validatePayload = settings.validatePayload
    ? `
export const validatePayload = (
  data: unknown
): { success: true; data: typePayload } | { success: false; error: z.ZodError } => {
  const result = payloadSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, error: result.error };
};
`
    : '';

  return `import { z } from 'zod';
import type { typePayload } from '../types/${typesFile}';

export const payloadSchema = ${schema} satisfies z.ZodType<typePayload>;
${validatePayload}`;
};

/**
 * Generates TypeScript validator file content for CRUD operations with parsed types
 */
export const generateCrudValidatorContent = ({
  operation,
  moduleName,
  parsedType,
  settings = DEFAULT_GENERATION_SETTINGS,
}: {
  operation: string;
  moduleName: string;
  parsedType: ParsedTypePayload;
  settings?: GenerationSettings;
}): string =>
  buildValidatorContent({
    typesFile: `${operation}.${getModuleNaming(moduleName).file}`,
    fields: parsedType.fields,
    ...(parsedType.isOptional && { isOptional: true }),
    settings,
  });
