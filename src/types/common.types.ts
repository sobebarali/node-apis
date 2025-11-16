/**
 * Common type definitions used across the application
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  normalizedName?: string;
}

export interface ModuleNaming {
  directory: string;
  file: string;
  class: string;
  variable: string;
  constant: string;
  url: string;
}

export interface ApiType {
  type: 'crud' | 'custom' | 'services';
  framework?: 'express' | 'hono' | 't3' | 'tanstack';
  customNames?: string[];
  serviceNames?: string[];
}

export interface GeneratedFile {
  fileName: string;
  filePath: string;
  content: string;
}

export interface ExistingModule {
  moduleName: string;
  modulePath: string;
  existingFiles: string[];
  hasTypes: boolean;
}

// Input interfaces for functional programming style
export interface ModuleNameInput {
  name: string;
}

export interface ModulePathInput {
  moduleName: string;
  baseDir?: string;
}

export interface DirectoryExistsInput {
  dirPath: string;
}

export interface ModuleDetectionInput {
  moduleName: string;
  baseDir?: string;
}
