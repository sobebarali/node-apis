/**
 * Configuration type definitions
 */

export interface PathsConfig {
  /** Directory that holds the generated modules, relative to the project root. Default: 'src/apis' */
  apisDir?: string;
}

export interface Config {
  version?: string;
  paths?: PathsConfig;
}

export interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
}
