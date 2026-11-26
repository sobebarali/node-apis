/**
 * Operation name validation
 */

const OPERATION_NAME_REGEX = /^[a-zA-Z][a-zA-Z0-9]*$/;

/** JavaScript keywords: a custom operation becomes a function name, so these cannot be used */
const RESERVED_WORDS = new Set([
  'await',
  'break',
  'case',
  'catch',
  'class',
  'const',
  'continue',
  'debugger',
  'default',
  'delete',
  'do',
  'else',
  'enum',
  'export',
  'extends',
  'false',
  'finally',
  'for',
  'function',
  'if',
  'import',
  'in',
  'instanceof',
  'let',
  'new',
  'null',
  'return',
  'static',
  'super',
  'switch',
  'this',
  'throw',
  'true',
  'try',
  'typeof',
  'var',
  'void',
  'while',
  'with',
  'yield',
  // Reserved in modules and strict mode
  'arguments',
  'eval',
  'implements',
  'interface',
  'package',
  'private',
  'protected',
  'public',
]);

const NAME_SEPARATOR_REGEX = /[\s,]+/;
const DOTTED_NAME_REGEX = /^[a-zA-Z][a-zA-Z0-9]*(\.[a-zA-Z0-9]+)+$/;
const DOTTED_PART_REGEX = /\.([a-zA-Z0-9])/g;

/** A nested router name becomes one operation name: `file.list` is `fileList` */
const flattenDottedName = (name: string): string =>
  DOTTED_NAME_REGEX.test(name)
    ? name.replace(DOTTED_PART_REGEX, (_match, first: string) => first.toUpperCase())
    : name;

/**
 * Splits operation names given as `a,b`, `"a b"`, `"a, b"` or `a b`
 */
export const parseOperationNames = ({ values }: { values: string[] }): string[] =>
  values
    .flatMap(value => value.split(NAME_SEPARATOR_REGEX))
    .filter(name => name.length > 0)
    .map(flattenDottedName);

/**
 * Returns the first custom operation name that is a JavaScript keyword, if any
 */
export const findReservedOperationName = ({ names }: { names: string[] }): string | undefined =>
  names.find(name => RESERVED_WORDS.has(name));

/**
 * Returns the first operation name that cannot be a file and function name, if any
 */
export const findInvalidOperationName = ({ names }: { names: string[] }): string | undefined =>
  names.find(name => !OPERATION_NAME_REGEX.test(name));
