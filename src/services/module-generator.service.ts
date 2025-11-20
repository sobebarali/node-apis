/**
 * Module generation service - Main business logic
 */

import { GenerationInput, GenerationResult } from '../types/generation.types';
import { GeneratedFile, ApiType } from '../types/common.types';
import { SupportedFramework } from '../types/config.types';
import { validateModuleName, EnhancedValidationResult } from '../validators/module-name.validator';
import { getModulePath, getModuleSubdirectories } from '../filesystem/path.utils';
import {
  directoryExists,
  ensureDirectory,
  createDirectories,
} from '../filesystem/directory.operations';
import { generateApiFiles } from './file-generator.service';
import * as path from 'path';

/**
 * Generates the API module folder structure
 */
export const generateModuleStructure = async ({
  moduleName,
  options = {},
  apiType,
}: GenerationInput): Promise<GenerationResult> => {
  const { baseDir = process.cwd(), force = false, appendMode = false, targetDir } = options;

  try {
    // Validate the module name with enhanced naming
    const validation = validateModuleName({ name: moduleName }) as EnhancedValidationResult;
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error!,
      };
    }

    const normalizedName = validation.normalizedName!;
    const modulePath = await getModulePath({
      moduleName: normalizedName,
      baseDir,
      ...(targetDir && { targetDir }),
    });

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

    // Create all subdirectories based on API type
    const subdirectories = getModuleSubdirectories(apiType, false, apiType?.framework);
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
    const message = formatSuccessMessage({
      moduleName: normalizedName,
      modulePath,
      ...(apiType && { apiType }),
    });

    return {
      success: true,
      moduleName: normalizedName,
      modulePath,
      createdDirectories: createdDirs,
      generatedFiles,
      message,
    };
  } catch (error: any) {
    return await handleGenerationError(error, moduleName, baseDir);
  }
};

/**
 * Phase 1: Creates only the main module directory and types subdirectory
 * Used for two-phase generation where we want to generate types first
 */
export const generateModuleStructurePhase1 = async ({
  moduleName,
  options = {},
  framework,
}: Omit<GenerationInput, 'apiType'> & { framework?: SupportedFramework }): Promise<GenerationResult> => {
  const { baseDir = process.cwd(), force = false, appendMode = false, targetDir } = options;

  try {
    // Validate the module name with enhanced naming
    const validation = validateModuleName({ name: moduleName }) as EnhancedValidationResult;
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error!,
      };
    }

    const normalizedName = validation.normalizedName!;
    const modulePath = await getModulePath({
      moduleName: normalizedName,
      baseDir,
      ...(framework && { framework }),
      ...(targetDir && { targetDir }),
    });

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

    // Create only the types subdirectory for phase 1
    const typesDir = path.join(modulePath, 'types');
    await ensureDirectory({ dirPath: typesDir });

    return {
      success: true,
      moduleName: normalizedName,
      modulePath,
      createdDirectories: [modulePath, typesDir],
      generatedFiles: [],
      message: `✅ Phase 1: Created module directory and types folder for "${normalizedName}"`,
    };
  } catch (error: any) {
    return await handleGenerationError(error, moduleName, baseDir);
  }
};

/**
 * Phase 2: Creates remaining subdirectories based on API type
 * Used after user confirms the generated types
 */
export const generateModuleStructurePhase2 = async ({
  modulePath,
  apiType,
  trpcStyle = false,
  framework,
}: {
  modulePath: string;
  apiType: ApiType;
  trpcStyle?: boolean;
  framework?: string;
}): Promise<{ success: boolean; createdDirectories: string[]; error?: string }> => {
  try {
    // Get all subdirectories for this API type and style
    const allSubdirectories = getModuleSubdirectories(apiType, trpcStyle, framework);

    // Filter out 'types' since it was already created in phase 1
    const remainingSubdirectories = allSubdirectories.filter(dir => dir !== 'types');

    // Create remaining subdirectories
    const createdDirs = await createDirectories({
      basePath: modulePath,
      subdirectories: remainingSubdirectories,
    });

    return {
      success: true,
      createdDirectories: createdDirs,
    };
  } catch (error: any) {
    return {
      success: false,
      createdDirectories: [],
      error: `Failed to create remaining directories: ${error.message}`,
    };
  }
};

/**
 * Formats a success message with the created structure
 */
const formatSuccessMessage = ({
  moduleName,
  modulePath,
  apiType,
}: {
  moduleName: string;
  modulePath: string;
  apiType?: ApiType;
}): string => {
  const subdirs = getModuleSubdirectories(apiType, false, apiType?.framework);
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
const handleGenerationError = async (
  error: any,
  moduleName: string,
  baseDir: string
): Promise<GenerationResult> => {
  // Handle specific file system errors
  if (error.code === 'EACCES') {
    return {
      success: false,
      error: `Permission denied. Cannot create directories at: ${await getModulePath({ moduleName, baseDir })}`,
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
