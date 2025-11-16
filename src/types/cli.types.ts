/**
 * Type definitions for CLI operations
 */

export interface CommandOptions {
  name?: string;
  force?: boolean;
  interactive?: boolean;
  crud?: boolean;
  custom?: string;
  services?: string;
  framework?: string;
  apiStyle?: string;
  initConfig?: boolean;
  setFramework?: string;
  setApiStyle?: string;
  targetDir?: string;
  trpcStyle?: boolean; // Deprecated, use apiStyle instead
  setTrpcStyle?: string; // Deprecated, use setApiStyle instead
}

export interface InquirerAnswers {
  moduleName: string;
  confirm: boolean;
  apiType: 'crud' | 'custom' | 'services';
  apiTypeNumber: string;
  customNames: string;
  serviceNames: string;
  moduleChoice: 'new' | 'existing';
  existingModule: string;
  operationMode: 'replace' | 'append';
  framework: 'express' | 'hono' | 't3' | 'tanstack';
  apiStyle: 'rest' | 'trpc';
  saveToConfig: boolean;
  action: 'overwrite' | 'append' | 'cancel' | 'view' | 'update' | 'reset';
  configAction: 'view' | 'update' | 'reset' | 'cancel';
  confirmReset: boolean;
  trpcStyle: boolean;
}

export interface PromptResult<T = any> {
  success: boolean;
  data?: T;
  cancelled?: boolean;
  error?: string;
}
