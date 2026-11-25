/**
 * Module generation service - creates the module directory
 */

import * as path from 'path';
import { GenerationInput, GenerationResult } from '../types/generation.types';
import { validateModuleName } from '../validators/module-name.validator';
import { getModulePath } from '../filesystem/path.utils';
import { directoryExists, ensureDirectory } from '../filesystem/directory.operations';

const ERROR_MESSAGES: Record<string, string> = {
  EACCES: 'Permission denied. Cannot create the module directory',
  ENOSPC: 'Not enough disk space to create the module structure',
  ENOTDIR: 'Invalid path: A file exists where a directory is expected',
};

const describeError = (error: unknown): string => {
  const code = (error as NodeJS.ErrnoException | null)?.code;

  if (code && ERROR_MESSAGES[code]) {
    return ERROR_MESSAGES[code];
  }

  return `Failed to create module structure: ${error instanceof Error ? error.message : 'Unknown error'}`;
};

/**
 * Validates the module name and creates the module directory with its
 * `types/` folder. The other folders are created when their files are written.
 */
export const createModuleDirectory = async ({
  moduleName,
  options = {},
}: Omit<GenerationInput, 'apiType'>): Promise<GenerationResult> => {
  const { baseDir = process.cwd(), force = false, appendMode = false, targetDir } = options;

  const validation = validateModuleName({ name: moduleName });
  if (!validation.isValid || !validation.normalizedName) {
    return { success: false, error: validation.error ?? 'Invalid module name' };
  }

  try {
    const normalizedName = validation.normalizedName;
    const modulePath = await getModulePath({
      moduleName: normalizedName,
      baseDir,
      ...(targetDir && { targetDir }),
    });

    if ((await directoryExists({ dirPath: modulePath })) && !force && !appendMode) {
      return {
        success: false,
        error: `Module directory already exists: ${modulePath}\nUse --force to regenerate its code (type files are kept), or pick the module in interactive mode to add operations.`,
      };
    }

    const typesDir = path.join(modulePath, 'types');
    await ensureDirectory({ dirPath: typesDir });

    return {
      success: true,
      moduleName: normalizedName,
      modulePath,
      createdDirectories: [modulePath, typesDir],
      generatedFiles: [],
    };
  } catch (error) {
    return { success: false, error: describeError(error) };
  }
};
