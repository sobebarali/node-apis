/**
 * Path utility functions
 */

import * as path from 'path';
import { ModulePathInput } from '../types/common.types';
import { getApisDir } from '../services/config.service';

/**
 * Resolves the project root modules are generated into
 */
export const getProjectRoot = ({
  baseDir = process.cwd(),
  targetDir,
}: { baseDir?: string; targetDir?: string } = {}): string =>
  targetDir ? path.resolve(baseDir, targetDir) : baseDir;

/**
 * Generates the target directory path for a module
 */
export const getModulePath = async ({
  moduleName,
  baseDir = process.cwd(),
  targetDir,
}: ModulePathInput & { targetDir?: string }): Promise<string> => {
  const root = getProjectRoot({ baseDir, ...(targetDir && { targetDir }) });
  const apisDir = await getApisDir({ baseDir: root });

  return path.join(root, apisDir, moduleName);
};
