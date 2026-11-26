/**
 * Service operation templates for third-party integrations
 */

import { ParsedTypePayload } from '../services/type-parser.service';
import { getModuleNaming } from '../shared/utils/naming.utils';
import { DEFAULT_GENERATION_SETTINGS, GenerationSettings } from '../types/config.types';
import {
  buildContextImport,
  buildEntrySignature,
  buildGuardedBody,
  buildNotImplemented,
  buildRefusalImport,
  buildTypeImportNames,
  payloadTypeName,
} from './typed-crud.handlers';
import { buildResultTypes, buildTypeFileImports } from './crud.templates';

/**
 * Gets the list of service operation file names for a module
 */
export const getServiceFileNames = ({
  moduleName,
  serviceNames,
}: {
  moduleName: string;
  serviceNames: string[];
}): string[] => {
  const naming = getModuleNaming(moduleName);
  return serviceNames.map(serviceName => `${serviceName}.${naming.file}.ts`);
};

/**
 * Generates TypeScript type file content for service operations
 */
export const generateServiceTypeContent = ({
  serviceName,
  moduleName,
  settings = DEFAULT_GENERATION_SETTINGS,
}: {
  serviceName: string;
  moduleName: string;
  settings?: GenerationSettings;
}): string => {
  const naming = getModuleNaming(moduleName);

  const errors = { codes: ['INTERNAL_ERROR'], settings, keepInternalError: true };

  return `${buildTypeFileImports(errors)}export type typePayload = {
  // Define payload for ${serviceName} ${naming.variable}
  // Add your ${serviceName} specific fields here
};

export type typeResultData = {
  // Define result data for ${serviceName} ${naming.variable}
  // Add your ${serviceName} response fields here
};

${buildResultTypes(errors)}`;
};

/**
 * Generates service implementation file content
 */
export const generateServiceContent = ({
  serviceName,
  moduleName,
  parsedType,
  settings = DEFAULT_GENERATION_SETTINGS,
}: {
  serviceName: string;
  moduleName: string;
  parsedType: ParsedTypePayload;
  settings?: GenerationSettings;
}): string => {
  const naming = getModuleNaming(moduleName);
  const { fields } = parsedType;
  const logLabel = `${serviceName.toUpperCase()} ${naming.constant}`;
  const hasPayload = fields.length > 0;

  const { body, readsRequestId } = buildGuardedBody({
    layer: 'SERVICE',
    logLabel,
    failureMessage: `Failed to execute ${serviceName} service for ${naming.variable}`,
    subject: naming.class,
    buildLogic: indent =>
      `${indent}// TODO: Call the third-party API here and return { data, error: null }
${buildNotImplemented({ label: `${logLabel} service`, fields, indent })}`,
    parsedType,
    settings,
  });

  const signature = buildEntrySignature({
    start: `export const ${serviceName}${naming.class} = async (`,
    end: '): Promise<typeResult> => {',
    names: fields.map(field => field.name),
    hasPayload,
    payloadType: payloadTypeName(parsedType),
    readsExtra: readsRequestId,
    settings,
  });
  const typeImports = buildTypeImportNames({ hasPayload, settings });

  return `${buildRefusalImport(settings)}${buildContextImport(settings)}import type { ${typeImports} } from '../types/${serviceName}.${naming.file}';

${signature}
${body}
};
`;
};

/**
 * Generates the list of service names from a comma-separated string
 */
export const parseServiceNames = (servicesString: string): string[] => {
  return servicesString
    .split(',')
    .map(name => name.trim())
    .filter(name => name.length > 0);
};
