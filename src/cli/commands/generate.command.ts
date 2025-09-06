/**
 * Generate command handler
 */

import { CommandOptions } from '../../types/cli.types';
import { ApiType } from '../../types/common.types';
import { validateTargetLocation } from '../../validators/location.validator';
import { generateModuleStructure } from '../../services/module-generator.service';
import { generateTypeFilesOnly, generateCodeWithParsedTypes } from '../../services/two-phase-generator.service';
import { promptTypeReview, displayTypeInstructions, displayTypeReviewComplete } from '../prompts/type-review.prompts';
import { getModulePath } from '../../filesystem/path.utils';
import { getExistingModules, detectExistingModule } from '../../services/module-detection.service';
import {
  displayWelcomeMessage,
  displayExistingModules,
  displayExistingFiles,
  displayGenerationSummary,
  displayGenerationResult,
  displayError,
  displayCancellation,
  displayProgress
} from '../output/formatter';
import {
  promptModuleChoice,
  promptExistingModuleSelection,
  promptModuleName,
  promptApiType,
  promptCustomOperations,
  promptConfirmation
} from '../prompts/interactive.prompts';

/**
 * Main generate command handler
 */
export const handleGenerateCommand = async (options: CommandOptions): Promise<void> => {
  try {
    displayWelcomeMessage();

    // Validate target location
    const locationValidation = await validateTargetLocation();
    if (!locationValidation.isValid) {
      displayError(locationValidation.error!);
      process.exit(1);
    }

    let moduleName = options.name;
    let apiType: ApiType | undefined;
    let appendMode = false;

    // Handle command line API type options
    apiType = parseCommandLineApiType(options);

    // Interactive mode: enhanced developer-friendly flow
    if (options.interactive !== false) {
      const interactiveResult = await handleInteractiveFlow(moduleName);
      if (!interactiveResult.success) {
        displayCancellation();
        process.exit(0);
      }
      
      moduleName = interactiveResult.moduleName;
      appendMode = interactiveResult.appendMode;
      
      if (!apiType) {
        apiType = interactiveResult.apiType;
      }
    }

    // Validate module name is provided
    if (!moduleName) {
      displayError('Module name is required');
      process.exit(1);
    }

    // Display generation summary
    displayGenerationSummary({
      moduleName,
      targetPath: `src/apis/${moduleName.toLowerCase()}`,
      forceOverwrite: options.force || false,
      apiType: apiType?.type || undefined,
      operationNames: getOperationNames(apiType)
    });

    // Confirm generation in interactive mode
    if (options.interactive !== false) {
      const confirmResult = await promptConfirmation();
      if (!confirmResult.success || !confirmResult.data) {
        displayCancellation();
        process.exit(0);
      }
    }

    // Two-phase generation approach
    if (apiType) {
      await handleTwoPhaseGeneration({
        moduleName,
        apiType,
        options: {
          force: options.force || false,
          appendMode
        },
        interactive: options.interactive !== false
      });
    } else {
      // Fallback to old approach for directory-only generation
      displayProgress();

      const result = await generateModuleStructure({
        moduleName,
        options: {
          force: options.force || false,
          appendMode
        }
      });

      displayGenerationResult(result);

      if (!result.success) {
        process.exit(1);
      }
    }

  } catch (error: any) {
    displayError(`Unexpected error: ${error.message}`);
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  }
};

/**
 * Handles two-phase generation: types first, then services/repositories
 */
