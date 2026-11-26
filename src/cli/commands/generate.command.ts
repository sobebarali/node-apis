import * as path from 'path';
import { CommandOptions } from '../../types/cli.types';
import { ApiType } from '../../types/common.types';
import { validateTargetLocation } from '../../validators/location.validator';
import {
  findInvalidOperationName,
  findReservedOperationName,
  parseOperationNames,
} from '../../validators/operation-name.validator';
import { createModuleDirectory } from '../../services/module-generator.service';
import {
  generateTypeFilesOnly,
  generateCodeWithParsedTypes,
  getOperations,
} from '../../services/two-phase-generator.service';
import { parseModuleTypes } from '../../services/type-parser.service';
import {
  promptTypeReview,
  displayTypeInstructions,
  displayTypeReviewComplete,
} from '../prompts/type-review.prompts';
import { getExistingModules, detectExistingModule } from '../../services/module-detection.service';
import { getModulePath, getProjectRoot } from '../../filesystem/path.utils';
import { directoryExists } from '../../filesystem/directory.operations';
import {
  getConfigPath,
  getGenerationSettings,
  hasConfiguredApisDir,
  initializeConfig,
  setApisDir,
} from '../../services/config.service';
import {
  displayWelcomeMessage,
  displayExistingModules,
  displayExistingFiles,
  displayGenerationSummary,
  displayGenerationResult,
  displayError,
  displayCancellation,
} from '../output/formatter';
import {
  promptModuleChoice,
  promptExistingModuleSelection,
  promptExistingModuleAction,
  promptModuleName,
  promptApiType,
  promptCustomOperations,
  promptServiceOperations,
} from '../prompts/interactive.prompts';

interface InteractiveSelection {
  moduleName: string;
  apiType: ApiType;
  appendMode: boolean;
  forceOverwrite: boolean;
}

const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Unknown error';

/**
 * Parses command line API type options
 */
const parseCommandLineApiType = (options: CommandOptions): ApiType | undefined => {
  if (options.crud) {
    return { type: 'crud' };
  }

  if (options.custom) {
    return { type: 'custom', customNames: parseOperationNames({ values: options.custom }) };
  }

  if (options.services) {
    return { type: 'services', serviceNames: parseOperationNames({ values: options.services }) };
  }

  return undefined;
};

/**
 * Handles config initialization
 */
const handleInitConfig = async (options: CommandOptions): Promise<void> => {
  try {
    const baseDir = getProjectRoot({ ...(options.targetDir && { targetDir: options.targetDir }) });
    const config = await initializeConfig({ force: options.force ?? false, baseDir });
    console.log(`✅ Created ${getConfigPath({ baseDir })}`);
    console.log(`   Modules directory: ${config.paths?.apisDir}`);
  } catch (error) {
    displayError(errorMessage(error));
    process.exit(1);
  }
};

/**
 * Handles setting the modules directory in config
 */
const handleSetApisDir = async (apisDir: string, targetDir?: string): Promise<void> => {
  try {
    await setApisDir({ apisDir, baseDir: getProjectRoot({ ...(targetDir && { targetDir }) }) });
    console.log(`✅ Modules directory set to: ${apisDir.trim()}`);
  } catch (error) {
    displayError(errorMessage(error));
    process.exit(1);
  }
};

/**
 * Asks which module to generate, and what to do when it already exists.
 * Returns null when the user cancels.
 */
const selectModule = async (
  initialModuleName?: string,
  targetDir?: string
): Promise<Omit<InteractiveSelection, 'apiType'> | null> => {
  if (initialModuleName) {
    return { moduleName: initialModuleName, appendMode: false, forceOverwrite: false };
  }

  const scope = { ...(targetDir && { targetDir }) };
  const existingModules = await getExistingModules(scope);

  if (existingModules.length > 0) {
    displayExistingModules(existingModules);

    const choice = await promptModuleChoice();
    if (!choice.success) {
      return null;
    }

    if (choice.data === 'existing') {
      const selected = await promptExistingModuleSelection(existingModules);
      if (!selected.success || !selected.data) {
        return null;
      }

      const existing = await detectExistingModule({ moduleName: selected.data, ...scope });
      if (existing && existing.existingFiles.length > 0) {
        displayExistingFiles(selected.data, existing.existingFiles);
      }

      return { moduleName: selected.data, appendMode: true, forceOverwrite: false };
    }
  }

  const named = await promptModuleName();
  if (!named.success || !named.data) {
    return null;
  }

  const existing = await detectExistingModule({ moduleName: named.data, ...scope });
  if (!existing || existing.existingFiles.length === 0) {
    return { moduleName: named.data, appendMode: false, forceOverwrite: false };
  }

  displayExistingFiles(named.data, existing.existingFiles);

  const action = await promptExistingModuleAction(named.data);
  if (!action.success || !action.data || action.data === 'cancel') {
    return null;
  }

  return {
    moduleName: named.data,
    appendMode: action.data === 'append',
    forceOverwrite: action.data === 'overwrite',
  };
};

