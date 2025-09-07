import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs-extra';

const execAsync = promisify(exec);

/**
 * Formats TypeScript files using Prettier
 */
export const formatGeneratedFiles = async (filePaths: string[]): Promise<void> => {
  if (filePaths.length === 0) return;

  try {
    // Check if prettier is available
    const prettierPath = path.join(process.cwd(), 'node_modules', '.bin', 'prettier');
    const prettierExists = await fs.pathExists(prettierPath);

    if (!prettierExists) {
      console.warn('⚠️  Prettier not found. Skipping code formatting.');
      return;
    }

    // Format each file
    for (const filePath of filePaths) {
      try {
        if (await fs.pathExists(filePath)) {
          await execAsync(`"${prettierPath}" --write "${filePath}"`);
        }
      } catch (error) {
        console.warn(
          `⚠️  Failed to format ${filePath}:`,
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
    }

    console.log(`✨ Formatted ${filePaths.length} generated files`);
  } catch (error) {
    console.warn(
      '⚠️  Code formatting failed:',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
};

/**
 * Formats all TypeScript files in a directory
 */
export const formatDirectory = async (directoryPath: string): Promise<void> => {
  try {
    const prettierPath = path.join(process.cwd(), 'node_modules', '.bin', 'prettier');
    const prettierExists = await fs.pathExists(prettierPath);

    if (!prettierExists) {
      console.warn('⚠️  Prettier not found. Skipping code formatting.');
      return;
    }

    // Format all TypeScript files in the directory
    const pattern = path.join(directoryPath, '**/*.ts');
    await execAsync(`"${prettierPath}" --write "${pattern}"`);

    console.log(`✨ Formatted all TypeScript files in ${directoryPath}`);
  } catch (error) {
    console.warn(
      '⚠️  Directory formatting failed:',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
};

/**
 * Formats a single file
 */
export const formatFile = async (filePath: string): Promise<void> => {
  try {
    const prettierPath = path.join(process.cwd(), 'node_modules', '.bin', 'prettier');
    const prettierExists = await fs.pathExists(prettierPath);

    if (!prettierExists) {
      console.warn('⚠️  Prettier not found. Skipping code formatting.');
      return;
    }

    if (await fs.pathExists(filePath)) {
      await execAsync(`"${prettierPath}" --write "${filePath}"`);
      console.log(`✨ Formatted ${filePath}`);
    }
  } catch (error) {
    console.warn(
      `⚠️  Failed to format ${filePath}:`,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
};
