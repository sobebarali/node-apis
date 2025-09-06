/**
 * Typed CRUD service templates - generates services with actual field names from parsed types
 */

import { ParsedTypePayload, generateFieldDestructuring, generateFieldObject } from '../services/type-parser.service';

/**
 * Generates TypeScript service file content for CRUD operations with parsed types
 */
export const generateTypedCrudServiceContent = ({ 
  operation, 
  moduleName,
  parsedType
}: { 
  operation: string; 
  moduleName: string;
  parsedType: ParsedTypePayload;
}): string => {
  const capitalizedModule = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  const capitalizedOperation = operation.charAt(0).toUpperCase() + operation.slice(1);
  
  // Generate operation-specific service content
  switch (operation) {
    case 'create':
      return generateTypedCreateServiceContent(capitalizedModule, capitalizedOperation, moduleName, parsedType);
    case 'get':
      return generateTypedGetServiceContent(capitalizedModule, capitalizedOperation, moduleName, parsedType);
    case 'list':
      return generateTypedListServiceContent(capitalizedModule, capitalizedOperation, moduleName, parsedType);
    case 'update':
      return generateTypedUpdateServiceContent(capitalizedModule, capitalizedOperation, moduleName, parsedType);
    case 'delete':
      return generateTypedDeleteServiceContent(capitalizedModule, capitalizedOperation, moduleName, parsedType);
    default:
      return generateTypedGenericServiceContent(capitalizedModule, capitalizedOperation, operation, moduleName, parsedType);
  }
};

/**
 * Generates CREATE service content with parsed types
 */
const generateTypedCreateServiceContent = (
  _capitalizedModule: string, 
  _capitalizedOperation: string, 
  moduleName: string,
  parsedType: ParsedTypePayload
): string => {
  const fieldDestructuring = generateFieldDestructuring(parsedType.fields);
  const fieldObject = generateFieldObject(parsedType.fields);
  
  return `import { typePayload, typeResultData } from '../types/create.${moduleName}';
import * as ${moduleName}Repository from '../repository/${moduleName}.repository';

export const create${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} = async ({
${fieldDestructuring}
}: typePayload): Promise<typeResultData> => {
  return await ${moduleName}Repository.create({
${fieldObject}
  });
};
`;
};

/**
 * Generates GET service content with parsed types
 */
const generateTypedGetServiceContent = (
  _capitalizedModule: string, 
  _capitalizedOperation: string, 
  moduleName: string,
  parsedType: ParsedTypePayload
): string => {
  const fieldDestructuring = generateFieldDestructuring(parsedType.fields);
  
  return `import { typePayload, typeResultData, typeResultError } from '../types/get.${moduleName}';
import * as ${moduleName}Repository from '../repository/${moduleName}.repository';

export const get${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} = async ({
${fieldDestructuring}
}: typePayload): Promise<typeResultData | typeResultError> => {
  let result: typeResultData | typeResultError;

  try {
    const ${moduleName} = await ${moduleName}Repository.findById(id);
    result = ${moduleName};
  } catch (error) {
    if (error instanceof Error && error.name === 'NotFoundError') {
      result = {
        code: 'NOT_FOUND',
        message: \`${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} not found\`,
        statusCode: 404
      };
    } else {
      result = {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get ${moduleName}',
        statusCode: 500
      };
    }
  }

  return result;
};
`;
};

/**
 * Generates LIST service content with parsed types
 */
const generateTypedListServiceContent = (
  _capitalizedModule: string, 
  _capitalizedOperation: string, 
  moduleName: string,
  parsedType: ParsedTypePayload
): string => {
  const fieldDestructuring = generateFieldDestructuring(parsedType.fields);
  const fieldObject = generateFieldObject(parsedType.fields);
  
  return `import { typePayload, typeResultData, typeResultError } from '../types/list.${moduleName}';
import * as ${moduleName}Repository from '../repository/${moduleName}.repository';

export const list${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}s = async ({
${fieldDestructuring}
}: typePayload): Promise<typeResultData | typeResultError> => {
  let result: typeResultData | typeResultError;

  try {
    const data = await ${moduleName}Repository.findMany({
${fieldObject}
    });
    result = data;
  } catch (error) {
    result = {
      code: 'INTERNAL_ERROR',
      message: error instanceof Error ? error.message : 'Failed to list ${moduleName}s',
      statusCode: 500
    };
  }

  return result;
};
`;
};

/**
 * Generates UPDATE service content with parsed types
 */
const generateTypedUpdateServiceContent = (
  _capitalizedModule: string, 
  _capitalizedOperation: string, 
  moduleName: string,
  parsedType: ParsedTypePayload
): string => {
  const fieldDestructuring = generateFieldDestructuring(parsedType.fields);
  const fieldObject = generateFieldObject(parsedType.fields, ['id']); // Exclude id from update data
  
  return `import { typePayload, typeResult } from '../types/update.${moduleName}';
import * as ${moduleName}Repository from '../repository/${moduleName}.repository';

export const update${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} = async ({
${fieldDestructuring}
}: typePayload): Promise<typeResult> => {
  try {
    // TODO: Add business logic here (authorization, validation, etc.)
    // Example: await checkUserAccess(userId, id);
    
    const ${moduleName} = await ${moduleName}Repository.update(id, {
${fieldObject}
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
 * Generates DELETE service content with parsed types
 */
const generateTypedDeleteServiceContent = (
  _capitalizedModule: string, 
  _capitalizedOperation: string, 
  moduleName: string,
  parsedType: ParsedTypePayload
): string => {
  const fieldDestructuring = generateFieldDestructuring(parsedType.fields);
  
  return `import { typePayload, typeResult } from '../types/delete.${moduleName}';
import * as ${moduleName}Repository from '../repository/${moduleName}.repository';

export const delete${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} = async ({
${fieldDestructuring}
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
 * Generates generic service content with parsed types
 */
const generateTypedGenericServiceContent = (
  _capitalizedModule: string, 
  _capitalizedOperation: string, 
  operation: string, 
  moduleName: string,
  parsedType: ParsedTypePayload
): string => {
  const fieldDestructuring = generateFieldDestructuring(parsedType.fields);
  
  return `import { typePayload, typeResult } from '../types/${operation}.${moduleName}';
import * as ${moduleName}Repository from '../repository/${moduleName}.repository';

export const ${operation}${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} = async ({
${fieldDestructuring}
}: typePayload): Promise<typeResult> => {
  try {
    // TODO: Add business logic here
    // Example: const result = await ${moduleName}Repository.${operation}({
    //   // Pass your specific fields here
    // });

    const result = {}; // Replace with actual implementation

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
