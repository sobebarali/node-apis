import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs-extra';

const execFileAsync = promisify(execFile);

/** Formatters a project may have installed, in the order they are tried */
const FORMATTERS = [
  { bin: 'prettier', args: ['--write'] },
  { bin: 'biome', args: ['format', '--write'] },
];

/**
 * Formats generated files with the target project's own formatter: Prettier,
 * or Biome when there is no Prettier. A project with neither keeps the files as generated.
 */
export const formatGeneratedFiles = async (filePaths: string[]): Promise<void> => {
  if (filePaths.length === 0) {
    return;
  }

  const binDir = path.join(process.cwd(), 'node_modules', '.bin');
  const installed = await Promise.all(
    FORMATTERS.map(formatter => fs.pathExists(path.join(binDir, formatter.bin)))
  );
  const formatter = FORMATTERS[installed.indexOf(true)];

  if (!formatter) {
    return;
  }

  try {
    await execFileAsync(path.join(binDir, formatter.bin), [...formatter.args, ...filePaths]);
    console.log(`✨ Formatted ${filePaths.length} generated files with ${formatter.bin}`);
  } catch (error) {
    console.warn(
      '⚠️  Code formatting failed:',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
};
