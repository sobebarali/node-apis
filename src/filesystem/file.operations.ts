/**
 * File operations
 */

import * as fs from 'fs-extra';
import { GeneratedFile } from '../types/common.types';

/**
 * Writes content to a file
 */
export const writeFile = async ({
  filePath,
  content,
}: {
  filePath: string;
  content: string;
}): Promise<void> => {
  await fs.writeFile(filePath, content, 'utf8');
};

/**
 * Checks if a file exists
 */
export const fileExists = async ({ filePath }: { filePath: string }): Promise<boolean> => {
  return await fs.pathExists(filePath);
};

/**
 * Reads files from a directory with a specific extension
 */
export const getFilesWithExtension = async ({
  dirPath,
  extension,
}: {
  dirPath: string;
  extension: string;
}): Promise<string[]> => {
  try {
    const files = await fs.readdir(dirPath);
    return files.filter(file => file.endsWith(extension));
  } catch (error) {
    return [];
  }
};

/**
 * Writes multiple files
 */
export const writeMultipleFiles = async ({ files }: { files: GeneratedFile[] }): Promise<void> => {
  for (const file of files) {
    await writeFile({ filePath: file.filePath, content: file.content });
  }
};
