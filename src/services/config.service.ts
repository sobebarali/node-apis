/**
 * Configuration management service
 */

import * as path from 'path';
import * as fs from 'fs-extra';
import {
  Config,
  SupportedFramework,
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
export const getConfigPath = ({ configPath, baseDir = process.cwd() }: { configPath?: string; baseDir?: string } = {}): string => {
  if (configPath) {
    return configPath;
  }
  return path.join(baseDir, DEFAULT_CONFIG_FILENAME);
};

/**
 * Checks if config file exists
 */
export const configExists = async ({ configPath }: { configPath?: string } = {}): Promise<boolean> => {
  const filePath = getConfigPath(configPath ? { configPath } : {});
  return await fs.pathExists(filePath);
};

/**
 * Loads configuration from file
 */
export const loadConfig = async ({ configPath }: { configPath?: string } = {}): Promise<Config | null> => {
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
  options = {}
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
export const getFramework = async ({ configPath }: { configPath?: string } = {}): Promise<SupportedFramework | null> => {
  const config = await loadConfig(configPath ? { configPath } : {});
  return config?.framework || null;
};

/**
 * Sets the framework in config
 */
export const setFramework = async ({
  framework,
  configPath
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
      ...(configPath && { configPath })
    });
  } else {
    // Update existing config
    await saveConfig({
      config: { framework },
      ...(configPath && { configPath }),
      options: { merge: true, validate: true }
    });
  }
};

/**
 * Gets database configuration
 */
export const getDatabaseConfig = async ({ configPath }: { configPath?: string } = {}): Promise<DatabaseConfig | null> => {
  const config = await loadConfig(configPath ? { configPath } : {});
  return config?.database || null;
};

/**
 * Sets database configuration
 */
export const setDatabaseConfig = async ({
  databaseConfig,
  configPath
}: {
  databaseConfig: DatabaseConfig;
  configPath?: string;
}): Promise<void> => {
  await saveConfig({
    config: { database: databaseConfig },
    ...(configPath && { configPath }),
    options: { merge: true, validate: true }
  });
};

/**
 * Initializes a new config file
 */
export const initializeConfig = async ({
  framework,
  force = false,
  configPath
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
    options: { validate: true }
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
  if (config.framework && !['express', 'hono'].includes(config.framework)) {
    errors.push(`Invalid framework: ${config.framework}. Must be 'express' or 'hono'`);
  }
  
  // Validate database config
  if (config.database && typeof config.database === 'object') {
    if (config.database.orm && !['prisma', 'typeorm', 'drizzle'].includes(config.database.orm)) {
      errors.push(`Invalid ORM: ${config.database.orm}. Must be 'prisma', 'typeorm', or 'drizzle'`);
    }
    
    if (config.database.type && !['postgresql', 'mysql', 'sqlite'].includes(config.database.type)) {
      errors.push(`Invalid database type: ${config.database.type}. Must be 'postgresql', 'mysql', or 'sqlite'`);
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
  configPath 
}: { 
  cliFramework?: string; 
  configPath?: string;
} = {}): Promise<SupportedFramework> => {
  // CLI option takes precedence
  if (cliFramework && ['express', 'hono'].includes(cliFramework)) {
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
