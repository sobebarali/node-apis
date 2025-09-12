/**
 * Naming convention utilities for consistent code generation
 */

/**
 * Converts any string format to camelCase
 * Examples: 'user-profile' -> 'userProfile', 'blog_post' -> 'blogPost'
 */
export const toCamelCase = (str: string): string => {
  // First handle PascalCase to camelCase
  const withSpaces = str.replace(/([a-z])([A-Z])/g, '$1 $2');

  return withSpaces
    .toLowerCase()
    .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''));
};

/**
 * Converts any string format to PascalCase
 * Examples: 'user-profile' -> 'UserProfile', 'blog_post' -> 'BlogPost'
 */
export const toPascalCase = (str: string): string => {
  const camelCase = toCamelCase(str);
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
};

/**
 * Converts any string format to kebab-case
 * Examples: 'userProfile' -> 'user-profile', 'BlogPost' -> 'blog-post'
 */
export const toKebabCase = (str: string): string => {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
};

/**
 * Converts any string format to snake_case
 * Examples: 'userProfile' -> 'user_profile', 'BlogPost' -> 'blog_post'
 */
export const toSnakeCase = (str: string): string => {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
};

/**
 * Converts any string format to CONSTANT_CASE
 * Examples: 'userProfile' -> 'USER_PROFILE', 'blog-post' -> 'BLOG_POST'
 */
export const toConstantCase = (str: string): string => {
  return toSnakeCase(str).toUpperCase();
};

/**
 * Comprehensive naming transformations for a module name
 */
export interface ModuleNaming {
  /** Original input name */
  original: string;
  /** Directory name (kebab-case) */
  directory: string;
  /** File name part (camelCase) */
  file: string;
  /** Class name part (PascalCase) */
  class: string;
  /** Variable name part (camelCase) */
  variable: string;
  /** Constant name part (CONSTANT_CASE) */
  constant: string;
  /** URL-friendly name (kebab-case) */
  url: string;
}

/**
 * Generates all naming conventions for a module name
 */
export const getModuleNaming = (moduleName: string): ModuleNaming => {
  const cleaned = moduleName.trim();

  return {
    original: cleaned,
    directory: toKebabCase(cleaned),
    file: toCamelCase(cleaned),
    class: toPascalCase(cleaned),
    variable: toCamelCase(cleaned),
    constant: toConstantCase(cleaned),
    url: toKebabCase(cleaned),
  };
};

/**
 * Validates that a string can be converted to a valid JavaScript identifier
 */
export const isValidIdentifierBase = (str: string): boolean => {
  if (!str || typeof str !== 'string') return false;

  const cleaned = str.trim();
  if (cleaned.length === 0) return false;

  // Check if it contains only valid characters for transformation
  const validChars = /^[a-zA-Z0-9_\-\s]+$/;
  if (!validChars.test(cleaned)) return false;

  // Check if it starts with a valid character (letter, underscore, or number that will be prefixed)
  const startsValid = /^[a-zA-Z_]/.test(cleaned) || /^[0-9]/.test(cleaned);
  if (!startsValid) return false;

  return true;
};

/**
 * Ensures a name starts with a letter (adds prefix if needed)
 */
export const ensureValidStart = (str: string): string => {
  if (/^[0-9]/.test(str)) {
    return `module${toPascalCase(str)}`;
  }
  return str;
};
