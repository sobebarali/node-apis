/**
 * Module detection service
 */

import * as path from 'path';
import { ExistingModule, ModuleDetectionInput } from '../types/common.types';
import { getModulePath } from '../filesystem/path.utils';
import { directoryExists, getDirectories } from '../filesystem/directory.operations';
import { getFilesWithExtension } from '../filesystem/file.operations';

/**
 * Detects if a module already exists and returns information about it
 */
export const detectExistingModule = async ({
  moduleName,
  baseDir = process.cwd(),
}: ModuleDetectionInput): Promise<ExistingModule | null> => {
  const modulePath = getModulePath({ moduleName, baseDir });
  const exists = await directoryExists({ dirPath: modulePath });

  if (!exists) {
    return null;
  }

  const typesDir = path.join(modulePath, 'types');
  const hasTypes = await directoryExists({ dirPath: typesDir });

  let existingFiles: string[] = [];
  if (hasTypes) {
    existingFiles = await getFilesWithExtension({
      dirPath: typesDir,
      extension: '.ts',
    });
  }

  return {
    moduleName,
    modulePath,
    existingFiles,
    hasTypes,
  };
};

/**
 * Gets a list of existing modules in the project
 */
export const getExistingModules = async ({
  baseDir = process.cwd(),
}: {
  baseDir?: string;
} = {}): Promise<string[]> => {
  const apisDir = path.join(baseDir, 'src', 'apis');
  const exists = await directoryExists({ dirPath: apisDir });

  if (!exists) {
    return [];
  }

  return await getDirectories({ dirPath: apisDir });
};
