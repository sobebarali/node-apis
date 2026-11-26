/**
 * Configuration management service
 */

import * as path from 'path';
import * as fs from 'fs-extra';
import {
  Config,
  ConfigValidationResult,
  DEFAULT_GENERATION_SETTINGS,
  GenerationSettings,
} from '../types/config.types';

const DEFAULT_CONFIG_FILENAME = 'node-apis.config.json';
const CONFIG_VERSION = '2.0.0';
const DEFAULT_APIS_DIR = path.join('src', 'apis');
const ERROR_MODES = ['catch', 'throw'];
const IDENTIFIER_REGEX = /^[A-Za-z_$][\w$]*$/;
const SOURCE_EXTENSION_REGEX = /\.(ts|tsx|mts|cts|js|jsx|mjs|cjs)$/;
const HANDLER_FOLDER = 'handlers';

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

const validateHandlers = (handlers: unknown): string[] => {
  if (handlers === undefined) {
    return [];
  }

  if (!isRecord(handlers)) {
    return ['handlers must be an object'];
  }

  const errors: string[] = [];
  const { context, errors: errorMode, errorsFile } = handlers;

  if (errorMode !== undefined && !ERROR_MODES.includes(errorMode as string)) {
    errors.push("handlers.errors must be 'catch' or 'throw'");
  }

  if (errorsFile !== undefined && (typeof errorsFile !== 'string' || !errorsFile.trim())) {
    errors.push('handlers.errorsFile must be an import path, for example "./src/apis/errors"');
  }

  if (context === undefined) {
    return errors;
  }

  if (!isRecord(context)) {
    return [...errors, 'handlers.context must be an object with "type" and "from"'];
  }

  if (typeof context.type !== 'string' || !IDENTIFIER_REGEX.test(context.type)) {
    errors.push('handlers.context.type must be the name of a type, for example "AppContext"');
  }

  if (typeof context.from !== 'string' || context.from.trim().length === 0) {
    errors.push('handlers.context.from must be an import path, for example "./src/context"');
  }

  return errors;
};

const validateValidators = (validators: unknown): string[] => {
  if (validators === undefined) {
    return [];
  }

  if (!isRecord(validators)) {
    return ['validators must be an object'];
  }

  return validators.validatePayload === undefined || typeof validators.validatePayload === 'boolean'
    ? []
    : ['validators.validatePayload must be true or false'];
};

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

  errors.push(...validateHandlers(config.handlers), ...validateValidators(config.validators));

  return { isValid: errors.length === 0, errors };
};

/**
 * Loads configuration from file. Returns null when there is no usable config.
 */
export const loadConfig = async ({
  baseDir,
}: { baseDir?: string } = {}): Promise<Config | null> => {
  const filePath = getConfigPath({ ...(baseDir && { baseDir }) });

  if (!(await fs.pathExists(filePath))) {
    return null;
  }

  try {
    const config: unknown = JSON.parse(await fs.readFile(filePath, 'utf8'));
    const validation = validateConfig({ config });

    if (!validation.isValid) {
      warnOnce(
        filePath,
        `⚠️  Ignoring ${DEFAULT_CONFIG_FILENAME}: ${validation.errors.join(', ')}`
      );
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

const isProjectPath = (from: string): boolean => from.startsWith('./') || from.startsWith('../');

/**
 * Turns a configured `from` into the import path a file in a module folder uses.
 * './src/context' is a file in the project; 'my-package/context' is used as written.
 */
const resolveImportPath = ({
  from,
  projectRoot,
  modulePath,
}: {
  from: string;
  projectRoot: string;
  modulePath: string;
}): string => {
  const trimmed = from.trim();

  if (!isProjectPath(trimmed)) {
    return trimmed;
  }

  const target = path.resolve(projectRoot, trimmed.replace(SOURCE_EXTENSION_REGEX, ''));
  const relative = path
    .relative(path.join(modulePath, HANDLER_FOLDER), target)
    .split(path.sep)
    .join('/');

  return relative.startsWith('.') ? relative : `./${relative}`;
};

/**
 * Reads the config options that shape the generated code of one module
 */
export const getGenerationSettings = async ({
  projectRoot,
  modulePath,
}: {
  projectRoot: string;
  modulePath: string;
}): Promise<GenerationSettings> => {
  const config = await loadConfig({ baseDir: projectRoot });
  const context = config?.handlers?.context;
  const errorsFile = config?.handlers?.errorsFile?.trim();

  return {
    errors: config?.handlers?.errors ?? DEFAULT_GENERATION_SETTINGS.errors,
    validatePayload:
      config?.validators?.validatePayload ?? DEFAULT_GENERATION_SETTINGS.validatePayload,
    ...(context && {
      context: {
        type: context.type,
        importPath: resolveImportPath({ from: context.from, projectRoot, modulePath }),
      },
    }),
    ...(errorsFile && {
      errorsFile: {
        importPath: resolveImportPath({ from: errorsFile, projectRoot, modulePath }),
        ...(isProjectPath(errorsFile) && {
          filePath: `${path.resolve(projectRoot, errorsFile.replace(SOURCE_EXTENSION_REGEX, ''))}.ts`,
        }),
      },
    }),
  };
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
    throw new Error(
      'The modules directory must be a path inside the project, for example src/apis.'
    );
  }

  const scope = { ...(baseDir && { baseDir }) };
  const config = await loadConfig(scope);

  // Never replace a config we could not read: it may hold settings worth keeping
  if (config === null && (await configExists(scope))) {
    throw new Error(
      `${DEFAULT_CONFIG_FILENAME} could not be read. Fix or delete it, then try again.`
    );
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
