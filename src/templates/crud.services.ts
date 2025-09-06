/**
 * CRUD service templates
 */

/**
 * Gets the list of CRUD service file names for a module
 */
export const getCrudServiceFileNames = ({ moduleName }: { moduleName: string }): string[] => {
  return [
    `create.${moduleName}.ts`,
    `get.${moduleName}.ts`,
    `list.${moduleName}.ts`,
    `delete.${moduleName}.ts`,
    `update.${moduleName}.ts`
  ];
};

/**
 * Generates TypeScript service file content for CRUD operations
 */
export const generateCrudServiceContent = ({ 
  operation, 
  moduleName 
}: { 
  operation: string; 
  moduleName: string; 
}): string => {
  const capitalizedModule = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  const capitalizedOperation = operation.charAt(0).toUpperCase() + operation.slice(1);
  
  // Generate operation-specific service content
  switch (operation) {
    case 'create':
      return generateCreateServiceContent(capitalizedModule, capitalizedOperation, moduleName);
    case 'get':
      return generateGetServiceContent(capitalizedModule, capitalizedOperation, moduleName);
    case 'list':
      return generateListServiceContent(capitalizedModule, capitalizedOperation, moduleName);
    case 'update':
      return generateUpdateServiceContent(capitalizedModule, capitalizedOperation, moduleName);
    case 'delete':
      return generateDeleteServiceContent(capitalizedModule, capitalizedOperation, moduleName);
    default:
      return generateGenericServiceContent(capitalizedModule, capitalizedOperation, operation, moduleName);
  }
};

/**
 * Generates CREATE service content
 */
const generateCreateServiceContent = (_capitalizedModule: string, _capitalizedOperation: string, moduleName: string): string => {
  return `import { typePayload, typeResult } from '../types/create.${moduleName}';
import * as ${moduleName}Repository from '../repository/${moduleName}.repository';

export const create${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} = async ({
  // TODO: Add your specific fields here, e.g.:
  // name,
  // description,
}: typePayload): Promise<typeResult> => {
  try {
    // TODO: Add business logic here (validation, authorization, etc.)
    // Example: const userId = getCurrentUserId();

    const ${moduleName} = await ${moduleName}Repository.create({
      // TODO: Pass your specific fields here, e.g.:
      // name,
      // description,
    });

    return { data: ${moduleName}, error: null };
  } catch (error) {
    return {
      data: null,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Failed to create ${moduleName}',
        statusCode: 500
      }
    };
  }
};
`;
};

/**
 * Generates GET service content
 */
const generateGetServiceContent = (_capitalizedModule: string, _capitalizedOperation: string, moduleName: string): string => {
  return `import { typePayload, typeResult } from '../types/get.${moduleName}';
import * as ${moduleName}Repository from '../repository/${moduleName}.repository';

export const get${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} = async ({
  id,
  // TODO: Add any additional fields if needed
}: typePayload): Promise<typeResult> => {
  try {
    // TODO: Add business logic here (authorization, etc.)
    // Example: await checkUserAccess(userId, id);
    const ${moduleName} = await ${moduleName}Repository.findById(id);

    return { data: ${moduleName}, error: null };
  } catch (error) {
    if (error instanceof Error && error.name === 'NotFoundError') {
      return {
        data: null,
        error: {
          code: 'NOT_FOUND',
          message: \`${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} not found\`,
          statusCode: 404
        }
      };
    }

    return {
      data: null,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get ${moduleName}',
        statusCode: 500
      }
    };
  }
};
`;
};

/**
 * Generates LIST service content
 */
const generateListServiceContent = (_capitalizedModule: string, _capitalizedOperation: string, moduleName: string): string => {
  return `import { typePayload, typeResult } from '../types/list.${moduleName}';
import * as ${moduleName}Repository from '../repository/${moduleName}.repository';

export const list${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}s = async ({
  page,
  limit,
  sort_by,
  sort_order,
  search,
  // TODO: Add any additional filter fields here
}: typePayload): Promise<typeResult> => {
  try {
    // TODO: Add business logic here (authorization, filtering, etc.)
    // Example: const userId = getCurrentUserId();

    const result = await ${moduleName}Repository.findMany({
      page,
      limit,
      sort_by,
      sort_order,
      search,
      // TODO: Add any additional filter fields here
    });

    return { data: result, error: null };
  } catch (error) {
    return {
      data: null,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Failed to list ${moduleName}s',
        statusCode: 500
      }
    };
  }
};
`;
};

/**
 * Generates UPDATE service content
 */
const generateUpdateServiceContent = (_capitalizedModule: string, _capitalizedOperation: string, moduleName: string): string => {
  return `import { typePayload, typeResult } from '../types/update.${moduleName}';
import * as ${moduleName}Repository from '../repository/${moduleName}.repository';

export const update${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} = async ({
  id,
  // TODO: Add your updatable fields here, e.g.:
  // name,
  // description,
}: typePayload): Promise<typeResult> => {
  try {
    // TODO: Add business logic here (authorization, validation, etc.)
    // Example: await checkUserAccess(userId, id);
    const ${moduleName} = await ${moduleName}Repository.update(id, {
      // TODO: Pass your updatable fields here, e.g.:
      // name,
      // description,
    });

    return { data: ${moduleName}, error: null };
  } catch (error) {
    if (error instanceof Error && error.name === 'NotFoundError') {
      return {
        data: null,
        error: {
          code: 'NOT_FOUND',
          message: \`${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} not found\`,
          statusCode: 404
        }
      };
    }

    return {
      data: null,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Failed to update ${moduleName}',
        statusCode: 500
      }
    };
  }
};
`;
};

/**
 * Generates DELETE service content
 */
const generateDeleteServiceContent = (_capitalizedModule: string, _capitalizedOperation: string, moduleName: string): string => {
  return `import { typePayload, typeResult } from '../types/delete.${moduleName}';
import * as ${moduleName}Repository from '../repository/${moduleName}.repository';

export const delete${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} = async ({
  id,
  permanent = false,
  // TODO: Add any additional fields if needed
}: typePayload): Promise<typeResult> => {
  try {
    // TODO: Add business logic here (authorization, etc.)
    // Example: await checkUserAccess(userId, id);
    const result = await ${moduleName}Repository.delete(id, permanent);

    return { data: result, error: null };
  } catch (error) {
    if (error instanceof Error && error.name === 'NotFoundError') {
      return {
        data: null,
        error: {
          code: 'NOT_FOUND',
          message: \`${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} not found\`,
          statusCode: 404
        }
      };
    }

    return {
      data: null,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Failed to delete ${moduleName}',
        statusCode: 500
      }
    };
  }
};
`;
};

/**
 * Generates generic service content (fallback)
 */
const generateGenericServiceContent = (_capitalizedModule: string, _capitalizedOperation: string, operation: string, moduleName: string): string => {
  return `import { typePayload, typeResult } from '../types/${operation}.${moduleName}';
import * as ${moduleName}Repository from '../repository/${moduleName}.repository';

export const ${operation}${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} = async ({
  // TODO: Add your specific fields here based on your typePayload interface
}: typePayload): Promise<typeResult> => {
  try {
    // TODO: Add business logic here
    // Example: const result = await ${moduleName}Repository.${operation}({
    //   // Pass your specific fields here
    // });

    const result = {}; // Replace with actual repository call

    return { data: result, error: null };
  } catch (error) {
    return {
      data: null,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Failed to ${operation} ${moduleName}',
        statusCode: 500
      }
    };
  }
};
`;
};
