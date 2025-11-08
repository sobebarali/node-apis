/**
 * T3 constants templates
 */

import { getModuleNaming } from '../shared/naming.utils';

export const generateConstantsContent = ({ moduleName }: { moduleName: string }): string => {
  const naming = getModuleNaming(moduleName);

  return `// Error codes for ${naming.plural}
export const ${naming.constant}_ERROR_CODES = {
  NOT_FOUND: '${naming.constant}_NOT_FOUND',
  ALREADY_EXISTS: '${naming.constant}_ALREADY_EXISTS',
  VALIDATION_ERROR: '${naming.constant}_VALIDATION_ERROR',
  UNAUTHORIZED: '${naming.constant}_UNAUTHORIZED',
  INTERNAL_ERROR: '${naming.constant}_INTERNAL_ERROR',
} as const;

// Success messages for ${naming.plural}
export const ${naming.constant}_SUCCESS_MESSAGES = {
  CREATED: '${naming.class} created successfully',
  UPDATED: '${naming.class} updated successfully',
  DELETED: '${naming.class} deleted successfully',
  FETCHED: '${naming.class} fetched successfully',
  LISTED: '${naming.plural} listed successfully',
} as const;

// Default pagination settings for ${naming.plural}
export const ${naming.constant}_PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

// Validation constraints for ${naming.plural}
export const ${naming.constant}_VALIDATION = {
  MIN_NAME_LENGTH: 1,
  MAX_NAME_LENGTH: 255,
  MIN_DESCRIPTION_LENGTH: 0,
  MAX_DESCRIPTION_LENGTH: 1000,
} as const;
`;
};

export const getConstantsFileName = ({ moduleName }: { moduleName: string }): string => {
  const naming = getModuleNaming(moduleName);
  return `${naming.file}.constants.ts`;
};