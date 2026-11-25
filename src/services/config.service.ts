/**
 * Configuration management service
 */

import * as path from 'path';
import * as fs from 'fs-extra';
import { Config, ConfigValidationResult } from '../types/config.types';

const DEFAULT_CONFIG_FILENAME = 'node-apis.config.json';
const CONFIG_VERSION = '2.0.0';
const DEFAULT_APIS_DIR = path.join('src', 'apis');

const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Unknown error';

const warnedPaths = new Set<string>();

/** A config is read several times per run, so report a broken one only once */
const warnOnce = (filePath: string, message: string): void => {
  if (!warnedPaths.has(filePath)) {
    warnedPaths.add(filePath);
    console.warn(message);
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Gets the config file path
 */
export const getConfigPath = ({ baseDir = process.cwd() }: { baseDir?: string } = {}): string =>
  path.join(baseDir, DEFAULT_CONFIG_FILENAME);

/**
 * Checks if config file exists
 */
export const configExists = async ({ baseDir }: { baseDir?: string } = {}): Promise<boolean> =>
  fs.pathExists(getConfigPath({ ...(baseDir && { baseDir }) }));

/**
 * Validates configuration object. Unknown keys (for example the `framework`
 * setting of older versions) are ignored.
 */
export const validateConfig = ({ config }: { config: unknown }): ConfigValidationResult => {
  if (!isRecord(config)) {
    return { isValid: false, errors: ['Config must be an object'] };
  }

  const errors: string[] = [];
  const { paths } = config;

  if (paths !== undefined && !isRecord(paths)) {
    errors.push('paths must be an object');
  } else if (paths?.apisDir !== undefined && typeof paths.apisDir !== 'string') {
    errors.push('paths.apisDir must be a string');
  }

  return { isValid: errors.length === 0, errors };
};

/**
 * Loads configuration from file. Returns null when there is no usable config.
 */
export const loadConfig = async ({ baseDir }: { baseDir?: string } = {}): Promise<Config | null> => {
  const filePath = getConfigPath({ ...(baseDir && { baseDir }) });

  if (!(await fs.pathExists(filePath))) {
    return null;
  }

  try {
    const config: unknown = JSON.parse(await fs.readFile(filePath, 'utf8'));
    const validation = validateConfig({ config });

    if (!validation.isValid) {
      warnOnce(filePath, `⚠️  Ignoring ${DEFAULT_CONFIG_FILENAME}: ${validation.errors.join(', ')}`);
      return null;
    }

    return config as Config;
  } catch (error) {
    warnOnce(filePath, `⚠️  Failed to load config: ${errorMessage(error)}`);
    return null;
  }
};

/**
 * Saves configuration to file
 */
export const saveConfig = async ({
  config,
  baseDir,
}: {
  config: Config;
  baseDir?: string;
}): Promise<void> => {
  const validation = validateConfig({ config });

  if (!validation.isValid) {
    throw new Error(`Config validation failed: ${validation.errors.join(', ')}`);
  }

  await fs.writeFile(
    getConfigPath({ ...(baseDir && { baseDir }) }),
    `${JSON.stringify(config, null, 2)}\n`,
    'utf8'
  );
};

/**
 * Gets the directory that holds the generated modules
 */
export const getApisDir = async ({ baseDir }: { baseDir?: string } = {}): Promise<string> => {
  const config = await loadConfig({ ...(baseDir && { baseDir }) });
  return config?.paths?.apisDir ?? DEFAULT_APIS_DIR;
};

/**
 * Tells whether the project has chosen its modules directory in config
 */
export const hasConfiguredApisDir = async ({
  baseDir,
}: { baseDir?: string } = {}): Promise<boolean> => {
  const config = await loadConfig({ ...(baseDir && { baseDir }) });
  return config?.paths?.apisDir !== undefined;
};

/**
 * Sets the modules directory in config, creating the config when missing
 */
export const setApisDir = async ({
  apisDir,
  baseDir,
}: {
  apisDir: string;
  baseDir?: string;
}): Promise<void> => {
  const normalized = path.normalize(apisDir.trim());

  if (apisDir.trim().length === 0 || normalized === '.') {
    throw new Error('The modules directory cannot be empty.');
  }

  if (path.isAbsolute(normalized) || normalized.split(path.sep).includes('..')) {
    throw new Error('The modules directory must be a path inside the project, for example src/apis.');
  }

  const scope = { ...(baseDir && { baseDir }) };
  const config = await loadConfig(scope);

  // Never replace a config we could not read: it may hold settings worth keeping
  if (config === null && (await configExists(scope))) {
    throw new Error(`${DEFAULT_CONFIG_FILENAME} could not be read. Fix or delete it, then try again.`);
  }

  await saveConfig({
    config: {
      ...config,
      version: CONFIG_VERSION,
      paths: { ...config?.paths, apisDir: normalized },
    },
    ...scope,
  });
};

/**
 * Initializes a new config file
 */
export const initializeConfig = async ({
  force = false,
  baseDir,
}: { force?: boolean; baseDir?: string } = {}): Promise<Config> => {
  if ((await configExists({ ...(baseDir && { baseDir }) })) && !force) {
    throw new Error('Config file already exists. Use --force to overwrite.');
  }

  const config: Config = {
    version: CONFIG_VERSION,
    paths: { apisDir: DEFAULT_APIS_DIR },
  };

  await saveConfig({ config, ...(baseDir && { baseDir }) });
  return config;
};
