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
  return `import { publicProcedure } from '@/lib/trpc';
import { payloadSchema } from '../validators/create.${naming.file}';
import create${naming.class}Handler from '../handlers/create.${naming.file}';
import type { typePayload } from '../types/create.${naming.file}';
import { randomBytes } from 'crypto';

export const create${naming.class}Procedure = publicProcedure
  .input(payloadSchema)
  .mutation(async ({ input }: { input: typePayload }) => {
    const requestId = randomBytes(16).toString('hex');
    
    try {
      return await create${naming.class}Handler({
        ...input,
        requestId,
      });
    } catch (error) {
      return {
        data: null,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Something went wrong',
          statusCode: 500,
          requestId
        }
      };
    }
  });
`;
};

const generateGetProcedureContent = (
  naming: ModuleNaming,
  _capitalizedOperation: string
): string => {
  return `import { publicProcedure } from '@/lib/trpc';
import { payloadSchema } from '../validators/get.${naming.file}';
import get${naming.class}Handler from '../handlers/get.${naming.file}';
import type { typePayload } from '../types/get.${naming.file}';
import { randomBytes } from 'crypto';

export const get${naming.class}Procedure = publicProcedure
  .input(payloadSchema)
  .query(async ({ input }: { input: typePayload }) => {
    const requestId = randomBytes(16).toString('hex');
    
    try {
      return await get${naming.class}Handler({
        ...input,
        requestId,
      });
    } catch (error) {
      return {
        data: null,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Something went wrong',
          statusCode: 500,
          requestId
        }
      };
    }
  });
`;
};

const generateListProcedureContent = (
  naming: ModuleNaming,
  _capitalizedOperation: string
): string => {
  return `import { publicProcedure } from '@/lib/trpc';
import { payloadSchema } from '../validators/list.${naming.file}';
import list${naming.class}sHandler from '../handlers/list.${naming.file}';
import type { typePayload } from '../types/list.${naming.file}';
import { randomBytes } from 'crypto';

export const list${naming.class}sProcedure = publicProcedure
  .input(payloadSchema)
  .query(async ({ input }: { input: typePayload }) => {
    const requestId = randomBytes(16).toString('hex');
    
    try {
      return await list${naming.class}sHandler({
        ...input,
        requestId,
      });
    } catch (error) {
      return {
        data: null,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Something went wrong',
          statusCode: 500,
          requestId
        }
      };
    }
  });
`;
};

const generateUpdateProcedureContent = (
  naming: ModuleNaming,
  _capitalizedOperation: string
): string => {
  return `import { publicProcedure } from '@/lib/trpc';
import { payloadSchema } from '../validators/update.${naming.file}';
import update${naming.class}Handler from '../handlers/update.${naming.file}';
import type { typePayload } from '../types/update.${naming.file}';
import { randomBytes } from 'crypto';

export const update${naming.class}Procedure = publicProcedure
  .input(payloadSchema)
  .mutation(async ({ input }: { input: typePayload }) => {
    const requestId = randomBytes(16).toString('hex');
    
    try {
      return await update${naming.class}Handler({
        ...input,
        requestId,
      });
    } catch (error) {
      return {
        data: null,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Something went wrong',
          statusCode: 500,
          requestId
        }
      };
    }
  });
`;
};

const generateDeleteProcedureContent = (
  naming: ModuleNaming,
  _capitalizedOperation: string
): string => {
  return `import { publicProcedure } from '@/lib/trpc';
import { payloadSchema } from '../validators/delete.${naming.file}';
import delete${naming.class}Handler from '../handlers/delete.${naming.file}';
import type { typePayload } from '../types/delete.${naming.file}';
import { randomBytes } from 'crypto';

export const delete${naming.class}Procedure = publicProcedure
  .input(payloadSchema)
  .mutation(async ({ input }: { input: typePayload }) => {
    const requestId = randomBytes(16).toString('hex');
    
    try {
      return await delete${naming.class}Handler({
        ...input,
        requestId,
      });
    } catch (error) {
      return {
        data: null,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Something went wrong',
          statusCode: 500,
          requestId
        }
      };
    }
  });
`;
};

const generateGenericProcedureContent = (
  naming: ModuleNaming,
  _capitalizedOperation: string,
  operation: string
): string => {
  return `import { publicProcedure } from '@/lib/trpc';
import { payloadSchema } from '../validators/${operation}.${naming.file}';
import ${operation}${naming.class}Handler from '../handlers/${operation}.${naming.file}';
import type { typePayload } from '../types/${operation}.${naming.file}';
import { randomBytes } from 'crypto';

export const ${operation}${naming.class}Procedure = publicProcedure
  .input(payloadSchema)
  .mutation(async ({ input }: { input: typePayload }) => {
    const requestId = randomBytes(16).toString('hex');
    
    try {
      return await ${operation}${naming.class}Handler({
        ...input,
        requestId,
      });
    } catch (error) {
      return {
        data: null,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Something went wrong',
          statusCode: 500,
          requestId
        }
      };
    }
  });
`;
};
