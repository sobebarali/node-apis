import { Command } from 'commander';
import chalk from 'chalk';
import { version } from '../package.json';
import { CommandOptions } from './types/cli.types';
import { handleGenerateCommand } from './cli/commands/generate.command';

export const main = async (): Promise<void> => {
  const program = new Command();

  program
    .name('node-apis')
    .description(
      'Generate framework-agnostic API modules: types, validators, handlers and repositories'
    )
    .version(version)
    .option('-n, --name <name>', 'module name (skips interactive prompt)')
    .option(
      '-f, --force',
      'regenerate the untouched code of an existing module (type files and edited files are kept)'
    )
    .option('--no-interactive', 'disable interactive mode')
    .option('--crud', 'generate CRUD operations (create, get, list, delete, update)')
    .option(
      '--custom <names...>',
      'generate custom operations (names separated by commas or spaces)'
    )
    .option(
      '--services <names...>',
      'generate service operations (names separated by commas or spaces)'
    )
    .option('--no-repository', 'skip the repository layer (handlers hold the logic)')
    .option('--init-config', 'initialize configuration file')
    .option('--set-apis-dir <path>', 'set the modules directory in config (e.g., src/apis)')
    .option(
      '--target-dir <dir>',
      'target directory for generated files (default: current directory)'
    )
    .parse();

  await handleGenerateCommand(program.opts<CommandOptions>());
};

process.on('SIGINT', () => {
  console.log(chalk.yellow('\n\n⏹️  Generation cancelled by user'));
  process.exit(0);
});

// Run the CLI
if (require.main === module) {
  main().catch(error => {
    console.error('CLI Error:', error);
    process.exit(1);
  });
}
