import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';
import {
  validateModuleName,
  getModulePath,
  directoryExists,
  getModuleSubdirectories,
  formatSuccessMessage
} from './utils';

// Type definitions
export interface GenerationOptions {
  baseDir?: string;
  force?: boolean;
}

export interface GenerationInput {
  moduleName: string;
  options?: GenerationOptions;
}

export interface GenerationResult {
  success: boolean;
  error?: string;
  moduleName?: string;
  modulePath?: string;
  createdDirectories?: string[];
  message?: string;
}

export interface ValidationInput {
  baseDir?: string;
}

export interface ValidationLocationResult {
  isValid: boolean;
  error?: string;
  hasPackageJson?: boolean;
}

/**
 * Generates the API module folder structure using functional programming style
 */
export const generateModuleStructure = async ({
  moduleName,
  options = {}
}: GenerationInput): Promise<GenerationResult> => {
  const { baseDir = process.cwd(), force = false } = options;

  try {
    // Validate the module name
    const validation = validateModuleName({ name: moduleName });
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error!
      };
    }

    const normalizedName = validation.normalizedName!;
    const modulePath = getModulePath({ moduleName: normalizedName, baseDir });

    // Check if directory already exists
    const exists = await directoryExists({ dirPath: modulePath });
    if (exists && !force) {
      return {
        success: false,
        error: `Module directory already exists: ${modulePath}\nUse --force flag to overwrite.`
      };
    }

    // Create the main module directory
    await fs.ensureDir(modulePath);

    // Create all subdirectories
    const subdirectories = getModuleSubdirectories();
    const createdDirs: string[] = [];

    for (const subdir of subdirectories) {
      const subdirPath = path.join(modulePath, subdir);
      await fs.ensureDir(subdirPath);
      createdDirs.push(subdirPath);
    }

    // Return success result
    return {
      success: true,
      moduleName: normalizedName,
      modulePath,
      createdDirectories: createdDirs,
      message: formatSuccessMessage({ moduleName: normalizedName, modulePath })
    };

  } catch (error: any) {
    // Handle specific file system errors
    if (error.code === 'EACCES') {
      return {
        success: false,
        error: `Permission denied. Cannot create directories at: ${getModulePath({ moduleName, baseDir })}`
      };
    }

    if (error.code === 'ENOSPC') {
      return {
        success: false,
        error: 'Not enough disk space to create the module structure'
      };
    }

    if (error.code === 'ENOTDIR') {
      return {
        success: false,
        error: 'Invalid path: A file exists where a directory is expected'
      };
    }

    // Generic error handling
    return {
      success: false,
      error: `Failed to create module structure: ${error.message}`
    };
  }
};

/**
 * Validates that the target location is appropriate for module generation using functional programming style
 */
export const validateTargetLocation = async ({
  baseDir = process.cwd()
}: ValidationInput = {}): Promise<ValidationLocationResult> => {
  try {
    // Check if we can write to the target directory
    await fs.access(baseDir, fs.constants.W_OK);

    // Check if this looks like a Node.js project (has package.json)
    const packageJsonPath = path.join(baseDir, 'package.json');
    const hasPackageJson = await fs.pathExists(packageJsonPath);

    if (!hasPackageJson) {
      console.warn(chalk.yellow('⚠️  Warning: No package.json found in current directory.'));
      console.warn(chalk.yellow('   This doesn\'t appear to be a Node.js project.'));
    }

    return {
      isValid: true,
      hasPackageJson
    };

  } catch (error: any) {
    return {
      isValid: false,
      error: `Cannot write to target directory: ${error.message}`
    };
  }
};
