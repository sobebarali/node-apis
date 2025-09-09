/**
 * Path utility functions
 */

import * as path from 'path';
import { ModulePathInput, ApiType } from '../types/common.types';

/**
 * Generates the target directory path for a module
 */
export const getModulePath = ({ moduleName, baseDir = process.cwd() }: ModulePathInput): string => {
  return path.join(baseDir, 'src', 'apis', moduleName);
};

/**
 * Gets the list of subdirectories to create for an API module based on type
 */
export const getModuleSubdirectories = (apiType?: ApiType): string[] => {
  if (apiType?.type === 'services') {
    // Services only need services/ and types/ folders
    return ['services', 'types'];
  }

  // CRUD and custom APIs need all folders
  return ['controllers', 'handlers', 'repository', 'services', 'types', 'validators'];
};
