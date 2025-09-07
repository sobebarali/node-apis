/**
 * CRUD controller templates
 */

/**
 * Gets the list of CRUD controller file names for a module
 */
export const getCrudControllerFileNames = ({ moduleName }: { moduleName: string }): string[] => {
  return [
    `create.${moduleName}.ts`,
    `get.${moduleName}.ts`,
    `list.${moduleName}.ts`,
    `delete.${moduleName}.ts`,
    `update.${moduleName}.ts`,
  ];
};

/**
 * Generates TypeScript controller file content for CRUD operations
 */
export const generateCrudControllerContent = ({
  operation,
  moduleName,
}: {
  operation: string;
  moduleName: string;
}): string => {
  const capitalizedModule = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  const capitalizedOperation = operation.charAt(0).toUpperCase() + operation.slice(1);

  // Generate operation-specific controller content
  switch (operation) {
    case 'create':
      return generateCreateControllerContent(capitalizedModule, capitalizedOperation, moduleName);
    case 'get':
      return generateGetControllerContent(capitalizedModule, capitalizedOperation, moduleName);
    case 'list':
      return generateListControllerContent(capitalizedModule, capitalizedOperation, moduleName);
    case 'update':
      return generateUpdateControllerContent(capitalizedModule, capitalizedOperation, moduleName);
    case 'delete':
      return generateDeleteControllerContent(capitalizedModule, capitalizedOperation, moduleName);
    default:
      return generateGenericControllerContent(
        capitalizedModule,
        capitalizedOperation,
        operation,
        moduleName
      );
  }
};

/**
 * Generates CREATE controller content
 */
const generateCreateControllerContent = (
  _capitalizedModule: string,
  _capitalizedOperation: string,
  moduleName: string
): string => {
  return `import { Request, Response } from 'express';
import { validatePayload } from '../validators/create.${moduleName}';
import create${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Handler from '../handlers/create.${moduleName}';

export default async function create${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Controller(req: Request, res: Response): Promise<void> {
  const requestId = (req.headers['x-request-id'] as string) || \`req-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;

  // Log complete payload for debugging
  console.info(\`\${requestId} [CONTROLLER] - CREATE ${moduleName.toUpperCase()} payload:\`, JSON.stringify(req.body, null, 2));

  // Validate request payload
  const validation = validatePayload(req.body);
  if (!validation.success) {
    res.status(400).json({
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: validation.error.message,
        statusCode: 400
      }
    });
    return;
  }

  // Call handler (contains business logic)
  const result = await create${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Handler(validation.data, requestId);

  // Return handler result
  const statusCode = result.error ? result.error.statusCode : 201;
  res.status(statusCode).json(result);
}
`;
};

/**
 * Generates GET controller content
 */
const generateGetControllerContent = (
  _capitalizedModule: string,
  _capitalizedOperation: string,
  moduleName: string
): string => {
  return `import { Request, Response } from 'express';
import { validatePayload } from '../validators/get.${moduleName}';
import get${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Handler from '../handlers/get.${moduleName}';

export default async function get${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Controller(req: Request, res: Response): Promise<void> {
  const requestId = (req.headers['x-request-id'] as string) || \`req-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;

  // Log complete payload for debugging
  console.info(\`\${requestId} [CONTROLLER] - GET ${moduleName.toUpperCase()} payload:\`, JSON.stringify({ id: req.params.id }, null, 2));

  // Validate request payload (ID from params)
  const validation = validatePayload({ id: req.params.id });
  if (!validation.success) {
    res.status(400).json({
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: validation.error.message,
        statusCode: 400
      }
    });
    return;
  }

  // Call handler (contains business logic)
  const result = await get${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Handler(validation.data, requestId);

  // Return handler result
  const statusCode = result.error ? result.error.statusCode : 200;
  res.status(statusCode).json(result);
}
`;
};

/**
 * Generates LIST controller content
 */
