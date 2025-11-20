/**
 * Location validation logic
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';
import { ValidationLocationResult, ValidationLocationInput } from '../types/generation.types';

/**
 * Validates that the target location is appropriate for module generation
 */
export const validateTargetLocation = async ({
  baseDir = process.cwd(),
}: ValidationLocationInput = {}): Promise<ValidationLocationResult> => {
  try {
    // Check if we can write to the target directory
    await fs.access(baseDir, fs.constants.W_OK);

    // Check if this looks like a Node.js project (has package.json)
    const packageJsonPath = path.join(baseDir, 'package.json');
    const hasPackageJson = await fs.pathExists(packageJsonPath);

    if (!hasPackageJson) {
      console.warn(chalk.yellow('⚠️  Warning: No package.json found in current directory.'));
      console.warn(chalk.yellow("   This doesn't appear to be a Node.js project."));
    }

    return {
      isValid: true,
      hasPackageJson,
    };
  } catch (error: any) {
    return {
      isValid: false,
      error: `Cannot write to target directory: ${error.message}`,
    };
  }
};

/**
 * Validates and creates a directory if it doesn't exist
 */
export const validateAndCreateDirectory = async (dirPath: string): Promise<boolean> => {
  try {
    // Check if path is valid (not empty, no dangerous patterns)
    if (!dirPath || dirPath.trim() === '') {
      throw new Error('Directory path cannot be empty');
    }

    // Normalize the path to resolve relative paths
    const normalizedPath = path.normalize(dirPath);

    // Check if directory already exists
    const exists = await fs.pathExists(normalizedPath);

    if (exists) {
      // Verify it's a directory
      const stats = await fs.stat(normalizedPath);
      if (!stats.isDirectory()) {
        throw new Error(`Path exists but is not a directory: ${normalizedPath}`);
      }

      // Check if we can write to it
      await fs.access(normalizedPath, fs.constants.W_OK);
      return true;
    }

    // Directory doesn't exist, create it
    await fs.ensureDir(normalizedPath);
    console.log(chalk.green(`✅ Created directory: ${normalizedPath}`));

    return true;
  } catch (error: any) {
    console.error(chalk.red(`❌ Failed to validate/create directory: ${error.message}`));
    return false;
  }
};
