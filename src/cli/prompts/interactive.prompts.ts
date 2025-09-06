/**
 * Interactive prompts for CLI
 */

import inquirer from 'inquirer';
import { InquirerAnswers, PromptResult } from '../../types/cli.types';
import { validateModuleName } from '../../validators/module-name.validator';

/**
 * Prompts user to choose between creating new or adding to existing module
 */
export const promptModuleChoice = async (): Promise<PromptResult<'new' | 'existing'>> => {
  try {
    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'moduleChoice',
        message: 'What would you like to do?',
        choices: [
          { name: '➕ Create a new module', value: 'new' },
          { name: '🔧 Add operations to existing module', value: 'existing' }
        ]
      }
    ]) as InquirerAnswers;

    return { success: true, data: answer.moduleChoice };
  } catch (error) {
    return { success: false, cancelled: true };
  }
};

/**
 * Prompts user to select an existing module
 */
export const promptExistingModuleSelection = async (modules: string[]): Promise<PromptResult<string>> => {
  try {
    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'existingModule',
        message: 'Which module do you want to add operations to?',
        choices: modules.map(module => ({ name: module, value: module }))
      }
    ]) as InquirerAnswers;

    return { success: true, data: answer.existingModule };
  } catch (error) {
    return { success: false, cancelled: true };
  }
};

/**
 * Prompts user for new module name
 */
export const promptModuleName = async (): Promise<PromptResult<string>> => {
  try {
    const answer = await inquirer.prompt([
      {
        type: 'input',
        name: 'moduleName',
        message: 'What is the name of your new API module?',
        validate: (input: string) => {
          const validation = validateModuleName({ name: input });
          return validation.isValid || validation.error!;
        },
        filter: (input: string) => input.trim()
      }
    ]) as InquirerAnswers;

    return { success: true, data: answer.moduleName };
  } catch (error) {
    return { success: false, cancelled: true };
  }
};

/**
 * Prompts user for API type selection
 */
export const promptApiType = async (): Promise<PromptResult<'crud' | 'custom'>> => {
  try {
    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'apiType',
        message: 'What type of API operations do you need?',
        choices: [
          { name: 'CRUD operations (Create, Read, Update, Delete)', value: 'crud' },
          { name: 'Custom API operations', value: 'custom' }
        ]
      }
    ]) as InquirerAnswers;

    return { success: true, data: answer.apiType };
  } catch (error) {
    return { success: false, cancelled: true };
  }
};

/**
 * Prompts user for custom operation names
 */
export const promptCustomOperations = async (): Promise<PromptResult<string[]>> => {
  try {
    const answer = await inquirer.prompt([
      {
        type: 'input',
        name: 'customNames',
        message: 'Enter custom API operation names (comma-separated):',
        validate: (input: string) => {
          const trimmed = input.trim();
          if (!trimmed) return 'Please enter at least one operation name';
          return true;
        },
        filter: (input: string) => input.trim()
      }
    ]) as InquirerAnswers;

    const customNames = answer.customNames
      .split(',')
      .map(name => name.trim())
      .filter(name => name.length > 0);

    return { success: true, data: customNames };
  } catch (error) {
    return { success: false, cancelled: true };
  }
};

/**
 * Prompts user for confirmation
 */
export const promptConfirmation = async (message: string = 'Proceed with module generation?'): Promise<PromptResult<boolean>> => {
  try {
    const answer = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message,
        default: true
      }
    ]) as InquirerAnswers;

    return { success: true, data: answer.confirm };
  } catch (error) {
    return { success: false, cancelled: true };
  }
};
