/**
 * Shared naming utilities
 */

export interface ModuleNaming {
  file: string;      // e.g., 'user'
  class: string;     // e.g., 'User'
  variable: string;  // e.g., 'user'
  plural: string;    // e.g., 'users'
  url: string;       // e.g., 'user'
  constant: string;  // e.g., 'USER'
}

export const getModuleNaming = (moduleName: string): ModuleNaming => {
  // Convert to proper case for class names
  const classCase = moduleName
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');

  // Pluralize (simple implementation - could be enhanced)
  const plural = moduleName.endsWith('s') ? `${moduleName}es` : `${moduleName}s`;

  // File name (kebab-case)
  const file = moduleName.toLowerCase();

  // URL path (kebab-case)
  const url = file;

  // Constant case
  const constant = file.toUpperCase();

  return {
    file,
    class: classCase,
    variable: moduleName,
    plural,
    url,
    constant,
  };
};