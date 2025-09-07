/**
 * Configuration templates
 */

import { Config, SupportedFramework } from '../types/config.types';

/**
 * Generates default configuration
 */
export const generateDefaultConfig = ({ framework = 'express' }: { framework?: SupportedFramework } = {}): Config => {
  return {
    version: '1.0.0',
    framework,
    database: {
      // Future: Default ORM and database type can be set here
    },
    preferences: {
      autoFormat: true,
      generateTests: true,
      skipConfirmation: false,
    },
  };
};

/**
 * Generates Express-specific configuration
 */
export const generateExpressConfig = (): Config => {
  return generateDefaultConfig({ framework: 'express' });
};

/**
 * Generates Hono-specific configuration
 */
export const generateHonoConfig = (): Config => {
  return generateDefaultConfig({ framework: 'hono' });
};

/**
 * Generates configuration with database settings
 */
export const generateConfigWithDatabase = ({
  framework = 'express',
  orm,
  databaseType,
}: {
  framework?: SupportedFramework;
  orm?: 'prisma' | 'typeorm' | 'drizzle';
  databaseType?: 'postgresql' | 'mysql' | 'sqlite';
} = {}): Config => {
  const config = generateDefaultConfig({ framework });
  
  if (orm || databaseType) {
    config.database = {
      ...(orm && { orm }),
      ...(databaseType && { type: databaseType }),
    };
  }
  
  return config;
};

/**
 * Generates minimal configuration (framework only)
 */
export const generateMinimalConfig = ({ framework }: { framework: SupportedFramework }): Config => {
  return {
    framework,
  };
};

/**
 * Configuration templates for different use cases
 */
export const CONFIG_TEMPLATES = {
  default: generateDefaultConfig,
  express: generateExpressConfig,
  hono: generateHonoConfig,
  minimal: generateMinimalConfig,
  withDatabase: generateConfigWithDatabase,
} as const;

/**
 * Gets a configuration template by name
 */
export const getConfigTemplate = (templateName: keyof typeof CONFIG_TEMPLATES): typeof CONFIG_TEMPLATES[keyof typeof CONFIG_TEMPLATES] => {
  return CONFIG_TEMPLATES[templateName];
};
