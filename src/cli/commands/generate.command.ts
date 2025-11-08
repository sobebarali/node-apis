import { CommandOptions } from '../../types/cli.types';
import { ApiType } from '../../types/common.types';
import { validateTargetLocation } from '../../validators/location.validator';
import {
  generateModuleStructure,
  generateModuleStructurePhase1,
  generateModuleStructurePhase2,
} from '../../services/module-generator.service';
import {
  generateTypeFilesOnly,
  generateCodeWithParsedTypes,
} from '../../services/two-phase-generator.service';
import { generateTestFiles } from '../../services/file-generator.service';
// import { generateCompleteTestSetup } from '../../services/test-config-generator.service';
import {
  promptTypeReview,
  displayTypeInstructions,
  displayTypeReviewComplete,
} from '../prompts/type-review.prompts';

import { getExistingModules, detectExistingModule } from '../../services/module-detection.service';
import {
  getEffectiveFramework,
  getEffectiveApiStyle,
  initializeConfig,
  setFramework,
  setApiStyle,
  configExists,
} from '../../services/config.service';
import { SupportedFramework, SupportedApiStyle } from '../../types/config.types';
import {
  displayWelcomeMessage,
  displayExistingModules,
  displayExistingFiles,
  displayGenerationSummary,
  displayGenerationResult,
  displayError,
  displayCancellation,
  displayProgress,
} from '../output/formatter';
import {
  promptModuleChoice,
  promptExistingModuleSelection,
  promptExistingModuleAction,
  promptModuleName,
  promptApiType,
  promptCustomOperations,
  promptServiceOperations,
  promptApiStyleSelection,
  promptSaveApiStyleToConfig,
  promptFrameworkSelection,
  promptSaveFrameworkToConfig,
} from '../prompts/interactive.prompts';