const handleTwoPhaseGeneration = async ({
  moduleName,
  apiType,
  options,
  interactive
}: {
  moduleName: string;
  apiType: ApiType;
  options: { force: boolean; appendMode: boolean };
  interactive: boolean;
}) => {
  const baseDir = process.cwd();
  const { force = false, appendMode = false } = options;
  const modulePath = getModulePath({ moduleName, baseDir });

  try {
    // Phase 1: Generate directory structure and type files only
    console.log('🚀 Phase 1: Generating directory structure and type files...\n');

    const structureResult = await generateModuleStructure({
      moduleName,
      options: { force, appendMode }
    });

    if (!structureResult.success) {
      displayError(structureResult.error || 'Failed to create module structure');
      process.exit(1);
    }

    const typeFiles = await generateTypeFilesOnly({
      moduleName,
      modulePath,
      apiType,
      appendMode
    });

    console.log('✅ Type files generated successfully!\n');

    // Show instructions and get user confirmation in interactive mode
    if (interactive) {
      const operations = getOperationNames(apiType) || [];
      displayTypeInstructions(moduleName, operations);

      const reviewResult = await promptTypeReview(moduleName, `${modulePath}/types`);

      if (!reviewResult.success || !reviewResult.data) {
        console.log('\n❌ Generation cancelled. You can run the command again after reviewing the type files.');
        process.exit(0);
      }

      displayTypeReviewComplete();
    }

    // Phase 2: Parse types and generate services/repositories
    console.log('🚀 Phase 2: Generating services and repositories with your defined types...\n');

    const codeFiles = await generateCodeWithParsedTypes({
      moduleName,
      modulePath,
      apiType,
      appendMode
    });

    // Display final results
    const allFiles = [...typeFiles, ...codeFiles];
    displayGenerationResult({
      success: true,
      moduleName,
      modulePath,
      createdDirectories: structureResult.createdDirectories || [],
      generatedFiles: allFiles
    });

  } catch (error: any) {
    displayError(`Generation failed: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Parses command line API type options
 */
const parseCommandLineApiType = (options: CommandOptions): ApiType | undefined => {
  if (options.crud) {
    return { type: 'crud' };
  } else if (options.custom) {
    const customNames = options.custom
      .split(',')
      .map(name => name.trim())
      .filter(name => name.length > 0);
    return { type: 'custom', customNames };
  }
  return undefined;
};

/**
 * Handles interactive flow for module and API type selection
 */
const handleInteractiveFlow = async (initialModuleName?: string): Promise<{
  success: boolean;
  moduleName?: string;
  apiType?: ApiType;
  appendMode: boolean;
}> => {
  let moduleName = initialModuleName;
  let apiType: ApiType | undefined;
  let appendMode = false;

  // Check for existing modules and offer smart choices
  const existingModules = await getExistingModules();
  
  if (!moduleName && existingModules.length > 0) {
    displayExistingModules(existingModules);

    const moduleChoiceResult = await promptModuleChoice();
    if (!moduleChoiceResult.success) {
      return { success: false, appendMode: false };
    }

    if (moduleChoiceResult.data === 'existing') {
      const existingModuleResult = await promptExistingModuleSelection(existingModules);
      if (!existingModuleResult.success) {
        return { success: false, appendMode: false };
      }
      
      moduleName = existingModuleResult.data;
      appendMode = true;
      
      // Show existing files
      const existingModule = await detectExistingModule({ moduleName: moduleName! });
      if (existingModule && existingModule.existingFiles.length > 0) {
        displayExistingFiles(moduleName!, existingModule.existingFiles);
      }
    }
  }

  // If creating new module or no existing modules found
  if (!moduleName) {
    const moduleNameResult = await promptModuleName();
    if (!moduleNameResult.success) {
      return { success: false, appendMode: false };
    }
    moduleName = moduleNameResult.data;
  }

  // Prompt for API type if not provided via command line
  if (!apiType) {
    const apiTypeResult = await promptApiType();
    if (!apiTypeResult.success) {
      return { success: false, appendMode: false };
    }

    if (apiTypeResult.data === 'crud') {
      apiType = { type: 'crud' };
    } else {
      const customOperationsResult = await promptCustomOperations();
      if (!customOperationsResult.success) {
        return { success: false, appendMode: false };
      }
      apiType = { type: 'custom', customNames: customOperationsResult.data! };
    }
  }

  return {
    success: true,
    moduleName: moduleName!,
    apiType,
    appendMode
  };
};

/**
 * Gets operation names for display
 */
const getOperationNames = (apiType?: ApiType): string[] | undefined => {
  if (!apiType) return undefined;
  
  if (apiType.type === 'crud') {
    return ['create', 'get', 'list', 'delete', 'update'];
  } else if (apiType.type === 'custom' && apiType.customNames) {
    return apiType.customNames;
  }
  
  return undefined;
};
