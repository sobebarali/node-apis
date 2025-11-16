import { Command } from 'commander';
import chalk from 'chalk';
import { CommandOptions } from './types/cli.types';
import { handleGenerateCommand } from './cli/commands/generate.command';

export const main = async (): Promise<void> => {
  const program = new Command();

  program
    .name('node-apis')
    .description('Generate boilerplate folder structures for Node.js API modules')
    .version('3.6.0')
    .option('-n, --name <name>', 'module name (skips interactive prompt)')
    .option('-f, --force', 'overwrite existing directories')
    .option('--no-interactive', 'disable interactive mode')
    .option('--crud', 'generate CRUD operations (create, get, list, delete, update)')
    .option('--custom <names>', 'generate custom API operations (comma-separated names)')
    .option('--services <names>', 'generate internal service operations (comma-separated names)')
    .option('--framework <framework>', 'web framework to use (express|hono|t3|tanstack)')
    .option('--api-style <style>', 'API style to generate (rest|trpc)')
    .option('--init-config', 'initialize configuration file')
    .option('--set-framework <framework>', 'set default framework in config (express|hono|t3|tanstack)')
    .option('--set-api-style <style>', 'set default API style in config (rest|trpc)')
    .option(
      '--target-dir <dir>',
      'target directory for generated files (default: current directory)'
    )
    .option('--trpc-style', 'generate tRPC procedures instead of REST controllers (deprecated, use --api-style trpc)')
    .option('--set-trpc-style <boolean>', 'set default tRPC style preference in config (deprecated, use --set-api-style)')
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
  main().catch(error => {
    console.error('CLI Error:', error);
    process.exit(1);
  });
}
