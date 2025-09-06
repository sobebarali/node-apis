/**
 * Type definitions for module generation
 */

import { ApiType, GeneratedFile } from './common.types';

export interface GenerationOptions {
  baseDir?: string;
  force?: boolean;
  appendMode?: boolean;
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

export interface FileGenerationInput {
  moduleName: string;
  modulePath: string;
  apiType: ApiType;
}

export interface SuccessMessageInput {
  moduleName: string;
  modulePath: string;
}
