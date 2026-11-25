import * as path from 'path';
import { ApiType, GeneratedFile } from '../types/common.types';
import { fileExists, writeFile } from '../filesystem/file.operations';
import { ensureDirectory } from '../filesystem/directory.operations';
import { generateCrudFileContent } from '../templates/crud.templates';
import { generateCustomFileContent } from '../templates/custom.templates';
import { generateServiceTypeContent, generateServiceContent } from '../templates/services.templates';
import {
  parseModuleTypes,
  convertEmptyTypePayload,
  ParsedTypePayload,
} from './type-parser.service';
import {
  generateCrudRepositoryContent,
  generateCustomRepositoryContent,
} from '../templates/typed-repository.templates';
import { generateCrudValidatorContent } from '../templates/typed-crud.validators';
import { generateTypedCustomValidatorContent } from '../templates/typed-custom.validators';
import { generateCrudHandlerContent } from '../templates/typed-crud.handlers';
import { generateTypedCustomHandlerContent } from '../templates/typed-custom.handlers';
import { getModuleNaming } from '../shared/utils/naming.utils';
import { formatGeneratedFiles } from './formatter.service';

export const CRUD_OPERATIONS = ['create', 'get', 'list', 'delete', 'update'];

const EMPTY_PARSED_TYPE: ParsedTypePayload = {
  fields: [],
  hasId: false,
  hasPagination: false,
  isEmpty: true,
};

/**
 * Lists the operations an API type generates
 */
export const getOperations = (apiType: ApiType): string[] => {
  if (apiType.type === 'crud') {
    return CRUD_OPERATIONS;
  }

  if (apiType.type === 'custom') {
    return apiType.customNames ?? [];
  }

  return apiType.serviceNames ?? [];
};

/**
 * Writes a generated file, leaving existing files untouched in append mode.
 * Returns null when the file was skipped.
 */
const writeGeneratedFile = async ({
  dirPath,
  fileName,
  content,
  appendMode,
}: {
  dirPath: string;
  fileName: string;
  content: string;
  appendMode: boolean;
}): Promise<GeneratedFile | null> => {
  const filePath = path.join(dirPath, fileName);

  if (appendMode && (await fileExists({ filePath }))) {
    return null;
  }

  await ensureDirectory({ dirPath });
  await writeFile({ filePath, content });

  return { fileName: `${path.basename(dirPath)}/${fileName}`, filePath, content };
};

const isGeneratedFile = (file: GeneratedFile | null): file is GeneratedFile => file !== null;

/**
 * Phase 1: generates the type files the rest of the module is derived from.
 * Existing type files are never overwritten: they are hand-edited and are the
 * source of truth, so `--force` regenerates only the code derived from them.
 */
export const generateTypeFilesOnly = async ({
  moduleName,
  modulePath,
  apiType,
}: {
  moduleName: string;
  modulePath: string;
  apiType: ApiType;
}): Promise<GeneratedFile[]> => {
  const typesDir = path.join(modulePath, 'types');
  const fileModuleName = getModuleNaming(moduleName).file;

  const buildContent = (operation: string): string => {
    if (apiType.type === 'crud') {
      return generateCrudFileContent({ operation, moduleName });
    }

    if (apiType.type === 'custom') {
      return generateCustomFileContent({ customName: operation, moduleName });
    }

    return generateServiceTypeContent({ serviceName: operation, moduleName });
  };

  const files = await Promise.all(
    getOperations(apiType).map(operation =>
      writeGeneratedFile({
        dirPath: typesDir,
        fileName: `${operation}.${fileModuleName}.ts`,
        content: buildContent(operation),
        appendMode: true,
      })
    )
  );

  return files.filter(isGeneratedFile);
};

/**
 * Phase 2: generates validators, handlers and repositories (or services)
 * from the reviewed type files
 */
export const generateCodeWithParsedTypes = async ({
  moduleName,
  modulePath,
  apiType,
  appendMode = false,
  useRepository = true,
}: {
  moduleName: string;
  modulePath: string;
  apiType: ApiType;
  appendMode?: boolean;
  useRepository?: boolean;
}): Promise<GeneratedFile[]> => {
  const typesDir = path.join(modulePath, 'types');
  const fileModuleName = getModuleNaming(moduleName).file;
  const operations = getOperations(apiType);
  const parsedTypes = await parseModuleTypes(modulePath);

  // An empty `typePayload = {}` accepts anything, so make it explicit
  await Promise.all(
    operations
      .filter(operation => parsedTypes[operation]?.isEmpty)
      .map(operation =>
        convertEmptyTypePayload(path.join(typesDir, `${operation}.${fileModuleName}.ts`))
      )
  );

  const buildLayers = (operation: string): Array<{ directory: string; content: string }> => {
    const parsedType = parsedTypes[operation] ?? EMPTY_PARSED_TYPE;

    if (apiType.type === 'services') {
      return [
        {
          directory: 'services',
          content: generateServiceContent({ serviceName: operation, moduleName, parsedType }),
        },
      ];
    }

    const isCrud = apiType.type === 'crud';
    const layers = [
      {
        directory: 'validators',
        content: isCrud
          ? generateCrudValidatorContent({ operation, moduleName, parsedType })
          : generateTypedCustomValidatorContent({ customName: operation, moduleName, parsedType }),
      },
      {
        directory: 'handlers',
        content: isCrud
          ? generateCrudHandlerContent({
              operation,
              moduleName,
              parsedType,
              useRepositoryLayer: useRepository,
            })
          : generateTypedCustomHandlerContent({
              customName: operation,
              moduleName,
              parsedType,
              useRepositoryLayer: useRepository,
            }),
      },
    ];

    if (useRepository) {
      layers.push({
        directory: 'repository',
        content: isCrud
          ? generateCrudRepositoryContent({ operation, moduleName, parsedType })
          : generateCustomRepositoryContent({ customName: operation, moduleName, parsedType }),
      });
    }

    return layers;
  };

  const files = await Promise.all(
    operations.flatMap(operation =>
      buildLayers(operation).map(({ directory, content }) =>
        writeGeneratedFile({
          dirPath: path.join(modulePath, directory),
          fileName: `${operation}.${fileModuleName}.ts`,
          content,
          appendMode,
        })
      )
    )
  );

  const generatedFiles = files.filter(isGeneratedFile);
  await formatGeneratedFiles(generatedFiles.map(file => file.filePath));

  return generatedFiles;
};
