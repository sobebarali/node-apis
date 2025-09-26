/**
 * T3 Stack tRPC procedure templates
 */
import { getModuleNaming, ModuleNaming } from '../shared/utils/naming.utils';

export const generateT3ProcedureContent = ({
  operation,
  moduleName,
}: {
  operation: string;
  moduleName: string;
}): string => {
  const naming = getModuleNaming(moduleName);
  const capitalizedOperation = operation.charAt(0).toUpperCase() + operation.slice(1);

  switch (operation) {
    case 'create':
      return generateCreateT3ProcedureContent(naming, capitalizedOperation);
    case 'get':
      return generateGetT3ProcedureContent(naming, capitalizedOperation);
    case 'list':
      return generateListT3ProcedureContent(naming, capitalizedOperation);
    case 'update':
      return generateUpdateT3ProcedureContent(naming, capitalizedOperation);
    case 'delete':
      return generateDeleteT3ProcedureContent(naming, capitalizedOperation);
    default:
      return generateGenericT3ProcedureContent(naming, capitalizedOperation, operation);
  }
};

const generateCreateT3ProcedureContent = (
  naming: ModuleNaming,
  _capitalizedOperation: string
): string => {
  return `import { publicProcedure } from "~/server/api/trpc";
import { payloadSchema } from "../validators/create.${naming.file}";
import create${naming.class}Handler from "../handlers/create.${naming.file}";
import type { typePayload } from "../types/create.${naming.file}";

export const create${naming.class}Procedure = publicProcedure
  .input(payloadSchema)
  .mutation(async ({ input }: { input: typePayload }) => {
    return await create${naming.class}Handler(input);
  });
`;
};

const generateGetT3ProcedureContent = (
  naming: ModuleNaming,
  _capitalizedOperation: string
): string => {
  return `import { publicProcedure } from "~/server/api/trpc";
import { payloadSchema } from "../validators/get.${naming.file}";
import get${naming.class}Handler from "../handlers/get.${naming.file}";
import type { typePayload } from "../types/get.${naming.file}";

export const get${naming.class}Procedure = publicProcedure
  .input(payloadSchema)
  .query(async ({ input }: { input: typePayload }) => {
    return await get${naming.class}Handler(input);
  });
`;
};

const generateListT3ProcedureContent = (
  naming: ModuleNaming,
  _capitalizedOperation: string
): string => {
  return `import { publicProcedure } from "~/server/api/trpc";
import { payloadSchema } from "../validators/list.${naming.file}";
import list${naming.class}sHandler from "../handlers/list.${naming.file}";
import type { typePayload } from "../types/list.${naming.file}";

export const list${naming.class}sProcedure = publicProcedure
  .input(payloadSchema)
  .query(async ({ input }: { input: typePayload }) => {
    return await list${naming.class}sHandler(input);
  });
`;
};

const generateUpdateT3ProcedureContent = (
  naming: ModuleNaming,
  _capitalizedOperation: string
): string => {
  return `import { publicProcedure } from "~/server/api/trpc";
import { payloadSchema } from "../validators/update.${naming.file}";
import update${naming.class}Handler from "../handlers/update.${naming.file}";
import type { typePayload } from "../types/update.${naming.file}";

export const update${naming.class}Procedure = publicProcedure
  .input(payloadSchema)
  .mutation(async ({ input }: { input: typePayload }) => {
    return await update${naming.class}Handler(input);
  });
`;
};

const generateDeleteT3ProcedureContent = (
  naming: ModuleNaming,
  _capitalizedOperation: string
): string => {
  return `import { publicProcedure } from "~/server/api/trpc";
import { payloadSchema } from "../validators/delete.${naming.file}";
import delete${naming.class}Handler from "../handlers/delete.${naming.file}";
import type { typePayload } from "../types/delete.${naming.file}";

export const delete${naming.class}Procedure = publicProcedure
  .input(payloadSchema)
  .mutation(async ({ input }: { input: typePayload }) => {
    return await delete${naming.class}Handler(input);
  });
`;
};

const generateGenericT3ProcedureContent = (
  naming: ModuleNaming,
  _capitalizedOperation: string,
  operation: string
): string => {
  return `import { publicProcedure } from "~/server/api/trpc";
import { payloadSchema } from "../validators/${operation}.${naming.file}";
import ${operation}${naming.class}Handler from "../handlers/${operation}.${naming.file}";
import type { typePayload } from "../types/${operation}.${naming.file}";

export const ${operation}${naming.class}Procedure = publicProcedure
  .input(payloadSchema)
  .mutation(async ({ input }: { input: typePayload }) => {
    return await ${operation}${naming.class}Handler(input);
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
