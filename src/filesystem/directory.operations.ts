/**
 * Directory operations
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { DirectoryExistsInput } from '../types/common.types';

/**
 * Checks if a directory already exists
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
 * Creates a directory and all its parent directories
 */
export const ensureDirectory = async ({ dirPath }: DirectoryExistsInput): Promise<void> => {
  await fs.ensureDir(dirPath);
};

/**
 * Creates multiple directories
 */
export const createDirectories = async ({ 
  basePath, 
  subdirectories 
}: { 
  basePath: string; 
  subdirectories: string[]; 
}): Promise<string[]> => {
  const createdDirs: string[] = [];

  for (const subdir of subdirectories) {
    const subdirPath = path.join(basePath, subdir);
    await ensureDirectory({ dirPath: subdirPath });
    createdDirs.push(subdirPath);
  }

  return createdDirs;
};

/**
 * Gets a list of directories in a given path
 */
export const getDirectories = async ({ dirPath }: DirectoryExistsInput): Promise<string[]> => {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    return entries
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name);
  } catch (error) {
    return [];
  }
};
