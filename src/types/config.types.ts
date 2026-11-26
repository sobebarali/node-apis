/**
 * Configuration type definitions
 */

export interface PathsConfig {
  /** Directory that holds the generated modules, relative to the project root. Default: 'src/apis' */
  apisDir?: string;
}

export interface HandlerContextConfig {
  /** Name of the exported context type, for example 'AppContext' */
  type: string;
  /**
   * Where the type is exported from. A value starting with './' is a file path
   * from the project root; anything else is used as the import path as written.
   */
  from: string;
}

export interface HandlersConfig {
  /** Handlers and services take `context` of this type instead of `requestId` */
  context?: HandlerContextConfig;
  /**
   * 'catch' (default): unexpected errors are logged and returned as INTERNAL_ERROR.
   * 'throw': only the errors the type file declares are returned, the rest are thrown.
   */
  errors?: ErrorMode;
  /**
   * Where the shared error types and `Refusal` live, resolved like `context.from`.
   * A file path is written once when missing. New type files build
   * typeResultError from its types, and handlers return a thrown Refusal as the error.
   */
  errorsFile?: string;
}

export interface ValidatorsConfig {
  /** Set to false to generate only `payloadSchema`. Default: true */
  validatePayload?: boolean;
}

export type ErrorMode = 'catch' | 'throw';

export interface Config {
  version?: string;
  paths?: PathsConfig;
  handlers?: HandlersConfig;
  validators?: ValidatorsConfig;
}

/** The config options that shape generated code, resolved for one module */
export interface GenerationSettings {
  errors: ErrorMode;
  validatePayload: boolean;
  /** The context type and the import path to it, as seen from a handler file */
  context?: { type: string; importPath: string };
  /** The shared errors file: its import path from a module folder, and where to write it */
  errorsFile?: { importPath: string; filePath?: string };
}

export const DEFAULT_GENERATION_SETTINGS: GenerationSettings = {
  errors: 'catch',
  validatePayload: true,
};

export interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
}