/**
 * Asks which kind of module to generate. Returns null when the user cancels.
 */
const selectApiType = async (): Promise<ApiType | null> => {
  const selected = await promptApiType();
  if (!selected.success || !selected.data) {
    return null;
  }

  if (selected.data === 'crud') {
    return { type: 'crud' };
  }

  if (selected.data === 'custom') {
    const operations = await promptCustomOperations();
    return operations.success && operations.data
      ? { type: 'custom', customNames: operations.data }
      : null;
  }

  const operations = await promptServiceOperations();
  return operations.success && operations.data
    ? { type: 'services', serviceNames: operations.data }
    : null;
};

/**
 * Handles interactive flow for module and API type selection
 */
const handleInteractiveFlow = async (
  initialModuleName?: string,
  initialApiType?: ApiType,
  targetDir?: string
): Promise<InteractiveSelection | null> => {
  const selection = await selectModule(initialModuleName, targetDir);
  if (!selection) {
    return null;
  }

  const apiType = initialApiType ?? (await selectApiType());
  if (!apiType) {
    return null;
  }

  return { ...selection, apiType };
};

/**
 * Lets the user fill in the generated type files, then reports what was found
 */
const reviewTypes = async ({
  moduleName,
  modulePath,
  operations,
}: {
  moduleName: string;
  modulePath: string;
  operations: string[];
}): Promise<boolean> => {
  displayTypeInstructions(moduleName, operations);

  const review = await promptTypeReview(moduleName, path.join(modulePath, 'types'));
  if (!review.success || !review.data) {
    return false;
  }

  displayTypeReviewComplete();

  console.log('\n🔍 Validating type definitions...');
  const parsedTypes = await parseModuleTypes(modulePath);
  const emptyOperations = operations.filter(
    operation => (parsedTypes[operation]?.fields.length ?? 0) === 0
  );

  for (const operation of operations) {
    const fieldCount = parsedTypes[operation]?.fields.length ?? 0;
    console.log(
      fieldCount > 0
        ? `   ✓ ${operation}: ${fieldCount} field(s) detected`
        : `   ⚠ ${operation}: No fields defined (empty typePayload)`
    );
  }

  if (emptyOperations.length === operations.length) {
    console.log('\n⚠️  Warning: No fields were detected in any typePayload definitions.');
    console.log('   The generated code will receive no payload fields.');
    console.log('   You can edit the type files and run the command again with --force.');
  }

  console.log('');
  return true;
};

/**
 * Handles two-phase generation: types first, then the code derived from them
 */
const handleTwoPhaseGeneration = async ({
  moduleName,
  apiType,
  force,
  appendMode,
  targetDir,
  interactive,
  useRepository,
}: {
  moduleName: string;
  apiType: ApiType;
  force: boolean;
  appendMode: boolean;
  targetDir?: string;
  interactive: boolean;
  useRepository: boolean;
}): Promise<void> => {
  console.log('🚀 Phase 1: Generating type files...\n');

  const structure = await createModuleDirectory({
    moduleName,
    options: { force, appendMode, ...(targetDir && { targetDir }) },
  });

  if (!structure.success || !structure.moduleName || !structure.modulePath) {
    displayError(structure.error ?? 'Failed to create module structure');
    process.exit(1);
  }

  const { moduleName: normalizedModuleName, modulePath } = structure;
  const settings = await getGenerationSettings({
    projectRoot: getProjectRoot({ ...(targetDir && { targetDir }) }),
    modulePath,
  });

  const typeFiles = await generateTypeFilesOnly({
    moduleName: normalizedModuleName,
    modulePath,
    apiType,
    settings,
  });

  console.log(
    typeFiles.length > 0
      ? '✅ Type files generated successfully!\n'
      : '✅ Using the existing type files.\n'
  );

  if (interactive) {
    const confirmed = await reviewTypes({
      moduleName: normalizedModuleName,
      modulePath,
      operations: getOperations(apiType),
    });

    if (!confirmed) {
      console.log(
        '\n❌ Generation cancelled. You can run the command again after reviewing the type files.'
      );
      process.exit(0);
    }
  }

  console.log(
    apiType.type === 'services'
      ? '🚀 Phase 2: Generating services...\n'
      : `🚀 Phase 2: Generating validators${useRepository ? ', handlers and repositories' : ' and handlers'}...\n`
  );

  const { generatedFiles: codeFiles, keptFiles } = await generateCodeWithParsedTypes({
    moduleName: normalizedModuleName,
    modulePath,
    apiType,
    appendMode,
    useRepository,
    settings,
  });

  displayGenerationResult({
    success: true,
    moduleName: normalizedModuleName,
    modulePath,
    createdDirectories: structure.createdDirectories ?? [],
    generatedFiles: [...typeFiles, ...codeFiles],
    keptFiles,
  });
};

