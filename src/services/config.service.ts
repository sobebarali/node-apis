/**
 * Configuration management service
 */

import * as path from 'path';
import * as fs from 'fs-extra';
import {
  Config,
  SupportedFramework,
  SupportedApiStyle,
  DatabaseConfig,
  ConfigValidationResult,
  InitConfigOptions,
  ConfigUpdateOptions,
} from '../types/config.types';

const DEFAULT_CONFIG_FILENAME = 'node-apis.config.json';
const CONFIG_VERSION = '1.0.0';

/**
 * Gets the config file path
 */
export const getConfigPath = ({
  configPath,
  baseDir = process.cwd(),
}: { configPath?: string; baseDir?: string } = {}): string => {
  if (configPath) {
    return configPath;
  }
  return path.join(baseDir, DEFAULT_CONFIG_FILENAME);
};

/**
 * Checks if config file exists
 */
export const configExists = async ({
  configPath,
}: { configPath?: string } = {}): Promise<boolean> => {
  const filePath = getConfigPath(configPath ? { configPath } : {});
  return await fs.pathExists(filePath);
};

/**
 * Loads configuration from file
 */
export const loadConfig = async ({
  configPath,
}: { configPath?: string } = {}): Promise<Config | null> => {
  try {
    const filePath = getConfigPath(configPath ? { configPath } : {});
    const exists = await configExists(configPath ? { configPath } : {});

    if (!exists) {
      return null;
    }

    const configContent = await fs.readFile(filePath, 'utf8');
    const config = JSON.parse(configContent) as Config;

    // Validate the loaded config
    const validation = validateConfig({ config });
    if (!validation.isValid) {
      console.warn('⚠️  Config file has validation errors:', validation.errors.join(', '));
      // Return the config anyway, but with warnings
    }

    return config;
  } catch (error: any) {
    console.warn(`⚠️  Failed to load config: ${error.message}`);
    return null;
  }
};

/**
 * Saves configuration to file
 */
export const saveConfig = async ({
  config,
  configPath,
  options = {},
}: {
  config: Config;
  configPath?: string;
  options?: ConfigUpdateOptions;
}): Promise<void> => {
  try {
    const filePath = getConfigPath(configPath ? { configPath } : {});

    let finalConfig = config;

    // Merge with existing config if requested
    if (options.merge) {
      const existingConfig = await loadConfig(configPath ? { configPath } : {});
      if (existingConfig) {
        finalConfig = { ...existingConfig, ...config };
      }
    }

    // Add version if not present
    if (!finalConfig.version) {
      finalConfig.version = CONFIG_VERSION;
    }

    // Validate if requested
    if (options.validate !== false) {
      const validation = validateConfig({ config: finalConfig });
      if (!validation.isValid) {
        throw new Error(`Config validation failed: ${validation.errors.join(', ')}`);
      }
    }

    const configContent = JSON.stringify(finalConfig, null, 2);
    await fs.writeFile(filePath, configContent, 'utf8');
  } catch (error: any) {
    throw new Error(`Failed to save config: ${error.message}`);
  }
};

/**
 * Gets the configured framework
 */
export const getFramework = async ({
  configPath,
}: { configPath?: string } = {}): Promise<SupportedFramework | null> => {
  const config = await loadConfig(configPath ? { configPath } : {});
  return config?.framework || null;
};

/**
 * Gets the configured API style
 */
export const getApiStyle = async ({
  configPath,
}: { configPath?: string } = {}): Promise<SupportedApiStyle | null> => {
  const config = await loadConfig(configPath ? { configPath } : {});
  return config?.apiStyle || null;
};

/**
 * Sets the framework in config
 */
export const setFramework = async ({
  framework,
  configPath,
}: {
  framework: SupportedFramework;
  configPath?: string;
}): Promise<void> => {
  // Check if config exists, if not create a default one first
  const exists = await configExists(configPath ? { configPath } : {});

  if (!exists) {
    // Create default config with the specified framework
    await initializeConfig({
      framework,
      ...(configPath && { configPath }),
    });
  } else {
    // Update existing config
    await saveConfig({
      config: { framework },
      ...(configPath && { configPath }),
      options: { merge: true, validate: true },
    });
  }
};

/**
 * Sets the API style in config
 */
export const setApiStyle = async ({
  apiStyle,
  configPath,
}: {
  apiStyle: SupportedApiStyle;
  configPath?: string;
}): Promise<void> => {
  // Check if config exists, if not create a default one first
  const exists = await configExists(configPath ? { configPath } : {});

  if (!exists) {
    // Create default config with the specified API style
    await initializeConfig({
      ...(configPath && { configPath }),
    });
    // Then update with API style
    await saveConfig({
      config: { apiStyle },
      ...(configPath && { configPath }),
      options: { merge: true, validate: true },
    });
  } else {
    // Update existing config
    await saveConfig({
      config: { apiStyle },
      ...(configPath && { configPath }),
      options: { merge: true, validate: true },
    });
  }
};

/**
 * Sets the default tRPC style preference in config (deprecated - use setApiStyle)
 */
export const setTrpcStyle = async ({
  trpcStyle,
  configPath,
}: {
  trpcStyle: boolean;
  configPath?: string;
}): Promise<void> => {
  // Deprecated: Convert to new API style format
  const apiStyle: SupportedApiStyle = trpcStyle ? 'trpc' : 'rest';
  await setApiStyle({ 
    apiStyle, 
    ...(configPath && { configPath }) 
  });
};

