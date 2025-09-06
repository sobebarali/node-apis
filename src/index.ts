import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { generateModuleStructure, validateTargetLocation } from './generator';
import { validateModuleName, ApiType, detectExistingModule, getExistingModules } from './utils';

// Type definitions
interface CommandOptions {
  name?: string;
  force?: boolean;
  interactive?: boolean;
  crud?: boolean;
  custom?: string;
}

interface InquirerAnswers {
  moduleName: string;
  confirm: boolean;
  apiType: 'crud' | 'custom';
  customNames: string;
  moduleChoice: 'new' | 'existing';
  existingModule: string;
  operationMode: 'replace' | 'append';
}

/**
 * Main CLI function using functional programming style
 */
export const main = async (): Promise<void> => {
  const program = new Command();

  program
    .name('node-apis')
    .description('Generate boilerplate folder structures for Node.js API modules')
    .version('1.0.1')
    .option('-n, --name <name>', 'module name (skips interactive prompt)')
    .option('-f, --force', 'overwrite existing directories')
    .option('--no-interactive', 'disable interactive mode')
    .option('--crud', 'generate CRUD operations (create, get, list, delete, update)')
    .option('--custom <names>', 'generate custom API operations (comma-separated names)')
    .parse();

  const options = program.opts() as CommandOptions;

  try {
    // Display welcome message
    console.log(chalk.cyan.bold('\n🚀 Node.js API Module Generator\n'));

    // Validate target location
    const locationValidation = await validateTargetLocation();
    if (!locationValidation.isValid) {
      console.error(chalk.red('❌ Error:'), locationValidation.error);
      process.exit(1);
    }

    let moduleName = options.name;
    let apiType: ApiType | undefined;
    let appendMode = false;

    // Handle command line API type options
    if (options.crud) {
      apiType = { type: 'crud' };
    } else if (options.custom) {
      const customNames = options.custom
        .split(',')
        .map(name => name.trim())
        .filter(name => name.length > 0);
      apiType = { type: 'custom', customNames };
    }

    // Interactive mode: enhanced developer-friendly flow
    if (options.interactive !== false) {
      // Step 1: Check for existing modules and offer smart choices
      const existingModules = await getExistingModules();

      if (!moduleName) {
        if (existingModules.length > 0) {
          console.log(chalk.cyan('\n🔍 Found existing modules:'));
          existingModules.forEach(module => {
            console.log(chalk.gray(`   • ${module}`));
          });

          const moduleChoice = await inquirer.prompt([
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

          if (moduleChoice.moduleChoice === 'existing') {
            const existingChoice = await inquirer.prompt([
              {
                type: 'list',
                name: 'existingModule',
                message: 'Which module do you want to add operations to?',
                choices: existingModules.map(module => ({ name: module, value: module }))
              }
            ]) as InquirerAnswers;

            moduleName = existingChoice.existingModule;
            appendMode = true;

            // Show existing files
            const existingModule = await detectExistingModule({ moduleName });
            if (existingModule && existingModule.existingFiles.length > 0) {
              console.log(chalk.cyan(`\n📄 Existing files in ${moduleName}:`));
              existingModule.existingFiles.forEach(file => {
                console.log(chalk.gray(`   • ${file}`));
              });
            }
          }
        }

        // If creating new module or no existing modules found
        if (!moduleName) {
          const nameAnswer = await inquirer.prompt([
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
          moduleName = nameAnswer.moduleName;
        }
      }
    }

    // Interactive mode: prompt for API type if not provided via command line
    if (options.interactive !== false && !apiType) {
      const apiTypeAnswer = await inquirer.prompt([
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

      if (apiTypeAnswer.apiType === 'crud') {
        apiType = { type: 'crud' };
      } else {
        const customAnswer = await inquirer.prompt([
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

        const customNames = customAnswer.customNames
          .split(',')
          .map(name => name.trim())
          .filter(name => name.length > 0);

        apiType = { type: 'custom', customNames };
      }
    }

    // Validate module name if provided via command line
    if (!moduleName) {
      console.error(chalk.red('❌ Error: Module name is required'));
      console.log(chalk.gray('Use -n flag or run in interactive mode'));
      process.exit(1);
    }

    // Show what will be created
    console.log(chalk.blue('\n📋 Generation Summary:'));
    console.log(chalk.gray(`   Module name: ${moduleName}`));
    console.log(chalk.gray(`   Target path: src/apis/${moduleName.toLowerCase()}`));
    console.log(chalk.gray(`   Force overwrite: ${options.force ? 'Yes' : 'No'}`));

    if (apiType) {
      if (apiType.type === 'crud') {
        console.log(chalk.gray(`   API type: CRUD operations`));
        console.log(chalk.gray(`   Files to generate: create, get, list, delete, update`));
      } else if (apiType.type === 'custom' && apiType.customNames) {
        console.log(chalk.gray(`   API type: Custom operations`));
        console.log(chalk.gray(`   Files to generate: ${apiType.customNames.join(', ')}`));
      }
    }

    // Confirm generation in interactive mode
    if (options.interactive !== false) {
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: 'Proceed with module generation?',
          default: true
        }
      ]) as InquirerAnswers;

      if (!confirm) {
        console.log(chalk.yellow('\n⏹️  Generation cancelled by user'));
        process.exit(0);
      }
    }

    // Generate the module structure
    console.log(chalk.blue('\n⚙️  Generating module structure...'));

    const result = await generateModuleStructure({
      moduleName: moduleName!,
      options: {
        force: options.force || false,
        appendMode
      },
      ...(apiType && { apiType })
    });

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
      process.exit(1);
    }

  } catch (error: any) {
    console.error(chalk.red('\n❌ Unexpected error:'), error.message);
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

/**
 * Handle CLI interruption gracefully
 */
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n\n⏹️  Generation cancelled by user'));
  process.exit(0);
});
