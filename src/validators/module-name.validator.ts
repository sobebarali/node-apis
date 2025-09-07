/**
 * Module name validation logic
 */

import { ValidationResult, ModuleNameInput } from '../types/common.types';

/**
 * Validates a module name using functional programming style
 */
export const validateModuleName = ({ name }: ModuleNameInput): ValidationResult => {
  if (!name || typeof name !== 'string') {
    return {
      isValid: false,
      error: 'Module name is required and must be a string',
    };
  }

  const trimmedName = name.trim();

  if (trimmedName.length === 0) {
    return {
      isValid: false,
      error: 'Module name cannot be empty',
    };
  }

  // Check for valid characters (alphanumeric, hyphens, underscores)
  const validNameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!validNameRegex.test(trimmedName)) {
    return {
      isValid: false,
      error: 'Module name can only contain letters, numbers, hyphens, and underscores',
    };
  }

  // Check if name starts with a letter or underscore
  if (!/^[a-zA-Z_]/.test(trimmedName)) {
    return {
      isValid: false,
      error: 'Module name must start with a letter or underscore',
    };
  }

  return {
    isValid: true,
    normalizedName: trimmedName.toLowerCase(),
  };
};
