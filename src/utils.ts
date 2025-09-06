import * as path from 'path';
import * as fs from 'fs-extra';

// Type definitions
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  normalizedName?: string;
}

export interface ModuleNameInput {
  name: string;
}

export interface ModulePathInput {
  moduleName: string;
  baseDir?: string;
}

export interface DirectoryExistsInput {
  dirPath: string;
}

export interface SuccessMessageInput {
  moduleName: string;
  modulePath: string;
}

/**
 * Validates a module name using functional programming style
 */
export const validateModuleName = ({ name }: ModuleNameInput): ValidationResult => {
  if (!name || typeof name !== 'string') {
    return {
      isValid: false,
      error: 'Module name is required and must be a string'
    };
  }

  const trimmedName = name.trim();

  if (trimmedName.length === 0) {
    return {
      isValid: false,
      error: 'Module name cannot be empty'
    };
  }

  // Check for valid characters (alphanumeric, hyphens, underscores)
  const validNameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!validNameRegex.test(trimmedName)) {
    return {
      isValid: false,
      error: 'Module name can only contain letters, numbers, hyphens, and underscores'
    };
  }

  // Check if name starts with a letter or underscore
  if (!/^[a-zA-Z_]/.test(trimmedName)) {
    return {
      isValid: false,
      error: 'Module name must start with a letter or underscore'
    };
  }

  return {
    isValid: true,
    normalizedName: trimmedName.toLowerCase()
  };
};

/**
 * Generates the target directory path for a module using functional programming style
 */
export const getModulePath = ({ moduleName, baseDir = process.cwd() }: ModulePathInput): string => {
  return path.join(baseDir, 'src', 'apis', moduleName);
};

/**
 * Checks if a directory already exists using functional programming style
 */
export const directoryExists = async ({ dirPath }: DirectoryExistsInput): Promise<boolean> => {
  try {
    const stats = await fs.stat(dirPath);
    return stats.isDirectory();
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return false;
    }
    throw error;
  }
};

/**
 * Gets the list of subdirectories to create for an API module using functional programming style
 */
export const getModuleSubdirectories = (): string[] => {
  return [
    'controllers',
    'handlers',
    'schema',
    'types',
    'repository',
    'validators'
  ];
};

/**
 * Formats a success message with the created structure using functional programming style
 */
export const formatSuccessMessage = ({ moduleName, modulePath }: SuccessMessageInput): string => {
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
