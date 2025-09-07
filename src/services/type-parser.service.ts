/**
 * TypeScript type parsing service
 * Parses typePayload interfaces to extract field names and types
 */

import * as fs from 'fs';
import * as path from 'path';

export interface ParsedField {
  name: string;
  type: string;
  optional: boolean;
  defaultValue?: string;
  isNested?: boolean;
  nestedFields?: ParsedField[];
}

export interface ParsedTypePayload {
  fields: ParsedField[];
  hasId: boolean;
  hasPagination: boolean;
}

/**
 * Parses a typePayload interface from a TypeScript file
 */
export const parseTypePayload = async (filePath: string): Promise<ParsedTypePayload> => {
  try {
    const content = await fs.promises.readFile(filePath, 'utf-8');

    // Find the typePayload interface with proper brace matching
    const interfaceStart = content.indexOf('export type typePayload = {');
    if (interfaceStart === -1) {
      return { fields: [], hasId: false, hasPagination: false };
    }

    // Find the matching closing brace
    const startBrace = content.indexOf('{', interfaceStart);
    let braceCount = 1;
    let endBrace = startBrace + 1;

    while (endBrace < content.length && braceCount > 0) {
      if (content[endBrace] === '{') braceCount++;
      if (content[endBrace] === '}') braceCount--;
      endBrace++;
    }

    if (braceCount !== 0) {
      return { fields: [], hasId: false, hasPagination: false };
    }

    const interfaceBody = content.substring(startBrace + 1, endBrace - 1);
    const fields: ParsedField[] = [];
    let hasId = false;
    let hasPagination = false;

    // Parse fields with support for nested objects
    const parsedFields = parseInterfaceFields(interfaceBody);

    for (const field of parsedFields) {
      fields.push(field);

      // Check for special fields
      if (field.name === 'id') hasId = true;
      if (['page', 'limit', 'sort_by', 'sort_order'].includes(field.name)) {
        hasPagination = true;
      }
    }

    return { fields, hasId, hasPagination };
  } catch (error) {
    console.error(`Error parsing type file ${filePath}:`, error);
    return { fields: [], hasId: false, hasPagination: false };
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
      if (file.endsWith('.ts')) {
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
 * Parses interface fields with support for nested objects
 */
const parseInterfaceFields = (interfaceBody: string): ParsedField[] => {
  const fields: ParsedField[] = [];
  let i = 0;
  const lines = interfaceBody.split('\n');

  while (i < lines.length) {
    const line = lines[i].trim();

    // Skip empty lines and comments
    if (!line || line.startsWith('//') || line.startsWith('*')) {
      i++;
      continue;
    }

    // Check if this line starts a nested object
    if (line.includes(': {')) {
      const field = parseNestedObjectField(lines, i);
      if (field) {
        fields.push(field.field);
        i = field.nextIndex;
        continue;
      }
    }

    // Parse regular field
    const fieldMatch = line.match(/^(\w+)(\?)?:\s*([^;]+);?/);
    if (fieldMatch) {
      const [, name, optionalMarker, type] = fieldMatch;

      // Extract default value if present
      let defaultValue: string | undefined;
      const defaultMatch = type.match(/^([^=]+)\s*=\s*(.+)$/);
      let cleanType = type.trim();

      if (defaultMatch) {
        cleanType = defaultMatch[1].trim();
        defaultValue = defaultMatch[2].trim();
      }

      // Check if field is optional using different syntaxes
      const isOptionalMarker = !!optionalMarker;
      const isUnionWithUndefined =
        cleanType.includes('| undefined') || cleanType.includes('|undefined');
      const hasDefaultValue = !!defaultValue;
      const isOptional = isOptionalMarker || isUnionWithUndefined || hasDefaultValue;

      // Clean up union with undefined syntax
      if (isUnionWithUndefined) {
        cleanType = cleanType.replace(/\s*\|\s*undefined/g, '').trim();
      }

      fields.push({
        name,
        type: cleanType,
        optional: isOptional,
        ...(defaultValue && { defaultValue }),
      });
    }

    i++;
  }

  return fields;
};

/**
 * Parses a nested object field starting from a specific line
 */
const parseNestedObjectField = (
  lines: string[],
  startIndex: number
): { field: ParsedField; nextIndex: number } | null => {
  const startLine = lines[startIndex].trim();
  const fieldMatch = startLine.match(/^(\w+)(\?)?:\s*\{/);

  if (!fieldMatch) return null;

  const [, name, optionalMarker] = fieldMatch;
  const isOptional = !!optionalMarker;

  // Find the closing brace
  let braceCount = 1;
  let endIndex = startIndex + 1;
  const nestedLines: string[] = [];

  while (endIndex < lines.length && braceCount > 0) {
    const line = lines[endIndex].trim();

    if (line.includes('{')) braceCount++;
    if (line.includes('}')) braceCount--;

    if (braceCount > 0) {
      nestedLines.push(line);
    }

    endIndex++;
  }

  // Parse nested fields
  const nestedFields = parseInterfaceFields(nestedLines.join('\n'));

  return {
    field: {
      name,
      type: 'object',
      optional: isOptional,
      isNested: true,
      nestedFields,
    },
    nextIndex: endIndex,
  };
};

/**
 * Generates field destructuring pattern for function parameters
 */
export const generateFieldDestructuring = (fields: ParsedField[]): string => {
  if (fields.length === 0) {
    return '// No fields defined in typePayload';
  }

  const fieldLines = fields.map(field => {
    if (field.defaultValue) {
      return `  ${field.name} = ${field.defaultValue},`;
    }

    // Handle nested objects
    if (field.isNested && field.nestedFields && field.nestedFields.length > 0) {
      const nestedDestructuring = field.nestedFields.map(nf => nf.name).join(', ');
      return `  ${field.name}: { ${nestedDestructuring} },`;
    }

    return `  ${field.name},`;
  });

  return fieldLines.join('\n');
};

/**
 * Generates field object for passing to repository functions
 */
export const generateFieldObject = (
  fields: ParsedField[],
  excludeFields: string[] = []
): string => {
  const filteredFields = fields.filter(field => !excludeFields.includes(field.name));

  if (filteredFields.length === 0) {
    return '// No fields to pass';
  }

  const fieldLines = filteredFields.map(field => {
    // Handle nested objects
    if (field.isNested && field.nestedFields && field.nestedFields.length > 0) {
      const nestedFields = field.nestedFields.map(nf => `${nf.name}`).join(', ');
      return `      ${field.name}: { ${nestedFields} },`;
    }

    return `      ${field.name},`;
  });

  return fieldLines.join('\n');
};
