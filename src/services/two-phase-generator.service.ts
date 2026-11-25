import * as path from 'path';
import { createHash } from 'crypto';
import fs from 'fs-extra';
import { ApiType, GeneratedFile } from '../types/common.types';
import { fileExists, writeFile } from '../filesystem/file.operations';
import { ensureDirectory } from '../filesystem/directory.operations';
import { generateCrudFileContent } from '../templates/crud.templates';
import { generateCustomFileContent } from '../templates/custom.templates';
import {
  generateServiceTypeContent,
  generateServiceContent,
} from '../templates/services.templates';
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

const MANIFEST_FILE = '.node-apis.json';
const MANIFEST_VERSION = 1;
const WHITESPACE_REGEX = /\s+/g;
const DOUBLE_QUOTE_REGEX = /"/g;
const TRAILING_COMMA_REGEX = /,(?=[}\])])/g;
const SEMICOLON_REGEX = /;/g;

type Fingerprints = Record<string, string>;

/**
 * Hashes file content, ignoring what a formatter changes (whitespace, quote
 * style, trailing commas, semicolons), so running Prettier or
 * Biome over a generated file does not count as editing it.
 */
const fingerprint = (content: string): string => {
  const normalized = content
    .replace(WHITESPACE_REGEX, '')
    .replace(DOUBLE_QUOTE_REGEX, "'")
    .replace(TRAILING_COMMA_REGEX, '')
    .replace(SEMICOLON_REGEX, '');

  return createHash('sha256').update(normalized).digest('hex').slice(0, 16);
};

/**
 * Reads the fingerprints of the files node-apis generated in a module.
 * A missing or unreadable manifest means nothing is known to be untouched.
 */
const loadManifest = async (modulePath: string): Promise<Fingerprints> => {
  try {
    const manifest: unknown = await fs.readJson(path.join(modulePath, MANIFEST_FILE));
    const files = (manifest as { files?: unknown } | null)?.files;

    if (typeof files !== 'object' || files === null) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(files).filter(
        (entry): entry is [string, string] => typeof entry[1] === 'string'
      )
    );
  } catch {
    return {};
  }
};

const saveManifest = async (modulePath: string, files: Fingerprints): Promise<void> => {
  const sorted = Object.fromEntries(
    Object.entries(files).sort(([left], [right]) => left.localeCompare(right))
  );

  await fs.writeFile(
    path.join(modulePath, MANIFEST_FILE),
    `${JSON.stringify({ version: MANIFEST_VERSION, files: sorted }, null, 2)}\n`,
    'utf8'
  );
};

/**
 * Decides what to do with one generated code file:
 * - write: it is missing, or still exactly what node-apis generated
 * - skip: it exists and only new files were asked for
 * - keep: it exists and was edited by hand, so it is never overwritten
 */
const decideAction = async ({
  filePath,
  content,
  appendMode,
  knownFingerprint,
}: {
  filePath: string;
  content: string;
  appendMode: boolean;
  knownFingerprint: string | undefined;
}): Promise<'write' | 'skip' | 'keep'> => {
  if (!(await fileExists({ filePath }))) {
    return 'write';
  }

  if (appendMode) {
    return 'skip';
  }

  const current = fingerprint(await fs.readFile(filePath, 'utf8'));
  const isUntouched = current === knownFingerprint || current === fingerprint(content);

  return isUntouched ? 'write' : 'keep';
};

/**
 * Phase 2: generates validators, handlers and repositories (or services)
 * from the reviewed type files. Files edited by hand are kept as they are.
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
}): Promise<{ generatedFiles: GeneratedFile[]; keptFiles: string[] }> => {
  const typesDir = path.join(modulePath, 'types');
  const fileModuleName = getModuleNaming(moduleName).file;
  const operations = getOperations(apiType);
  const parsedTypes = await parseModuleTypes(modulePath);

  // A member the parser cannot read is left out of the generated code, so say so
  for (const operation of operations) {
    const unread = parsedTypes[operation]?.unreadMembers ?? [];

    if (unread.length > 0) {
      console.warn(
        `⚠️  types/${operation}.${fileModuleName}.ts: left out of the generated code, add by hand: ${unread.join('; ')}`
      );
    }
  }

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

  const manifest = await loadManifest(modulePath);

  const planned = await Promise.all(
    operations.flatMap(operation =>
      buildLayers(operation).map(async ({ directory, content }) => {
        const fileName = `${operation}.${fileModuleName}.ts`;
        const filePath = path.join(modulePath, directory, fileName);
        const key = `${directory}/${fileName}`;
        const action = await decideAction({
          filePath,
          content,
          appendMode,
          knownFingerprint: manifest[key],
        });

        return { key, filePath, content, action };
      })
    )
  );

  const toWrite = planned.filter(file => file.action === 'write');

  await Promise.all(
    toWrite.map(async ({ filePath, content }) => {
      await ensureDirectory({ dirPath: path.dirname(filePath) });
      await writeFile({ filePath, content });
    })
  );

  await formatGeneratedFiles(toWrite.map(file => file.filePath));

  // Fingerprints are taken after formatting, from what is really on disk
  const fingerprints = await Promise.all(
    toWrite.map(async ({ key, filePath }) => [
      key,
      fingerprint(await fs.readFile(filePath, 'utf8')),
    ])
  );

  if (toWrite.length > 0) {
    await saveManifest(modulePath, { ...manifest, ...Object.fromEntries(fingerprints) });
  }

  return {
    generatedFiles: toWrite.map(({ key, filePath, content }) => ({
      fileName: key,
      filePath,
      content,
    })),
    keptFiles: planned.filter(file => file.action === 'keep').map(file => file.key),
  };
};