export const handleGenerateCommand = async (options: CommandOptions): Promise<void> => {
  try {
    if (options.initConfig) {
      await handleInitConfig(options);
      return;
    }

    if (options.setApisDir !== undefined) {
      await handleSetApisDir(options.setApisDir, options.targetDir);
      return;
    }

    displayWelcomeMessage();

    const projectRoot = getProjectRoot({
      ...(options.targetDir && { targetDir: options.targetDir }),
    });

    const locationValidation = await validateTargetLocation({ baseDir: projectRoot });
    if (!locationValidation.isValid) {
      displayError(locationValidation.error ?? 'Invalid target location');
      process.exit(1);
    }

    const interactive = options.interactive !== false;
    // Without a config the default is src/apis. In a project with no src/ folder
    // (a monorepo root, for example) that would create a stray tree in the wrong place.
    const hasSrcDir = await directoryExists({ dirPath: path.join(projectRoot, 'src') });
    if (!hasSrcDir && !(await hasConfiguredApisDir({ baseDir: projectRoot }))) {
      displayError(
        `No src/ folder found in ${projectRoot}.\nChoose where modules go with: node-apis --set-apis-dir <dir>`
      );
      process.exit(1);
    }

    let moduleName = options.name;
    let apiType = parseCommandLineApiType(options);
    let appendMode = false;
    let force = options.force ?? false;

    if (interactive) {
      const selection = await handleInteractiveFlow(moduleName, apiType, options.targetDir);
      if (!selection) {
        displayCancellation();
        process.exit(0);
      }

      moduleName = selection.moduleName;
      apiType = selection.apiType;
      appendMode = selection.appendMode;
      force = force || selection.forceOverwrite;
    }

    if (!moduleName) {
      displayError('Module name is required. Use --name <name>.');
      process.exit(1);
    }

    if (!apiType) {
      displayError('Choose what to generate: --crud, --custom <names> or --services <names>.');
      process.exit(1);
    }

    const operations = getOperations(apiType);
    if (operations.length === 0) {
      displayError('At least one operation name is required.');
      process.exit(1);
    }

    // Names are checked before anything is written, so a bad name leaves no folders behind
    const invalidName =
      apiType.type === 'crud' ? undefined : findInvalidOperationName({ names: operations });
    if (invalidName) {
      displayError(
        `"${invalidName}" is not a valid operation name. Use letters and digits, starting with a letter (for example sendEmail).`
      );
      process.exit(1);
    }

    const reservedName =
      apiType.type === 'custom' ? findReservedOperationName({ names: operations }) : undefined;
    if (reservedName) {
      displayError(
        `"${reservedName}" is a JavaScript keyword and cannot be a custom operation name. Pick another name (for example ${reservedName}Item).`
      );
      process.exit(1);
    }

    displayGenerationSummary({
      moduleName,
      targetPath: await getModulePath({
        moduleName,
        ...(options.targetDir && { targetDir: options.targetDir }),
      }),
      forceOverwrite: force,
      apiType: apiType.type,
      operationNames: operations,
    });

    await handleTwoPhaseGeneration({
      moduleName,
      apiType,
      force,
      appendMode,
      ...(options.targetDir && { targetDir: options.targetDir }),
      interactive,
      useRepository: options.repository !== false,
    });
  } catch (error) {
    displayError(`Unexpected error: ${errorMessage(error)}`);
    if (process.env.DEBUG && error instanceof Error) {
      console.error(error.stack);
    }
    process.exit(1);
  }
};
