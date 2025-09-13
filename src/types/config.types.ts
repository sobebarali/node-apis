/**
 * Configuration type definitions
 */

export type SupportedFramework = 'express' | 'hono';

export type SupportedApiStyle = 'rest' | 'trpc';

export type SupportedORM = 'prisma' | 'typeorm' | 'drizzle';

export type SupportedDatabase = 'postgresql' | 'mysql' | 'sqlite';

export interface DatabaseConfig {
  orm?: SupportedORM;
  type?: SupportedDatabase;
}

export interface PreferencesConfig {
  autoFormat?: boolean;
  generateTests?: boolean;
  skipConfirmation?: boolean;
}

export interface Config {
  framework?: SupportedFramework;
  apiStyle?: SupportedApiStyle;
  database?: DatabaseConfig;
  preferences?: PreferencesConfig;
  trpcStyle?: boolean; // Deprecated, use apiStyle instead
  version?: string;
}

export interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ConfigServiceOptions {
  configPath?: string;
  createIfMissing?: boolean;
}

export interface InitConfigOptions {
  framework?: SupportedFramework;
  force?: boolean;
  interactive?: boolean;
}

export interface ConfigUpdateOptions {
  merge?: boolean;
  validate?: boolean;
}
