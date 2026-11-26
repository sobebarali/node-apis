/**
 * TypeScript type parsing service
 * Parses typePayload interfaces to extract field names and types
 */

import * as fs from 'fs';
import * as path from 'path';

export interface ParsedField {
  name: string;
  /** The type as written in the type file, on one line: `string[]`, `{ key: string }` */
  type: string;
  optional: boolean;
}

export interface ParsedTypePayload {
  fields: ParsedField[];
  hasId: boolean;
  hasPagination: boolean;
  isEmpty?: boolean; // True if typePayload is empty (no fields)
  /** Literal codes declared in typeResultError, for example ['NOT_FOUND', 'INTERNAL_ERROR'] */
  errorCodes?: string[];
  /** False when typeResultError declares no `statusCode`. Unknown counts as declared. */
  errorHasStatusCode?: boolean;
  /** False when typeResultError declares no `requestId`. Unknown counts as declared. */
  errorHasRequestId?: boolean;
  /** True when the whole payload may be left out: `typePayload = { ... } | undefined` */
  isOptional?: boolean;
  /** Members of typePayload that are not a plain `name: type` field and were left out */
  unreadMembers?: string[];
}

const ERROR_TYPE_REGEX = /export\s+(?:type|interface)\s+typeResultError\s*(?:=\s*)?{/;
const UNION_FOLLOWS_REGEX = /^\s*\|/;
const ERROR_CODE_LINE_REGEX = /\bcode\??:\s*([^;\n]+)/;
const QUOTED_LITERAL_REGEX = /['"]([^'"]+)['"]/g;

/**
 * Reads the literal error codes a type file declares in typeResultError
 */
export const parseErrorCodes = (content: string): string[] => {
  const body = findErrorBody(content)?.body;
  const codeType = body ? ERROR_CODE_LINE_REGEX.exec(body)?.[1] : undefined;

  if (!codeType) {
    return [];
  }

  return Array.from(codeType.matchAll(QUOTED_LITERAL_REGEX), match => match[1] ?? '');
};

const OPENING_BRACKETS = '{[(<';
const CLOSING_BRACKETS = '}])>';
const QUOTES = '\'"`';
const MEMBER_SEPARATORS = [';', ',', '\n'];
const LINE_BREAK_AFTER_OPERATOR_REGEX = /([:|&])\s*\n\s*/g;
const LINE_BREAK_BEFORE_OPERATOR_REGEX = /\s*\n\s*([|&])/g;
const WHITESPACE_RUN_REGEX = /\s+/g;
const MEMBER_REGEX = /^(?:readonly\s+)?(\w+)(\?)?\s*:\s*([\s\S]+)$/;
const TYPE_PAYLOAD_REGEX = /export\s+(?:type|interface)\s+typePayload\s*(?:=\s*)?{/;
/** `operation.moduleName.ts`. Other files in types/ (the entity file) hold no operation. */
const OPERATION_FILE_REGEX = /^[^.]+\.[^.]+\.ts$/;
const OPTIONAL_PAYLOAD_REGEX = /^\s*\|\s*undefined\b/;
const PAGINATION_FIELDS = ['page', 'limit', 'sortBy', 'sortOrder'];

/**
 * Removes comments. A `//` or `/*` inside a string literal is not a comment.
 */
export const stripComments = (source: string): string => {
  let result = '';
  let quote = '';
  let index = 0;

  while (index < source.length) {
    const char = source[index] ?? '';
    const pair = source.slice(index, index + 2);

    if (quote) {
      quote = char === quote ? '' : quote;
      result += char;
      index += 1;
    } else if (pair === '//') {
      const lineEnd = source.indexOf('\n', index);
      index = lineEnd === -1 ? source.length : lineEnd;
    } else if (pair === '/*') {
      const commentEnd = source.indexOf('*/', index + 2);
      index = commentEnd === -1 ? source.length : commentEnd + 2;
    } else {
      quote = QUOTES.includes(char) ? char : '';
      result += char;
      index += 1;
    }
  }

  return result;
};

/**
 * Reads what a type file declares in typeResultError: its literal codes and
 * whether it carries `statusCode` and `requestId`. A type that cannot be read
 * (an alias, a nested object) is taken to carry both.
 */
export const parseErrorShape = (
  content: string
): Pick<ParsedTypePayload, 'errorCodes' | 'errorHasStatusCode' | 'errorHasRequestId'> => {
  const error = findErrorBody(stripComments(content));
  // Only the members of one object are read: a union of objects stays unknown
  const members = error === null || error.isUnion ? null : parseObjectMembers(error.body).fields;

  return {
    errorCodes: parseErrorCodes(content),
    ...(members !== null && {
      errorHasStatusCode: members.some(field => field.name === 'statusCode'),
      errorHasRequestId: members.some(field => field.name === 'requestId'),
    }),
  };
};

/**
 * Splits text at the separators that sit outside brackets and string literals.
 * `a | { b: 'x' | 'y' }` split at `|` gives two parts, not three.
 */
export const splitTopLevel = (source: string, separators: string[]): string[] => {
  const parts: string[] = [];
  let current = '';
  let depth = 0;
  let quote = '';

  for (const [index, char] of Array.from(source).entries()) {
    if (quote) {
      quote = char === quote ? '' : quote;
      current += char;
    } else if (QUOTES.includes(char)) {
      quote = char;
      current += char;
    } else if (depth === 0 && separators.includes(char)) {
      parts.push(current);
      current = '';
    } else {
      // The `>` of an arrow (`=>`) does not close a bracket
      const closesBracket = CLOSING_BRACKETS.includes(char) && source[index - 1] !== '=';

      if (OPENING_BRACKETS.includes(char)) {
        depth += 1;
      } else if (closesBracket) {
        depth -= 1;
      }

      current += char;
    }
  }

  parts.push(current);

  return parts.map(part => part.trim()).filter(part => part.length > 0);
};

/**
 * Returns the text inside `open` and `close` when they wrap the whole type:
 * `{ a: string }` gives `a: string`, `{ a: string } & { b: string }` gives null.
 */
export const unwrapBrackets = (type: string, open: string, close: string): string | null => {
  if (!(type.startsWith(open) && type.endsWith(close))) {
    return null;
  }

  const chars = Array.from(type);
  let depth = 0;
  let quote = '';

  for (const [index, char] of chars.entries()) {
    if (quote) {
      quote = char === quote ? '' : quote;
    } else if (QUOTES.includes(char)) {
      quote = char;
    } else if (char === open) {
      depth += 1;
    } else if (char === close) {
      depth -= 1;
    }

    // The first bracket closed before the end, so it does not wrap the whole type
    if (depth === 0 && index < chars.length - 1) {
      return null;
    }
  }

  return type.slice(1, -1).trim();
};

/**
 * Parses the members of an object type body (the text between its braces).
 * `unread` lists the members that are not a plain `name: type` field.
 */
export const parseObjectMembers = (
  body: string
): { fields: ParsedField[]; complete: boolean; unread: string[] } => {
  const joined = stripComments(body)
    .replace(LINE_BREAK_AFTER_OPERATOR_REGEX, '$1 ')
    .replace(LINE_BREAK_BEFORE_OPERATOR_REGEX, ' $1');

  const fields: ParsedField[] = [];
  const unread: string[] = [];

  for (const member of splitTopLevel(joined, MEMBER_SEPARATORS)) {
    const match = MEMBER_REGEX.exec(member);
    const name = match?.[1];
    const rawType = match?.[3];

    if (name === undefined || rawType === undefined) {
      unread.push(member.replace(WHITESPACE_RUN_REGEX, ' '));
    } else {
      // `name: string | undefined` is treated like `name?: string`
      const members = splitTopLevel(rawType.replace(WHITESPACE_RUN_REGEX, ' '), ['|']);
      const defined = members.filter(part => part !== 'undefined');

      fields.push({
        name,
        type: defined.join(' | '),
        optional: match?.[2] === '?' || defined.length < members.length,
      });
    }
  }

  return { fields, complete: unread.length === 0, unread };
};

/**
 * Reads the text between an opening brace and its closing brace. `start` is the
 * index after the opening brace. Braces inside string literals do not count.
 */
function readBalancedBody(content: string, start: number): { body: string; end: number } | null {
  let depth = 1;
  let quote = '';
  let end = start;

  while (end < content.length && depth > 0) {
    const char = content[end] ?? '';

    if (quote) {
      quote = char === quote ? '' : quote;
    } else if (QUOTES.includes(char)) {
      quote = char;
    } else if (char === '{') {
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
    }

    end += 1;
  }

  return depth === 0 ? { body: content.slice(start, end - 1), end } : null;
}

/**
 * Finds the body of an inline `typeResultError`, and whether more union members follow it
 */
function findErrorBody(content: string): { body: string; isUnion: boolean } | null {
  const definition = ERROR_TYPE_REGEX.exec(content);
  const read = definition
    ? readBalancedBody(content, definition.index + definition[0].length)
    : null;

  return read && { body: read.body, isUnion: UNION_FOLLOWS_REGEX.test(content.slice(read.end)) };
}

/**
 * Finds the body of `typePayload` (the text between its braces), and whether
 * `| undefined` follows it
 */
const findTypePayloadBody = (content: string): { body: string; isOptional: boolean } | null => {
  const definition = TYPE_PAYLOAD_REGEX.exec(content);
  const read = definition
    ? readBalancedBody(content, definition.index + definition[0].length)
    : null;

  return (
    read && { body: read.body, isOptional: OPTIONAL_PAYLOAD_REGEX.test(content.slice(read.end)) }
  );
};

/**
 * Parses the typePayload of a type file
 */
export const parseTypePayload = async (filePath: string): Promise<ParsedTypePayload> => {
  try {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    const payload = findTypePayloadBody(stripComments(content));

    // `typePayload = Record<string, never>` has no body, but its error codes still count
    if (payload === null) {
      return {
        fields: [],
        hasId: false,
        hasPagination: false,
        ...parseErrorShape(content),
      };
    }

    const { fields, unread } = parseObjectMembers(payload.body);

    return {
      fields,
      hasId: fields.some(field => field.name === 'id'),
      hasPagination: fields.some(field => PAGINATION_FIELDS.includes(field.name)),
      isEmpty: fields.length === 0,
      ...parseErrorShape(content),
      ...(payload.isOptional && { isOptional: true }),
      ...(unread.length > 0 && { unreadMembers: unread }),
    };
  } catch (error) {
    console.error(`Error parsing type file ${filePath}:`, error);
    return { fields: [], hasId: false, hasPagination: false, isEmpty: true };
  }
};

/**
 * Parses all typePayload files in a module's types directory
 */
export const parseModuleTypes = async (
  modulePath: string
): Promise<Record<string, ParsedTypePayload>> => {
  const typesDir = path.join(modulePath, 'types');
  const result: Record<string, ParsedTypePayload> = {};

  try {
    const files = await fs.promises.readdir(typesDir);

    for (const file of files) {
      if (OPERATION_FILE_REGEX.test(file)) {
        const filePath = path.join(typesDir, file);
        const operationName = file.replace(/\.[^.]+\.ts$/, ''); // Extract operation name (create, get, etc.)
        result[operationName] = await parseTypePayload(filePath);
      }
    }
  } catch (error) {
    console.error(`Error reading types directory ${typesDir}:`, error);
  }

  return result;
};

/**
 * Converts empty typePayload from {} to Record<string, never>
 */
export const convertEmptyTypePayload = async (filePath: string): Promise<boolean> => {
  try {
    const content = await fs.promises.readFile(filePath, 'utf-8');

    // Check if typePayload is empty {}
    const emptyPattern = /export type typePayload = \{\s*\};?/;

    if (emptyPattern.test(content)) {
      // Replace with Record<string, never>
      const updatedContent = content.replace(
        emptyPattern,
        'export type typePayload = Record<string, never>;'
      );

      await fs.promises.writeFile(filePath, updatedContent, 'utf-8');
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error converting empty typePayload in ${filePath}:`, error);
    return false;
  }
};
