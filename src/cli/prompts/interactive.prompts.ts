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
    const answer = (await inquirer.prompt([
      {
        type: 'list',
        name: 'moduleChoice',
        message: 'What would you like to do?',
        choices: [
          { name: '➕ Create a new module', value: 'new' },
          { name: '🔧 Add operations to existing module', value: 'existing' },
        ],
      },
    ])) as InquirerAnswers;

    return { success: true, data: answer.moduleChoice };
  } catch (error) {
    return { success: false, cancelled: true };
  }
};

/**
 * Prompts user to select an existing module
 */
export const promptExistingModuleSelection = async (
  modules: string[]
): Promise<PromptResult<string>> => {
  try {
    const answer = (await inquirer.prompt([
      {
        type: 'list',
        name: 'existingModule',
        message: 'Which module do you want to add operations to?',
        choices: modules.map(module => ({ name: module, value: module })),
      },
    ])) as InquirerAnswers;

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
    const answer = (await inquirer.prompt([
      {
        type: 'input',
        name: 'moduleName',
        message: 'What is the name of your new API module?',
        validate: (input: string) => {
          const validation = validateModuleName({ name: input });
          return validation.isValid || validation.error!;
        },
        filter: (input: string) => input.trim(),
      },
    ])) as InquirerAnswers;

    return { success: true, data: answer.moduleName };
  } catch (error) {
    return { success: false, cancelled: true };
  }
};

/**
 * Prompts user for API type selection with improved navigation
 */
export const promptApiType = async (): Promise<PromptResult<'crud' | 'custom' | 'services'>> => {
  // Use numbered selection for better terminal compatibility
  return await promptApiTypeNumbered();
};

/**
 * Fallback numbered API type selection
 */
export const promptApiTypeNumbered = async (): Promise<
  PromptResult<'crud' | 'custom' | 'services'>
> => {
  try {
    console.log('\n📋 API Type Options:');
    console.log('  1. 🗃️  CRUD operations (Create, Read, Update, Delete)');
    console.log('  2. ⚡ Custom API operations (Business logic endpoints)');
    console.log('  3. 🔧 Internal service operations (Third-party integrations)');

    const answer = (await inquirer.prompt([
      {
        type: 'input',
        name: 'apiTypeNumber',
        message: 'Enter your choice (1-3):',
        validate: (input: string) => {
          const num = parseInt(input.trim());
          if (isNaN(num) || num < 1 || num > 3) {
            return 'Please enter a number between 1 and 3';
          }
          return true;
        },
        filter: (input: string) => input.trim(),
      },
    ])) as InquirerAnswers;

    const typeMap: Record<string, 'crud' | 'custom' | 'services'> = {
      '1': 'crud',
      '2': 'custom',
      '3': 'services',
    };

    return { success: true, data: typeMap[answer.apiTypeNumber] };
  } catch (error) {
    return { success: false, cancelled: true };
  }
};

/**
 * Validates operation names
 */
const validateOperationNames = (input: string): string | true => {
  const trimmed = input.trim();
  if (!trimmed) return 'Please enter at least one operation name';

  const names = trimmed
    .split(',')
    .map(name => name.trim())
    .filter(name => name.length > 0);

  if (names.length === 0) return 'Please enter at least one operation name';

  // Validate each name
  for (const name of names) {
    // Check for valid identifier format
    if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(name)) {
      return `"${name}" is not a valid operation name. Use camelCase (e.g., sendEmail, getUserProfile)`;
    }

    // Check length
    if (name.length < 2) {
      return `"${name}" is too short. Operation names should be at least 2 characters`;
    }

    if (name.length > 50) {
      return `"${name}" is too long. Operation names should be less than 50 characters`;
    }

    // Check for reserved words
    const reserved = ['constructor', 'prototype', 'toString', 'valueOf', 'hasOwnProperty'];
    if (reserved.includes(name.toLowerCase())) {
      return `"${name}" is a reserved word. Please choose a different name`;
    }
  }

  return true;
};

/**
 * Prompts user for custom operation names with enhanced validation
 */
export const promptCustomOperations = async (): Promise<PromptResult<string[]>> => {
  try {
    console.log('\n💡 Examples: sendEmail, processPayment, generateReport, uploadFile');
    console.log('   Use camelCase format, separate multiple operations with commas\n');

    const answer = (await inquirer.prompt([
      {
        type: 'input',
        name: 'customNames',
        message: 'Enter custom API operation names (comma-separated):',
        validate: validateOperationNames,
        filter: (input: string) => input.trim(),
      },
    ])) as InquirerAnswers;

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
 * Prompts user for service operation names with enhanced validation
 */
export const promptServiceOperations = async (): Promise<PromptResult<string[]>> => {
  try {
    console.log('\n💡 Examples: createPayment, sendEmail, uploadFile, getWeatherData');
    console.log('   Use camelCase format, separate multiple operations with commas');
    console.log('   These are internal functions for third-party API integrations\n');

    const answer = (await inquirer.prompt([
      {
        type: 'input',
        name: 'serviceNames',
        message: 'Enter service operation names (comma-separated):',
        validate: validateOperationNames,
        filter: (input: string) => input.trim(),
      },
    ])) as InquirerAnswers;

    const serviceNames = answer.serviceNames
      .split(',')
      .map(name => name.trim())
      .filter(name => name.length > 0);

    return { success: true, data: serviceNames };
  } catch (error) {
    return { success: false, cancelled: true };
  }
};

/**
 * Prompts user for action when module already exists
 */
export const promptExistingModuleAction = async (
  moduleName: string
): Promise<PromptResult<'overwrite' | 'append' | 'cancel'>> => {
  try {
    const answer = (await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: `Module "${moduleName}" already exists. What would you like to do?`,
        choices: [
          {
            name: '🔄 Regenerate the untouched code (type files and edited files are kept)',
            value: 'overwrite',
            short: 'Regenerate',
          },
          {
            name: '➕ Add operations to existing module',
            value: 'append',
            short: 'Append',
          },
          {
            name: '❌ Cancel generation',
            value: 'cancel',
            short: 'Cancel',
          },
        ],
        pageSize: 3,
        loop: false,
      },
    ])) as InquirerAnswers;

    return { success: true, data: answer.action };
  } catch (error) {
    return { success: false, cancelled: true };
  }
};
