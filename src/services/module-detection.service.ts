/**
 * Module detection service
 */

import * as path from 'path';
import { ExistingModule, ModuleDetectionInput } from '../types/common.types';
import { getEffectiveFramework } from './config.service';
import { getModulePath } from '../filesystem/path.utils';
import { directoryExists, getDirectories } from '../filesystem/directory.operations';
import { getFilesWithExtension } from '../filesystem/file.operations';

/**
 * Detects if a module already exists and returns information about it
 */
export const detectExistingModule = async ({
  moduleName,
  baseDir = process.cwd(),
  framework,
}: ModuleDetectionInput & { framework?: string }): Promise<ExistingModule | null> => {
  // Get effective framework if not provided
  const effectiveFramework = framework || await getEffectiveFramework();
  const modulePath = await getModulePath({ moduleName, baseDir, framework: effectiveFramework });
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
  framework,
}: {
  baseDir?: string;
  framework?: string;
} = {}): Promise<string[]> => {
  // Get effective framework if not provided
  const effectiveFramework = framework || await getEffectiveFramework();

  // Use detected source path instead of hardcoded 'src'
  const { detectSourcePath } = await import('../filesystem/path.utils');
  const srcPath = await detectSourcePath(baseDir);

  // Determine the correct directory based on framework
  let apisDir: string;
  if (effectiveFramework === 't3') {
    apisDir = path.join(baseDir, srcPath, 'server', 'api');
  } else if (effectiveFramework === 'tanstack') {
    apisDir = path.join(baseDir, srcPath);
  } else {
    apisDir = path.join(baseDir, srcPath, 'apis');
  }

  const exists = await directoryExists({ dirPath: apisDir });

  if (!exists) {
    return [];
  }

  return await getDirectories({ dirPath: apisDir });
};
