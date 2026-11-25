import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs-extra';

const execFileAsync = promisify(execFile);

/**
 * Formats generated files with the target project's Prettier.
 * Projects without Prettier (for example ones using Biome) are left as generated.
 */
export const formatGeneratedFiles = async (filePaths: string[]): Promise<void> => {
  if (filePaths.length === 0) {
    return;
  }

  const prettierPath = path.join(process.cwd(), 'node_modules', '.bin', 'prettier');

  if (!(await fs.pathExists(prettierPath))) {
    return;
  }

  try {
    await execFileAsync(prettierPath, ['--write', ...filePaths]);
    console.log(`✨ Formatted ${filePaths.length} generated files`);
  } catch (error) {
    console.warn(
      '⚠️  Code formatting failed:',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
};
