/**
 * Output formatting utilities
 */

import chalk from 'chalk';
import { GenerationResult } from '../../types/generation.types';

/**
 * Displays welcome message
 */
export const displayWelcomeMessage = (): void => {
  console.log(chalk.cyan.bold('\n🚀 Node.js API Module Generator\n'));
};

/**
 * Displays existing modules
 */
export const displayExistingModules = (modules: string[]): void => {
  console.log(chalk.cyan('\n🔍 Found existing modules:'));
  for (const module of modules) {
    console.log(chalk.gray(`   • ${module}`));
  }
};

/**
 * Displays existing files in a module
 */
export const displayExistingFiles = (moduleName: string, files: string[]): void => {
  console.log(chalk.cyan(`\n📄 Existing files in ${moduleName}:`));
  for (const file of files) {
    console.log(chalk.gray(`   • ${file}`));
  }
};

/**
 * Displays generation summary
 */
export const displayGenerationSummary = ({
  moduleName,
  targetPath,
  forceOverwrite,
  apiType,
  operationNames,
}: {
  moduleName: string;
  targetPath: string;
  forceOverwrite: boolean;
  apiType?: string | undefined;
  operationNames?: string[] | undefined;
}): void => {
  console.log(chalk.blue('\n📋 Generation Summary:'));
  console.log(chalk.gray(`   Module name: ${moduleName}`));
  console.log(chalk.gray(`   Target path: ${targetPath}`));
  console.log(chalk.gray(`   Regenerate existing code: ${forceOverwrite ? 'Yes' : 'No'}`));

  if (apiType && operationNames) {
    console.log(chalk.gray(`   API type: ${apiType}`));
    console.log(chalk.gray(`   Files to generate: ${operationNames.join(', ')}`));
  }
};

/**
 * Displays generation result
 */
export const displayGenerationResult = (result: GenerationResult): void => {
  if (!result.success) {
    console.error(chalk.red('\n❌ Error:'), result.error);
    return;
  }

  console.log(chalk.green(`\n✅ Module generated at ${result.modulePath}`));

  const generatedFiles = result.generatedFiles ?? [];
  if (generatedFiles.length > 0) {
    console.log(chalk.cyan('\n📄 Generated files:'));
    for (const file of generatedFiles) {
      console.log(chalk.gray(`   ✓ ${file.fileName}`));
    }
  } else {
    console.log(chalk.gray('\n   No new files: everything already exists.'));
  }

  console.log(chalk.cyan('\n📝 Next Steps:'));
  console.log(chalk.gray('   1. Fill in typeResultData in the type files'));
  console.log(chalk.gray('   2. Implement the TODOs in the generated code'));
  console.log(chalk.gray('   3. Call the handlers from your own router (oRPC, tRPC, REST, ...)'));
};

/**
 * Displays error messages
 */
export const displayError = (message: string): void => {
  console.error(chalk.red('❌ Error:'), message);
};

/**
 * Displays cancellation message
 */
export const displayCancellation = (): void => {
  console.log(chalk.yellow('\n⏹️  Generation cancelled by user'));
};
