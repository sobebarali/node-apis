/**
 * Module detection service
 */

import * as path from 'path';
import { ExistingModule, ModuleDetectionInput } from '../types/common.types';
import { getApisDir } from './config.service';
import { getModulePath, getProjectRoot } from '../filesystem/path.utils';
import { validateModuleName } from '../validators/module-name.validator';
import { directoryExists, getDirectories } from '../filesystem/directory.operations';
import { getFilesWithExtension } from '../filesystem/file.operations';

/**
 * Detects if a module already exists and returns information about it
 */
export const detectExistingModule = async ({
  moduleName,
  baseDir = process.cwd(),
  targetDir,
}: ModuleDetectionInput & { targetDir?: string }): Promise<ExistingModule | null> => {
  // The directory is named after the normalized (kebab-case) module name
  const directoryName = validateModuleName({ name: moduleName }).normalizedName ?? moduleName;
  const modulePath = await getModulePath({
    moduleName: directoryName,
    baseDir,
    ...(targetDir && { targetDir }),
  });

  if (!(await directoryExists({ dirPath: modulePath }))) {
    return null;
  }

  const typesDir = path.join(modulePath, 'types');
  const hasTypes = await directoryExists({ dirPath: typesDir });
  const existingFiles = hasTypes
    ? await getFilesWithExtension({ dirPath: typesDir, extension: '.ts' })
    : [];

  return { moduleName, modulePath, existingFiles, hasTypes };
};

/**
 * Gets a list of existing modules in the project
 */
export const getExistingModules = async ({
  baseDir = process.cwd(),
  targetDir,
}: {
  baseDir?: string;
  targetDir?: string;
} = {}): Promise<string[]> => {
  const root = getProjectRoot({ baseDir, ...(targetDir && { targetDir }) });
  const apisDir = path.join(root, await getApisDir({ baseDir: root }));

  if (!(await directoryExists({ dirPath: apisDir }))) {
    return [];
  }

  return getDirectories({ dirPath: apisDir });
};
