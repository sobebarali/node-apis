/**
 * Path utility functions
 */

import * as path from 'path';
import { ModulePathInput, ApiType } from '../types/common.types';

/**
 * Generates the target directory path for a module
 */
export const getModulePath = ({
  moduleName,
  baseDir = process.cwd(),
  targetDir,
}: ModulePathInput & { targetDir?: string }): string => {
  if (targetDir) {
    // If targetDir is absolute, use it directly
    if (path.isAbsolute(targetDir)) {
      return path.join(targetDir, 'src', 'apis', moduleName);
    }
    // If targetDir is relative, resolve it from baseDir
    return path.join(baseDir, targetDir, 'src', 'apis', moduleName);
  }

  // Default behavior: use baseDir/src/apis/moduleName
  return path.join(baseDir, 'src', 'apis', moduleName);
};

/**
 * Gets the list of subdirectories to create for an API module based on type
 */
export const getModuleSubdirectories = (apiType?: ApiType, trpcStyle?: boolean): string[] => {
  if (apiType?.type === 'services') {
    if (trpcStyle) {
      // tRPC services need procedures/ and types/ folders
      return ['procedures', 'types'];
    }
    // REST services only need services/ and types/ folders
    return ['services', 'types'];
  }

  if (trpcStyle) {
    // tRPC APIs need procedures/ instead of controllers/
    return ['procedures', 'handlers', 'repository', 'services', 'types', 'validators'];
  }

  // REST CRUD and custom APIs need all folders
  return ['controllers', 'handlers', 'repository', 'services', 'types', 'validators'];
};
