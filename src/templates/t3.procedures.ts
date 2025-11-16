/**
 * T3 Stack tRPC procedure templates
 */
import { getModuleNaming, ModuleNaming } from '../shared/utils/naming.utils';

export const generateT3ProcedureContent = ({
  operation,
  moduleName,
  apiBasePath = '~/server/api',
}: {
  operation: string;
  moduleName: string;
  apiBasePath?: string;
}): string => {
  const naming = getModuleNaming(moduleName);
  const capitalizedOperation = operation.charAt(0).toUpperCase() + operation.slice(1);

  switch (operation) {
    case 'create':
      return generateCreateT3ProcedureContent(naming, capitalizedOperation, apiBasePath);
    case 'get':
      return generateGetT3ProcedureContent(naming, capitalizedOperation, apiBasePath);
    case 'list':
      return generateListT3ProcedureContent(naming, capitalizedOperation, apiBasePath);
    case 'update':
      return generateUpdateT3ProcedureContent(naming, capitalizedOperation, apiBasePath);
    case 'delete':
      return generateDeleteT3ProcedureContent(naming, capitalizedOperation, apiBasePath);
    default:
      return generateGenericT3ProcedureContent(naming, capitalizedOperation, operation, apiBasePath);
  }
};

const generateCreateT3ProcedureContent = (
  naming: ModuleNaming,
  _capitalizedOperation: string,
  apiBasePath: string
): string => {
  return `import { randomBytes } from "node:crypto";
import { publicProcedure } from "${apiBasePath}/trpc";
import create${naming.class}Handler from "../handlers/create.${naming.file}";
import type { typePayload } from "../types/create.${naming.file}";
import { payloadSchema } from "../validators/create.${naming.file}";

export const create${naming.class}Procedure = publicProcedure
  .input(payloadSchema)
  .mutation(async ({ input }: { input: typePayload }) => {
    const requestId = randomBytes(16).toString("hex");

    return await create${naming.class}Handler({
      ...input,
      requestId,
    });
  });
`;
};

const generateGetT3ProcedureContent = (
  naming: ModuleNaming,
  _capitalizedOperation: string,
  apiBasePath: string
): string => {
  return `import { randomBytes } from "node:crypto";
import { publicProcedure } from "${apiBasePath}/trpc";
import get${naming.class}Handler from "../handlers/get.${naming.file}";
import type { typePayload } from "../types/get.${naming.file}";
import { payloadSchema } from "../validators/get.${naming.file}";

export const get${naming.class}Procedure = publicProcedure
  .input(payloadSchema)
  .query(async ({ input }: { input: typePayload }) => {
    const requestId = randomBytes(16).toString("hex");

    return await get${naming.class}Handler({
      ...input,
      requestId,
    });
  });
`;
};

const generateListT3ProcedureContent = (
  naming: ModuleNaming,
  _capitalizedOperation: string,
  apiBasePath: string
): string => {
  return `import { randomBytes } from "node:crypto";
import { publicProcedure } from "${apiBasePath}/trpc";
import list${naming.class}sHandler from "../handlers/list.${naming.file}";
import type { typePayload } from "../types/list.${naming.file}";
import { payloadSchema } from "../validators/list.${naming.file}";

export const list${naming.class}sProcedure = publicProcedure
  .input(payloadSchema)
  .query(async ({ input }: { input: typePayload }) => {
    const requestId = randomBytes(16).toString("hex");

    return await list${naming.class}sHandler({
      ...input,
      requestId,
    });
  });
`;
};

const generateUpdateT3ProcedureContent = (
  naming: ModuleNaming,
  _capitalizedOperation: string,
  apiBasePath: string
): string => {
  return `import { randomBytes } from "node:crypto";
import { publicProcedure } from "${apiBasePath}/trpc";
import update${naming.class}Handler from "../handlers/update.${naming.file}";
import type { typePayload } from "../types/update.${naming.file}";
import { payloadSchema } from "../validators/update.${naming.file}";

export const update${naming.class}Procedure = publicProcedure
  .input(payloadSchema)
  .mutation(async ({ input }: { input: typePayload }) => {
    const requestId = randomBytes(16).toString("hex");

    return await update${naming.class}Handler({
      ...input,
      requestId,
    });
  });
`;
};

const generateDeleteT3ProcedureContent = (
  naming: ModuleNaming,
  _capitalizedOperation: string,
  apiBasePath: string
): string => {
  return `import { randomBytes } from "node:crypto";
import { publicProcedure } from "${apiBasePath}/trpc";
import delete${naming.class}Handler from "../handlers/delete.${naming.file}";
import type { typePayload } from "../types/delete.${naming.file}";
import { payloadSchema } from "../validators/delete.${naming.file}";

export const delete${naming.class}Procedure = publicProcedure
  .input(payloadSchema)
  .mutation(async ({ input }: { input: typePayload }) => {
    const requestId = randomBytes(16).toString("hex");

    return await delete${naming.class}Handler({
      ...input,
      requestId,
    });
  });
`;
};

const generateGenericT3ProcedureContent = (
  naming: ModuleNaming,
  _capitalizedOperation: string,
  operation: string,
  apiBasePath: string
): string => {
  return `import { randomBytes } from "node:crypto";
import { publicProcedure } from "${apiBasePath}/trpc";
import ${operation}${naming.class}Handler from "../handlers/${operation}.${naming.file}";
import type { typePayload } from "../types/${operation}.${naming.file}";
import { payloadSchema } from "../validators/${operation}.${naming.file}";

export const ${operation}${naming.class}Procedure = publicProcedure
  .input(payloadSchema)
  .mutation(async ({ input }: { input: typePayload }) => {
    const requestId = randomBytes(16).toString("hex");

    return await ${operation}${naming.class}Handler({
      ...input,
      requestId,
    });
  });
`;
};

/**
 * Gets the list of T3 procedure file names for a module
 */
export const getT3ProcedureFileNames = ({ moduleName }: { moduleName: string }): string[] => {
  const naming = getModuleNaming(moduleName);
  return [
    `create.${naming.file}.ts`,
    `get.${naming.file}.ts`,
    `list.${naming.file}.ts`,
    `delete.${naming.file}.ts`,
    `update.${naming.file}.ts`,
  ];
};
