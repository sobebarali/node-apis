import { Command } from 'commander';
import chalk from 'chalk';
import { CommandOptions } from './types/cli.types';
import { handleGenerateCommand } from './cli/commands/generate.command';

/**
 * Main CLI function using clean architecture
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

  // Delegate to the generate command handler
  await handleGenerateCommand(options);
};

/**
 * Handle CLI interruption gracefully
 */
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n\n⏹️  Generation cancelled by user'));
  process.exit(0);
});
