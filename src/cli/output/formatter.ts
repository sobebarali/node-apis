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
  modules.forEach(module => {
    console.log(chalk.gray(`   • ${module}`));
  });
};

/**
 * Displays existing files in a module
 */
export const displayExistingFiles = (moduleName: string, files: string[]): void => {
  console.log(chalk.cyan(`\n📄 Existing files in ${moduleName}:`));
  files.forEach(file => {
    console.log(chalk.gray(`   • ${file}`));
  });
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
  console.log(chalk.gray(`   Force overwrite: ${forceOverwrite ? 'Yes' : 'No'}`));

  if (apiType && operationNames) {
    console.log(chalk.gray(`   API type: ${apiType}`));
    console.log(chalk.gray(`   Files to generate: ${operationNames.join(', ')}`));
  }
};

/**
 * Displays generation result
 */
export const displayGenerationResult = (result: GenerationResult): void => {
  if (result.success) {
    console.log(chalk.green(result.message));

    // Show generated files if any
    if (result.generatedFiles && result.generatedFiles.length > 0) {
      console.log(chalk.cyan('\n📄 Generated TypeScript Files:'));
      result.generatedFiles.forEach(file => {
        console.log(chalk.gray(`   ✓ ${file.fileName}`));
      });
    }

    // Show next steps
    console.log(chalk.cyan('\n📝 Next Steps:'));
    console.log(chalk.gray('   1. Navigate to your new module directory'));
    console.log(chalk.gray('   2. Review and customize the generated type definitions'));
    console.log(chalk.gray('   3. Start implementing your API logic'));
    console.log(chalk.gray('   4. Add your route handlers, controllers, and schemas'));
  } else {
    console.error(chalk.red('\n❌ Error:'), result.error);
  }
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

/**
 * Displays generation progress
 */
export const displayProgress = (): void => {
  console.log(chalk.blue('\n⚙️  Generating module structure...'));
};
