/**
 * Module generation service - Main business logic
 */

import { GenerationInput, GenerationResult } from '../types/generation.types';
import { GeneratedFile } from '../types/common.types';
import { validateModuleName } from '../validators/module-name.validator';
import { getModulePath, getModuleSubdirectories } from '../filesystem/path.utils';
import {
  directoryExists,
  ensureDirectory,
  createDirectories,
} from '../filesystem/directory.operations';
import { generateApiFiles } from './file-generator.service';

/**
 * Generates the API module folder structure
 */
export const generateModuleStructure = async ({
  moduleName,
  options = {},
  apiType,
}: GenerationInput): Promise<GenerationResult> => {
  const { baseDir = process.cwd(), force = false, appendMode = false } = options;

  try {
    // Validate the module name
    const validation = validateModuleName({ name: moduleName });
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error!,
      };
    }

    const normalizedName = validation.normalizedName!;
    const modulePath = getModulePath({ moduleName: normalizedName, baseDir });

    // Check if directory already exists
    const exists = await directoryExists({ dirPath: modulePath });
    if (exists && !force && !appendMode) {
      return {
        success: false,
        error: `Module directory already exists: ${modulePath}\nUse --force flag to overwrite or run in interactive mode to append.`,
      };
    }

    // Create the main module directory
    await ensureDirectory({ dirPath: modulePath });

    // Create all subdirectories
    const subdirectories = getModuleSubdirectories();
    const createdDirs = await createDirectories({
      basePath: modulePath,
      subdirectories,
    });

    // Generate TypeScript files if apiType is provided
    let generatedFiles: GeneratedFile[] = [];
    if (apiType) {
      generatedFiles = await generateApiFiles({
        moduleName: normalizedName,
        modulePath,
        apiType,
        appendMode,
      });
    }

    // Format success message
    const message = formatSuccessMessage({ moduleName: normalizedName, modulePath });

    return {
      success: true,
      moduleName: normalizedName,
      modulePath,
      createdDirectories: createdDirs,
      generatedFiles,
      message,
    };
  } catch (error: any) {
    return handleGenerationError(error, moduleName, baseDir);
  }
};

/**
 * Formats a success message with the created structure
 */
const formatSuccessMessage = ({
  moduleName,
  modulePath,
}: {
  moduleName: string;
  modulePath: string;
}): string => {
  const subdirs = getModuleSubdirectories();
  const structure = subdirs.map(dir => `  ├── ${dir}/`).join('\n');

  return `
✅ Successfully created API module structure for "${moduleName}"

📁 Created directory structure:
${modulePath}/
${structure}

🚀 Your API module is ready for development!
`;
};

/**
 * Handles generation errors with specific error types
 */
const handleGenerationError = (
  error: any,
  moduleName: string,
  baseDir: string
): GenerationResult => {
  // Handle specific file system errors
  if (error.code === 'EACCES') {
    return {
      success: false,
      error: `Permission denied. Cannot create directories at: ${getModulePath({ moduleName, baseDir })}`,
    };
  }

  if (error.code === 'ENOSPC') {
    return {
      success: false,
      error: 'Not enough disk space to create the module structure',
    };
  }

  if (error.code === 'ENOTDIR') {
    return {
      success: false,
      error: 'Invalid path: A file exists where a directory is expected',
    };
  }

  // Generic error handling
  return {
    success: false,
    error: `Failed to create module structure: ${error.message}`,
  };
};
