import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { generateModuleStructure, validateTargetLocation } from './generator';
import { validateModuleName } from './utils';

// Type definitions
interface CommandOptions {
  name?: string;
  force?: boolean;
  interactive?: boolean;
}

interface InquirerAnswers {
  moduleName: string;
  confirm: boolean;
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

    // Interactive mode: prompt for module name if not provided
    if (!moduleName && options.interactive !== false) {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'moduleName',
          message: 'What is the name of your API module?',
          validate: (input: string) => {
            const validation = validateModuleName({ name: input });
            return validation.isValid || validation.error!;
          },
          filter: (input: string) => input.trim()
        }
      ]) as InquirerAnswers;
      moduleName = answers.moduleName;
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
      options: { force: options.force || false }
    });

    if (result.success) {
      console.log(chalk.green(result.message));
      
      // Show next steps
      console.log(chalk.cyan('📝 Next Steps:'));
      console.log(chalk.gray('   1. Navigate to your new module directory'));
      console.log(chalk.gray('   2. Start implementing your API logic'));
      console.log(chalk.gray('   3. Add your route handlers, controllers, and schemas'));
      
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