const generateListControllerContent = (
  _capitalizedModule: string,
  _capitalizedOperation: string,
  moduleName: string
): string => {
  return `import { Request, Response } from 'express';
import { validatePayload } from '../validators/list.${moduleName}';
import list${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}sHandler from '../handlers/list.${moduleName}';

export default async function list${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}sController(req: Request, res: Response): Promise<void> {
  const requestId = (req.headers['x-request-id'] as string) || \`req-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;

  // Log complete payload for debugging
  console.info(\`\${requestId} [CONTROLLER] - LIST ${moduleName.toUpperCase()} payload:\`, JSON.stringify(req.query, null, 2));

  // Validate query parameters
  const validation = validatePayload(req.query);
  if (!validation.success) {
    res.status(400).json({
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: validation.error.message,
        statusCode: 400
      }
    });
    return;
  }

  // Call handler (contains business logic)
  const result = await list${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}sHandler(validation.data, requestId);

  // Return handler result
  const statusCode = result.error ? result.error.statusCode : 200;
  res.status(statusCode).json(result);
}
`;
};

/**
 * Generates UPDATE controller content
 */
const generateUpdateControllerContent = (
  _capitalizedModule: string,
  _capitalizedOperation: string,
  moduleName: string
): string => {
  return `import { Request, Response } from 'express';
import { validatePayload } from '../validators/update.${moduleName}';
import update${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Handler from '../handlers/update.${moduleName}';

export default async function update${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Controller(req: Request, res: Response): Promise<void> {
  const requestId = (req.headers['x-request-id'] as string) || \`req-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;

  // Log complete payload for debugging
  console.info(\`\${requestId} [CONTROLLER] - UPDATE ${moduleName.toUpperCase()} payload:\`, JSON.stringify({ id: req.params.id, ...req.body }, null, 2));

  // Validate request payload (ID from params + body data)
  const validation = validatePayload({ id: req.params.id, ...req.body });
  if (!validation.success) {
    res.status(400).json({
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: validation.error.message,
        statusCode: 400
      }
    });
    return;
  }

  // Call handler (contains business logic)
  const result = await update${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Handler(validation.data, requestId);

  // Return handler result
  const statusCode = result.error ? result.error.statusCode : 200;
  res.status(statusCode).json(result);
}
`;
};

/**
 * Generates DELETE controller content
 */
const generateDeleteControllerContent = (
  _capitalizedModule: string,
  _capitalizedOperation: string,
  moduleName: string
): string => {
  return `import { Request, Response } from 'express';
import { validatePayload } from '../validators/delete.${moduleName}';
import delete${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Handler from '../handlers/delete.${moduleName}';

export default async function delete${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Controller(req: Request, res: Response): Promise<void> {
  const requestId = (req.headers['x-request-id'] as string) || \`req-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;

  // Log complete payload for debugging
  console.info(\`\${requestId} [CONTROLLER] - DELETE ${moduleName.toUpperCase()} payload:\`, JSON.stringify({ id: req.params.id, ...req.body }, null, 2));

  // Validate request payload (ID from params + optional body data)
  const validation = validatePayload({ id: req.params.id, ...req.body });
  if (!validation.success) {
    res.status(400).json({
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: validation.error.message,
        statusCode: 400
      }
    });
    return;
  }

  // Call handler (contains business logic)
  const result = await delete${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Handler(validation.data, requestId);

  // Return handler result
  const statusCode = result.error ? result.error.statusCode : 200;
  res.status(statusCode).json(result);
}
`;
};

/**
 * Generates generic controller content (fallback)
 */
const generateGenericControllerContent = (
  _capitalizedModule: string,
  _capitalizedOperation: string,
  operation: string,
  moduleName: string
): string => {
  return `import { Request, Response } from 'express';
import { typeResult } from '../types/${operation}.${moduleName}';
import { validatePayload } from '../validators/${operation}.${moduleName}';

export const ${operation}${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request payload
    const validation = validatePayload(req.body);
    if (!validation.success) {
      res.status(400).json({
        data: null,
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.error.message,
          statusCode: 400
        }
      });
      return;
    }

    const payload = validation.data;

    // TODO: Implement your business logic here
    // Example: const result = await ${moduleName}Service.${operation}(payload);

    // Mock response - replace with actual implementation
    const result: typeResult = {
      data: {
        // Add your result data here
      },
      error: null
    };

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      data: null,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Something went wrong',
        statusCode: 500
      }
    });
  }
};
`;
};
