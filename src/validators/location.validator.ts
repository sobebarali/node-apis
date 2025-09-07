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
