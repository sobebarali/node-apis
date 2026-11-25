/**
 * Type review prompts for two-phase generation
 */

import inquirer from 'inquirer';
import { PromptResult } from '../../types/cli.types';

/**
 * Prompts user to review and edit type files
 */
export const promptTypeReview = async (
  _moduleName: string,
  typesPath: string
): Promise<PromptResult<boolean>> => {
  try {
    console.log('\n📝 Type files have been generated!');
    console.log(`\n📁 Location: ${typesPath}`);
    console.log(
      '\n🔍 Please review and edit the typePayload interfaces in the generated type files.'
    );
    console.log(
      '   Add your specific fields (name, description, etc.) to each typePayload interface.'
    );
    console.log(
      '   In a CRUD module, also describe the entity once in the file named after the module.'
    );
    console.log('\n💡 Example:');
    console.log('   export type typePayload = {');
    console.log('     name: string;');
    console.log('     description: string;');
    console.log('     category?: string;');
    console.log('   };');
    console.log(
      '\n⚠️  The service and repository code will be generated based on these field definitions.'
    );

    const answer = await inquirer.prompt([
      {
        type: 'input',
        name: 'confirmed',
        message: 'Have you reviewed and updated the type files? Enter "yes" or "y" to continue:',
        validate: (input: string) => {
          const trimmed = input.trim().toLowerCase();
          if (trimmed === 'yes' || trimmed === 'y') {
            return true;
          }
          return 'Please enter "yes" or "y" to confirm you have reviewed the type files.';
        },
      },
    ]);

    const confirmed =
      answer.confirmed.trim().toLowerCase() === 'yes' ||
      answer.confirmed.trim().toLowerCase() === 'y';

    return {
      success: true,
      data: confirmed,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get type review confirmation',
    };
  }
};

/**
 * Displays instructions for type file editing
 */
export const displayTypeInstructions = (moduleName: string, operations: string[]): void => {
  console.log('\n📋 Type File Instructions:');
  console.log(`\n   Module: ${moduleName}`);
  console.log(`   Operations: ${operations.join(', ')}`);
  console.log('\n   For each operation, edit the corresponding type file:');

  operations.forEach(operation => {
    console.log(`\n   📄 ${operation}.${moduleName}.ts:`);

    switch (operation) {
      case 'create':
        console.log('      Add fields needed to create a new record:');
        console.log('      • name: string');
        console.log('      • description: string');
        console.log('      • category?: string (optional fields use ?)');
        break;

      case 'get':
        console.log('      Usually just needs an ID:');
        console.log('      • id: string');
        break;

      case 'list':
        console.log('      Add pagination and filter fields:');
        console.log('      • page?: number');
        console.log('      • limit?: number');
        console.log('      • sortBy?: string');
        console.log('      • sortOrder?: "asc" | "desc"');
        console.log('      • search?: string');
        console.log('      • category?: string (custom filters)');
        break;

      case 'update':
        console.log('      Add ID and updatable fields:');
        console.log('      • id: string');
        console.log('      • name?: string (usually optional for updates)');
        console.log('      • description?: string');
        console.log('      • category?: string');
        break;

      case 'delete':
        console.log('      Usually needs ID and optional permanent flag:');
        console.log('      • id: string');
        console.log('      • permanent?: boolean');
        break;

      default:
        console.log('      Add fields specific to this operation:');
        console.log('      • id?: string');
        console.log('      • query?: string');
        console.log('      • filters?: any');
        break;
    }
  });

  console.log('\n💡 Tips:');
  console.log('   • Use "?" for optional fields: name?: string');
  console.log('   • Use union types: status: "active" | "inactive"');
  console.log('   • Use arrays: tags: string[]');
  console.log('   • Use nested objects: metadata: { key: string; value: any }');
};

/**
 * Displays type review completion message
 */
export const displayTypeReviewComplete = (): void => {
  console.log('\n✅ Type review completed!');
  console.log('🚀 Generating services and repositories with your defined fields...\n');
};
