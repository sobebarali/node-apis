/**
 * Type definitions for CLI operations
 */

export interface CommandOptions {
  name?: string;
  force?: boolean;
  interactive?: boolean;
  crud?: boolean;
  custom?: string;
  framework?: string;
  initConfig?: boolean;
  setFramework?: string;
}

export interface InquirerAnswers {
  moduleName: string;
  confirm: boolean;
  apiType: 'crud' | 'custom';
  customNames: string;
  moduleChoice: 'new' | 'existing';
  existingModule: string;
  operationMode: 'replace' | 'append';
  framework: 'express' | 'hono';
  saveToConfig: boolean;
}

export interface PromptResult<T = any> {
  success: boolean;
  data?: T;
  cancelled?: boolean;
  error?: string;
}