export const handleGenerateCommand = async (options: CommandOptions): Promise<void> => {
  try {
    // Handle config-only operations first
    if (options.initConfig) {
      await handleInitConfig(options);
      return;
    }

    if (options.setFramework) {
      await handleSetFramework(options);
      return;
    }

    if (options.setApiStyle) {
      await handleSetApiStyle(options);
      return;
    }

    if (options.setTrpcStyle) {
      await handleSetTrpcStyle(options);
      return;
    }

    displayWelcomeMessage();

    const locationValidation = await validateTargetLocation();
    if (!locationValidation.isValid) {
      displayError(locationValidation.error!);
      process.exit(1);
    }

    let moduleName = options.name;
    let apiType: ApiType | undefined;
    let appendMode = false;

    apiType = parseCommandLineApiType(options);

    if (options.interactive !== false) {
      // Only get framework from config/CLI if explicitly provided
      // Don't use default yet - let interactive flow prompt if needed
      const hasConfig = await configExists();
      const framework = options.framework || (hasConfig ? await getEffectiveFramework({
        ...(options.framework && { cliFramework: options.framework }),
      }) : undefined);

      const interactiveResult = await handleInteractiveFlow(moduleName, framework, apiType);
      if (!interactiveResult.success) {
        displayCancellation();
        process.exit(0);
      }

      moduleName = interactiveResult.moduleName;
      appendMode = interactiveResult.appendMode;

      // Use interactive force override if not already set via CLI
      if (!options.force && interactiveResult.forceOverwrite) {
        options.force = true;
      }

      if (!apiType) {
        apiType = interactiveResult.apiType;
      }
    }

    if (!moduleName) {
      displayError('Module name is required');
      process.exit(1);
    }

    const targetPath = options.targetDir
      ? `${options.targetDir}/src/apis/${moduleName.toLowerCase()}`
      : `src/apis/${moduleName.toLowerCase()}`;

    displayGenerationSummary({
      moduleName,
      targetPath,
      forceOverwrite: options.force || false,
      apiType: apiType?.type || undefined,
      operationNames: getOperationNames(apiType),
    });

    if (apiType) {
      // Handle backward compatibility: --trpc-style maps to --api-style trpc
      let effectiveApiStyle: SupportedApiStyle | undefined = options.apiStyle as SupportedApiStyle;
      
      if (options.trpcStyle && !effectiveApiStyle) {
        console.log('⚠️  Warning: --trpc-style is deprecated, use --api-style trpc instead');
        effectiveApiStyle = 'trpc';
      }

      // Get effective framework and API style from config, CLI option, or prompt user
      const framework = await getEffectiveFramework({
        ...(options.framework && { cliFramework: options.framework }),
      });

      // For T3 framework, always use tRPC (no need to ask for API style)
      let apiStyle: SupportedApiStyle;
      if (framework === 't3') {
        apiStyle = 'trpc';
      } else {
        apiStyle = await getEffectiveApiStyle({
          ...(effectiveApiStyle && { cliApiStyle: effectiveApiStyle }),
        });
      }

      // Convert API style to trpcStyle for current generation logic
      const trpcStyle = apiStyle === 'trpc';

      await handleTwoPhaseGeneration({
        moduleName,
        apiType,
        framework,
        options: {
          force: options.force || false,
          appendMode,
          ...(options.targetDir && { targetDir: options.targetDir }),
          trpcStyle,
        },
        interactive: options.interactive !== false,
      });
    } else {
      displayProgress();

      const result = await generateModuleStructure({
        moduleName,
        options: {
          force: options.force || false,
          appendMode,
          ...(options.targetDir && { targetDir: options.targetDir }),
        },
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
  framework,
  options,
  interactive,
}: {
  moduleName: string;
  apiType: ApiType;
  framework: string;
  options: { force: boolean; appendMode: boolean; targetDir?: string; trpcStyle?: boolean };
  interactive: boolean;
}) => {
  const { force = false, appendMode = false, targetDir, trpcStyle = false } = options;

  try {
    // Phase 1: Generate only main directory, types subdirectory, and type files
    console.log('🚀 Phase 1: Generating directory structure and type files...\n');

    const structureResult = await generateModuleStructurePhase1({
      moduleName,
      options: { force, appendMode, ...(targetDir && { targetDir }) },
      framework,
    });

    if (!structureResult.success) {
      displayError(structureResult.error || 'Failed to create module structure');
      process.exit(1);
    }

    // Use the normalized module name and path from the structure result
    const normalizedModuleName = structureResult.moduleName!;
    const modulePath = structureResult.modulePath!;

    const typeFiles = await generateTypeFilesOnly({
      moduleName: normalizedModuleName,
      modulePath,
      apiType,
      appendMode,
      framework: framework as 'express' | 'hono' | 't3',
    });

    console.log('✅ Type files generated successfully!\n');

    // Show instructions and get user confirmation in interactive mode
    if (interactive) {
      const operations = getOperationNames(apiType) || [];
      displayTypeInstructions(normalizedModuleName, operations);

      const reviewResult = await promptTypeReview(normalizedModuleName, `${modulePath}/types`);

      if (!reviewResult.success || !reviewResult.data) {
        console.log(
          '\n❌ Generation cancelled. You can run the command again after reviewing the type files.'
        );
        process.exit(0);
      }

      displayTypeReviewComplete();
    }

    // Phase 2: Create remaining directories and generate services/repositories with framework support
    console.log(`🚀 Phase 2: Generating services and repositories for ${framework} framework...\n`);

    // Create remaining subdirectories based on API type
    const phase2Result = await generateModuleStructurePhase2({
      modulePath,
      apiType,
      trpcStyle,
      framework,
    });

    if (!phase2Result.success) {
      displayError(phase2Result.error || 'Failed to create remaining directories');
      process.exit(1);
    }

    const codeFiles = await generateCodeWithParsedTypes({
      moduleName: normalizedModuleName,
      modulePath,
      apiType,
      framework, // Pass framework to generation
      appendMode,
      trpcStyle, // Pass tRPC style to generation
    });

    // Phase 3: Generate test files
    console.log('🧪 Phase 3: Generating comprehensive test suite...\n');

    const testPath = 'tests';
    const testFiles = await generateTestFiles({
      moduleName: normalizedModuleName,
      testPath,
      apiType,
      trpcStyle,
      framework,
    });

    // Generate test configuration (only once per project)
    let testConfigFiles: any[] = [];
    try {
      // TODO: Re-enable test configuration generation in future version
      // const testSetup = await generateCompleteTestSetup({
      //   projectRoot: '.',
      //   appendMode: true, // Don't overwrite existing config
      // });
      // testConfigFiles = [...testSetup.configFiles, ...testSetup.additionalFiles];
      // if (testSetup.packageJsonUpdated) {
      //   console.log('📦 Updated package.json with test scripts and dependencies');
      // }
    } catch (error) {
      console.log('⚠️  Test configuration already exists or failed to generate');
    }

    // Display final results
    const allFiles = [...typeFiles, ...codeFiles, ...testFiles, ...testConfigFiles];
    displayGenerationResult({
      success: true,
      moduleName,
      modulePath,
      createdDirectories: structureResult.createdDirectories || [],
      generatedFiles: allFiles,
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
  } else if (options.services) {
    const serviceNames = options.services
      .split(',')
      .map(name => name.trim())
      .filter(name => name.length > 0);
    return { type: 'services', serviceNames };
  }
  return undefined;
};

/**
 * Handles interactive flow for module and API type selection
 */
const handleInteractiveFlow = async (
  initialModuleName?: string,
  framework?: string,
  initialApiType?: ApiType
): Promise<{
  success: boolean;
  moduleName?: string;
  apiType?: ApiType;
  appendMode: boolean;
  forceOverwrite: boolean;
}> => {
  let moduleName = initialModuleName;
  let apiType: ApiType | undefined = initialApiType;
  let appendMode = false;
  let forceOverwrite = false;

  // Check for existing modules and offer smart choices
  const existingModules = await getExistingModules({
    ...(framework && { framework }),
  });

  if (!moduleName && existingModules.length > 0) {
    displayExistingModules(existingModules);

    const moduleChoiceResult = await promptModuleChoice();
    if (!moduleChoiceResult.success) {
      return { success: false, appendMode: false, forceOverwrite: false };
    }

    if (moduleChoiceResult.data === 'existing') {
      const existingModuleResult = await promptExistingModuleSelection(existingModules);
      if (!existingModuleResult.success) {
        return { success: false, appendMode: false, forceOverwrite: false };
      }

      moduleName = existingModuleResult.data;
      appendMode = true;

      // Show existing files
      const existingModule = await detectExistingModule({
        moduleName: moduleName!,
        ...(framework && { framework }),
      });
      if (existingModule && existingModule.existingFiles.length > 0) {
        displayExistingFiles(moduleName!, existingModule.existingFiles);
      }
    }
  }

  // If creating new module or no existing modules found
  if (!moduleName) {
    const moduleNameResult = await promptModuleName();
    if (!moduleNameResult.success) {
      return { success: false, appendMode: false, forceOverwrite: false };
    }
    moduleName = moduleNameResult.data;

    // Check if the new module name already exists
    const existingModule = await detectExistingModule({
      moduleName: moduleName!,
      ...(framework && { framework }),
    });
    if (existingModule && existingModule.existingFiles.length > 0) {
      displayExistingFiles(moduleName!, existingModule.existingFiles);

      const actionResult = await promptExistingModuleAction(moduleName!);
      if (!actionResult.success) {
        return { success: false, appendMode: false, forceOverwrite: false };
      }

      if (actionResult.data === 'cancel') {
        return { success: false, appendMode: false, forceOverwrite: false };
      } else if (actionResult.data === 'append') {
        appendMode = true;
      } else if (actionResult.data === 'overwrite') {
        forceOverwrite = true;
      }
    }
  }

  // Prompt for API type if not provided via command line
  if (!apiType) {
    const apiTypeResult = await promptApiType();
    if (!apiTypeResult.success) {
      return { success: false, appendMode: false, forceOverwrite: false };
    }

    if (apiTypeResult.data === 'crud') {
      apiType = { type: 'crud' };
    } else if (apiTypeResult.data === 'custom') {
      const customOperationsResult = await promptCustomOperations();
      if (!customOperationsResult.success) {
        return { success: false, appendMode: false, forceOverwrite: false };
      }
      apiType = { type: 'custom', customNames: customOperationsResult.data! };
    } else if (apiTypeResult.data === 'services') {
      const serviceOperationsResult = await promptServiceOperations();
      if (!serviceOperationsResult.success) {
        return { success: false, appendMode: false, forceOverwrite: false };
      }
      apiType = { type: 'services', serviceNames: serviceOperationsResult.data! };
    }
  }

  // Handle framework selection if not provided via CLI and not in config
  let selectedFramework: string | undefined = framework;
  if (!framework && apiType) {
    const frameworkResult = await promptFrameworkSelection();
    if (!frameworkResult.success) {
      return { success: false, appendMode: false, forceOverwrite: false };
    }

    selectedFramework = frameworkResult.data!;

    // Ask if user wants to save this choice
    const saveResult = await promptSaveFrameworkToConfig({ framework: selectedFramework as SupportedFramework });
    if (saveResult.success && saveResult.data) {
      try {
        await setFramework({ framework: selectedFramework as SupportedFramework });
        console.log(
          `✅ Saved ${selectedFramework} as default framework in node-apis.config.json\n`
        );
      } catch (error: any) {
        console.warn(`⚠️  Could not save framework to config: ${error.message}\n`);
      }
    }
  }

  // Handle API style selection if not provided via CLI and not in config
  // Only ask for API style if framework is not T3 (T3 always uses tRPC)
  if (apiType) {
    const hasConfig = await configExists();
    const effectiveFramework = selectedFramework || (await getEffectiveFramework());

    // If no config exists and framework is not T3, prompt user for API style
    if (!hasConfig && effectiveFramework !== 't3') {
      const apiStyleResult = await promptApiStyleSelection();
      if (!apiStyleResult.success) {
        return { success: false, appendMode: false, forceOverwrite: false };
      }

      const selectedApiStyle = apiStyleResult.data!;

      // Ask if user wants to save this choice
      const saveResult = await promptSaveApiStyleToConfig({ apiStyle: selectedApiStyle });
      if (saveResult.success && saveResult.data) {
        try {
          await setApiStyle({ apiStyle: selectedApiStyle });
          console.log(
            `✅ Saved ${selectedApiStyle === 'trpc' ? 'tRPC procedures' : 'REST controllers'} as default API style in node-apis.config.json\n`
          );
        } catch (error: any) {
          console.warn(`⚠️  Could not save API style to config: ${error.message}\n`);
        }
      }
    }
  }

  return {
    success: true,
    moduleName: moduleName!,
    apiType: apiType!,
    appendMode,
    forceOverwrite,
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
  } else if (apiType.type === 'services' && apiType.serviceNames) {
    return apiType.serviceNames;
  }

  return undefined;
};

/**
 * Handles config initialization
 */
const handleInitConfig = async (options: CommandOptions): Promise<void> => {
  try {
    const exists = await configExists();

    if (exists && !options.force) {
      displayError('Config file already exists. Use --force to overwrite.');
      process.exit(1);
    }

    let framework: SupportedFramework = 'express';

    // If interactive mode, prompt for framework
    if (options.interactive !== false) {
      const frameworkResult = await promptFrameworkSelection();
      if (!frameworkResult.success) {
        displayCancellation();
        process.exit(0);
      }
      framework = frameworkResult.data!;
    }

    const config = await initializeConfig({ framework, force: options.force || false });

    console.log('✅ Configuration file created successfully!');
    console.log(`📁 Location: node-apis.config.json`);
    console.log(`🚀 Default framework: ${config.framework}`);
    console.log('\nYou can now run commands without specifying the framework.');
  } catch (error: any) {
    displayError(`Failed to initialize config: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Handles setting framework in config
 */
const handleSetFramework = async (options: CommandOptions): Promise<void> => {
  try {
    const framework = options.setFramework as SupportedFramework;

    if (!['express', 'hono'].includes(framework)) {
      displayError(`Invalid framework: ${framework}. Must be 'express' or 'hono'`);
      process.exit(1);
    }

    await setFramework({ framework });

    console.log(`✅ Framework set to: ${framework}`);
    console.log('📁 Updated: node-apis.config.json');
  } catch (error: any) {
    displayError(`Failed to set framework: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Handles --set-api-style command
 */
const handleSetApiStyle = async (options: CommandOptions): Promise<void> => {
  try {
    const apiStyle = options.setApiStyle as SupportedApiStyle;

    if (!['rest', 'trpc'].includes(apiStyle)) {
      displayError(`Invalid API style: ${apiStyle}. Must be 'rest' or 'trpc'`);
      process.exit(1);
    }

    await setApiStyle({ apiStyle });

    console.log(`✅ API style set to: ${apiStyle === 'trpc' ? 'tRPC procedures' : 'REST controllers'}`);
    console.log('📁 Updated: node-apis.config.json');
  } catch (error: any) {
    displayError(`Failed to set API style: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Handles --set-trpc-style command (deprecated)
 */
const handleSetTrpcStyle = async (options: CommandOptions): Promise<void> => {
  try {
    console.log('⚠️  Warning: --set-trpc-style is deprecated, use --set-api-style instead');
    
    const trpcStyleValue = options.setTrpcStyle;

    if (!trpcStyleValue || !['true', 'false'].includes(trpcStyleValue.toLowerCase())) {
      displayError(`Invalid tRPC style value: ${trpcStyleValue}. Must be 'true' or 'false'`);
      process.exit(1);
    }

    const trpcStyle = trpcStyleValue.toLowerCase() === 'true';
    const apiStyle: SupportedApiStyle = trpcStyle ? 'trpc' : 'rest';

    await setApiStyle({ apiStyle });

    console.log(`✅ API style set to: ${apiStyle === 'trpc' ? 'tRPC procedures' : 'REST controllers'}`);
    console.log('📁 Updated: node-apis.config.json');
  } catch (error: any) {
    displayError(`Failed to set API style: ${error.message}`);
    process.exit(1);
  }
};
