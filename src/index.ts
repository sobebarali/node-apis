import { Command } from 'commander';
import chalk from 'chalk';
import { CommandOptions } from './types/cli.types';
import { handleGenerateCommand } from './cli/commands/generate.command';


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
    .option('--framework <framework>', 'web framework to use (express|hono)', 'express')
    .parse();

  const options = program.opts() as CommandOptions;


  await handleGenerateCommand(options);
};


process.on('SIGINT', () => {
  console.log(chalk.yellow('\n\n⏹️  Generation cancelled by user'));
  process.exit(0);
});