/**
 * Gets database configuration
 */
export const getDatabaseConfig = async ({
  configPath,
}: { configPath?: string } = {}): Promise<DatabaseConfig | null> => {
  const config = await loadConfig(configPath ? { configPath } : {});
  return config?.database || null;
};

/**
 * Sets database configuration
 */
export const setDatabaseConfig = async ({
  databaseConfig,
  configPath,
}: {
  databaseConfig: DatabaseConfig;
  configPath?: string;
}): Promise<void> => {
  await saveConfig({
    config: { database: databaseConfig },
    ...(configPath && { configPath }),
    options: { merge: true, validate: true },
  });
};

/**
 * Initializes a new config file
 */
export const initializeConfig = async ({
  framework,
  force = false,
  configPath,
}: InitConfigOptions & { configPath?: string } = {}): Promise<Config> => {
  const exists = await configExists(configPath ? { configPath } : {});

  if (exists && !force) {
    throw new Error('Config file already exists. Use --force to overwrite.');
  }

  const defaultConfig: Config = {
    version: CONFIG_VERSION,
    framework: framework || 'express',
    database: {},
    preferences: {
      autoFormat: true,
      generateTests: true,
      skipConfirmation: false,
    },
  };

  await saveConfig({
    config: defaultConfig,
    ...(configPath && { configPath }),
    options: { validate: true },
  });
  return defaultConfig;
};

/**
 * Validates configuration object
 */
export const validateConfig = ({ config }: { config: any }): ConfigValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!config || typeof config !== 'object') {
    errors.push('Config must be an object');
    return { isValid: false, errors, warnings };
  }

  // Validate framework
  if (config.framework && !['express', 'hono', 't3'].includes(config.framework)) {
    errors.push(`Invalid framework: ${config.framework}. Must be 'express', 'hono', or 't3'`);
  }

  // Validate API style
  if (config.apiStyle && !['rest', 'trpc'].includes(config.apiStyle)) {
    errors.push(`Invalid API style: ${config.apiStyle}. Must be 'rest' or 'trpc'`);
  }

  // Validate database config
  if (config.database && typeof config.database === 'object') {
    if (config.database.orm && !['prisma', 'typeorm', 'drizzle'].includes(config.database.orm)) {
      errors.push(`Invalid ORM: ${config.database.orm}. Must be 'prisma', 'typeorm', or 'drizzle'`);
    }

    if (config.database.type && !['postgresql', 'mysql', 'sqlite'].includes(config.database.type)) {
      errors.push(
        `Invalid database type: ${config.database.type}. Must be 'postgresql', 'mysql', or 'sqlite'`
      );
    }
  }

  // Validate preferences
  if (config.preferences && typeof config.preferences === 'object') {
    const prefs = config.preferences;
    if (prefs.autoFormat !== undefined && typeof prefs.autoFormat !== 'boolean') {
      errors.push('preferences.autoFormat must be a boolean');
    }
    if (prefs.generateTests !== undefined && typeof prefs.generateTests !== 'boolean') {
      errors.push('preferences.generateTests must be a boolean');
    }
    if (prefs.skipConfirmation !== undefined && typeof prefs.skipConfirmation !== 'boolean') {
      errors.push('preferences.skipConfirmation must be a boolean');
    }
  }

  // Validate paths config
  if (config.paths && typeof config.paths === 'object') {
    const paths = config.paths;
    if (paths.srcDir !== undefined && typeof paths.srcDir !== 'string') {
      errors.push('paths.srcDir must be a string');
    }
    if (paths.fallbackPaths !== undefined) {
      if (!Array.isArray(paths.fallbackPaths)) {
        errors.push('paths.fallbackPaths must be an array');
      } else {
        for (let i = 0; i < paths.fallbackPaths.length; i++) {
          if (typeof paths.fallbackPaths[i] !== 'string') {
            errors.push(`paths.fallbackPaths[${i}] must be a string`);
          }
        }
      }
    }
  }

  // Version warnings
  if (!config.version) {
    warnings.push('Config version not specified, assuming latest');
  } else if (config.version !== CONFIG_VERSION) {
    warnings.push(`Config version ${config.version} differs from current ${CONFIG_VERSION}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Gets the effective framework (from config, CLI option, or default)
 */
export const getEffectiveFramework = async ({
  cliFramework,
  configPath,
}: {
  cliFramework?: string;
  configPath?: string;
} = {}): Promise<SupportedFramework> => {
  // CLI option takes precedence
  if (cliFramework && ['express', 'hono', 't3'].includes(cliFramework)) {
    return cliFramework as SupportedFramework;
  }

  // Then check config file
  const configFramework = await getFramework(configPath ? { configPath } : {});
  if (configFramework) {
    return configFramework;
  }

  // Default to express
  return 'express';
};

/**
 * Gets the effective API style (from config, CLI option, or default)
 */
export const getEffectiveApiStyle = async ({
  cliApiStyle,
  configPath,
}: {
  cliApiStyle?: string;
  configPath?: string;
} = {}): Promise<SupportedApiStyle> => {
  // CLI option takes precedence
  if (cliApiStyle && ['rest', 'trpc'].includes(cliApiStyle)) {
    return cliApiStyle as SupportedApiStyle;
  }

  // Then check config file
  const configApiStyle = await getApiStyle(configPath ? { configPath } : {});
  if (configApiStyle) {
    return configApiStyle;
  }

  // Default to rest
  return 'rest';
};
