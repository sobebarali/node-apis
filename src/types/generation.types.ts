/**
 * Type definitions for module generation
 */

import { ApiType, GeneratedFile } from './common.types';

export interface GenerationOptions {
  baseDir?: string;
  force?: boolean;
  appendMode?: boolean;
  targetDir?: string;
}

export interface GenerationInput {
  moduleName: string;
  options?: GenerationOptions;
  apiType?: ApiType;
}

export interface GenerationResult {
  success: boolean;
  error?: string;
  moduleName?: string;
  modulePath?: string;
  createdDirectories?: string[];
  generatedFiles?: GeneratedFile[];
  /** Existing files left untouched because they were edited by hand */
  keptFiles?: string[];
  message?: string;
}

export interface ValidationLocationResult {
  isValid: boolean;
  error?: string;
  hasPackageJson?: boolean;
}

export interface ValidationLocationInput {
  baseDir?: string;
}
