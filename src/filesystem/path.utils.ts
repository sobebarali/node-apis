/**
 * Path utility functions
 */

import * as path from 'path';
import { ModulePathInput } from '../types/common.types';

/**
 * Generates the target directory path for a module
 */
export const getModulePath = ({ moduleName, baseDir = process.cwd() }: ModulePathInput): string => {
  return path.join(baseDir, 'src', 'apis', moduleName);
};

/**
 * Gets the list of subdirectories to create for an API module
 */
export const getModuleSubdirectories = (): string[] => {
  return [
    'controllers',
    'handlers',
    'repository',
    'types',
    'validators',
    'schema'
  ];
};
