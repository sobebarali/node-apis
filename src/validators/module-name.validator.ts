/**
 * Module name validation logic with smart naming transformations
 */

import { ValidationResult, ModuleNameInput } from '../types/common.types';
import {
  getModuleNaming,
  isValidIdentifierBase,
  ensureValidStart,
} from '../shared/utils/naming.utils';

/**
 * Enhanced validation result with naming transformations
 */
export interface EnhancedValidationResult extends ValidationResult {
  naming?: {
    directory: string;
    file: string;
    class: string;
    variable: string;
    constant: string;
    url: string;
  };
}

/**
 * Validates and transforms a module name with smart naming conventions
 */
export const validateModuleName = ({ name }: ModuleNameInput): EnhancedValidationResult => {
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

  // Check if the name can be transformed to valid identifiers
  if (!isValidIdentifierBase(trimmedName)) {
    return {
      isValid: false,
      error:
        'Module name contains invalid characters. Use only letters, numbers, hyphens, underscores, and spaces.',
    };
  }

  // Generate all naming conventions
  const processedName = ensureValidStart(trimmedName);
  const naming = getModuleNaming(processedName);

  return {
    isValid: true,
    normalizedName: naming.directory, // Use kebab-case for directory names
    naming: {
      directory: naming.directory,
      file: naming.file,
      class: naming.class,
      variable: naming.variable,
      constant: naming.constant,
      url: naming.url,
    },
  };
};
