/**
 * Gets the list of tRPC procedure file names for a module
 */
import { getModuleNaming, ModuleNaming } from '../shared/utils/naming.utils';

export const getTrpcProcedureFileNames = ({ moduleName }: { moduleName: string }): string[] => {
  const naming = getModuleNaming(moduleName);
  return [
    `create.${naming.file}.ts`,
    `get.${naming.file}.ts`,
    `list.${naming.file}.ts`,
    `delete.${naming.file}.ts`,
    `update.${naming.file}.ts`,
  ];
};

export const generateTrpcProcedureContent = ({
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
      return generateCreateProcedureContent(naming, capitalizedOperation);
    case 'get':
      return generateGetProcedureContent(naming, capitalizedOperation);
    case 'list':
      return generateListProcedureContent(naming, capitalizedOperation);
    case 'update':
      return generateUpdateProcedureContent(naming, capitalizedOperation);
    case 'delete':
      return generateDeleteProcedureContent(naming, capitalizedOperation);
    default:
      return generateGenericProcedureContent(naming, capitalizedOperation, operation);
  }
};

const generateCreateProcedureContent = (
  naming: ModuleNaming,
  _capitalizedOperation: string
): string => {
  return `import { publicProcedure } from '../../../trpc';
import { payloadSchema } from '../validators/create.${naming.file}';
import create${naming.class}Handler from '../handlers/create.${naming.file}';
import { generateRequestId } from '../../../shared/utils/request.utils';

export const create${naming.class}Procedure = publicProcedure
  .input(payloadSchema)
  .mutation(async ({ input }) => {
    const requestId = generateRequestId();
    
    return await create${naming.class}Handler({
      ...input,
      requestId,
    });
  });
`;
};

const generateGetProcedureContent = (
  naming: ModuleNaming,
  _capitalizedOperation: string
): string => {
  return `import { publicProcedure } from '../../../trpc';
import { payloadSchema } from '../validators/get.${naming.file}';
import get${naming.class}Handler from '../handlers/get.${naming.file}';
import { generateRequestId } from '../../../shared/utils/request.utils';

export const get${naming.class}Procedure = publicProcedure
  .input(payloadSchema)
  .query(async ({ input }) => {
    const requestId = generateRequestId();
    
    return await get${naming.class}Handler({
      ...input,
      requestId,
    });
  });
`;
};

const generateListProcedureContent = (
  naming: ModuleNaming,
  _capitalizedOperation: string
): string => {
  return `import { publicProcedure } from '../../../trpc';
import { payloadSchema } from '../validators/list.${naming.file}';
import list${naming.class}sHandler from '../handlers/list.${naming.file}';
import { generateRequestId } from '../../../shared/utils/request.utils';

export const list${naming.class}sProcedure = publicProcedure
  .input(payloadSchema)
  .query(async ({ input }) => {
    const requestId = generateRequestId();
    
    return await list${naming.class}sHandler({
      ...input,
      requestId,
    });
  });
`;
};

const generateUpdateProcedureContent = (
  naming: ModuleNaming,
  _capitalizedOperation: string
): string => {
  return `import { publicProcedure } from '../../../trpc';
import { payloadSchema } from '../validators/update.${naming.file}';
import update${naming.class}Handler from '../handlers/update.${naming.file}';
import { generateRequestId } from '../../../shared/utils/request.utils';

export const update${naming.class}Procedure = publicProcedure
  .input(payloadSchema)
  .mutation(async ({ input }) => {
    const requestId = generateRequestId();
    
    return await update${naming.class}Handler({
      ...input,
      requestId,
    });
  });
`;
};

const generateDeleteProcedureContent = (
  naming: ModuleNaming,
  _capitalizedOperation: string
): string => {
  return `import { publicProcedure } from '../../../trpc';
import { payloadSchema } from '../validators/delete.${naming.file}';
import delete${naming.class}Handler from '../handlers/delete.${naming.file}';
import { generateRequestId } from '../../../shared/utils/request.utils';

export const delete${naming.class}Procedure = publicProcedure
  .input(payloadSchema)
  .mutation(async ({ input }) => {
    const requestId = generateRequestId();
    
    return await delete${naming.class}Handler({
      ...input,
      requestId,
    });
  });
`;
};

const generateGenericProcedureContent = (
  naming: ModuleNaming,
  _capitalizedOperation: string,
  operation: string
): string => {
  return `import { publicProcedure } from '../../../trpc';
import { payloadSchema } from '../validators/${operation}.${naming.file}';
import ${operation}${naming.class}Handler from '../handlers/${operation}.${naming.file}';
import { generateRequestId } from '../../../shared/utils/request.utils';

export const ${operation}${naming.class}Procedure = publicProcedure
  .input(payloadSchema)
  .mutation(async ({ input }) => {
    const requestId = generateRequestId();
    
    return await ${operation}${naming.class}Handler({
      ...input,
      requestId,
    });
  });
`;
};
