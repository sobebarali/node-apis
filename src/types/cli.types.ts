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
  /** Set to false by --no-repository */
  repository?: boolean;
  initConfig?: boolean;
  setApisDir?: string;
  targetDir?: string;
}

export interface InquirerAnswers {
  moduleName: string;
  confirm: boolean;
  apiTypeNumber: string;
  customNames: string;
  serviceNames: string;
  moduleChoice: 'new' | 'existing';
  existingModule: string;
  action: 'overwrite' | 'append' | 'cancel';
}

export interface PromptResult<T = unknown> {
  success: boolean;
  data?: T;
  cancelled?: boolean;
  error?: string;
}
