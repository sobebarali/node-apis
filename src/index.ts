import { Command } from 'commander';
import chalk from 'chalk';
import { CommandOptions } from './types/cli.types';
import { handleGenerateCommand } from './cli/commands/generate.command';


export const main = async (): Promise<void> => {
  const program = new Command();

  program
    .name('node-apis')
    .description('Generate boilerplate folder structures for Node.js API modules')
    .version('3.2.0')
    .option('-n, --name <name>', 'module name (skips interactive prompt)')
    .option('-f, --force', 'overwrite existing directories')
    .option('--no-interactive', 'disable interactive mode')
    .option('--crud', 'generate CRUD operations (create, get, list, delete, update)')
    .option('--custom <names>', 'generate custom API operations (comma-separated names)')
    .option('--framework <framework>', 'web framework to use (express|hono)')
    .option('--init-config', 'initialize configuration file')
    .option('--set-framework <framework>', 'set default framework in config (express|hono)')
    .parse();

  const options = program.opts() as CommandOptions;

  // Handle config commands or regular generation
  await handleGenerateCommand(options);
};


process.on('SIGINT', () => {
  console.log(chalk.yellow('\n\n⏹️  Generation cancelled by user'));
  process.exit(0);
});

// Run the CLI
if (require.main === module) {
  main().catch((error) => {
    console.error('CLI Error:', error);
    process.exit(1);
  });
}
