/**
 * Gets the list of CRUD controller file names for a module
 */
import { getModuleNaming, ModuleNaming } from '../shared/utils/naming.utils';

export const getCrudControllerFileNames = ({ moduleName }: { moduleName: string }): string[] => {
  const naming = getModuleNaming(moduleName);
  return [
    `create.${naming.file}.ts`,
    `get.${naming.file}.ts`,
    `list.${naming.file}.ts`,
    `delete.${naming.file}.ts`,
    `update.${naming.file}.ts`,
  ];
};

export const generateCrudControllerContent = ({
  operation,
  moduleName,
  framework = 'express',
}: {
  operation: string;
  moduleName: string;
  framework?: string;
}): string => {
  const naming = getModuleNaming(moduleName);
  const capitalizedOperation = operation.charAt(0).toUpperCase() + operation.slice(1);

  switch (operation) {
    case 'create':
      return generateCreateControllerContent(naming, capitalizedOperation, framework);
    case 'get':
      return generateGetControllerContent(naming, capitalizedOperation, framework);
    case 'list':
      return generateListControllerContent(naming, capitalizedOperation, framework);
    case 'update':
      return generateUpdateControllerContent(naming, capitalizedOperation, framework);
    case 'delete':
      return generateDeleteControllerContent(naming, capitalizedOperation, framework);
    default:
      return generateGenericControllerContent(naming, capitalizedOperation, operation, framework);
  }
};

const generateCreateControllerContent = (
  naming: ModuleNaming,
  _capitalizedOperation: string,
  framework: string = 'express'
): string => {
  if (framework === 'hono') {
    return `import type { Context } from 'hono';
import { validatePayload } from '../validators/create.${naming.file}';
import create${naming.class}Handler from '../handlers/create.${naming.file}';

export default async function create${naming.class}Controller(c: Context): Promise<Response> {
  try {
    const requestId = c.req.header('x-request-id') || \`req-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;

    const body = await c.req.json();

    console.info(\`\${requestId} [CONTROLLER] - CREATE ${naming.constant} payload:\`, JSON.stringify(body, null, 2));

    const validation = validatePayload(body);
    if (!validation.success) {
      return c.json({
        data: null,
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.error.message,
          statusCode: 400
        }
      }, 400);
    }

    const result = await create${naming.class}Handler({ ...validation.data, requestId });

    const statusCode = result.error ? result.error.statusCode : 201;
    return c.json(result, statusCode);
  } catch (error) {
    return c.json({
      data: null,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to process request',
        statusCode: 500
      }
    }, 500);
  }
}
`;
  }

  return `import type { Request, Response } from 'express';
import { validatePayload } from '../validators/create.${naming.file}';
import create${naming.class}Handler from '../handlers/create.${naming.file}';

export default async function create${naming.class}Controller(req: Request, res: Response): Promise<void> {
  const requestId = (req.headers['x-request-id'] as string) || \`req-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;

  console.info(\`\${requestId} [CONTROLLER] - CREATE ${naming.constant} payload:\`, JSON.stringify(req.body, null, 2));

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

  const result = await create${naming.class}Handler({ ...validation.data, requestId });

  const statusCode = result.error ? result.error.statusCode : 201;
  res.status(statusCode).json(result);
}
`;
};

/**
 * Generates GET controller content
 */
const generateGetControllerContent = (
  naming: ModuleNaming,
  _capitalizedOperation: string,
  framework: string = 'express'
): string => {
  if (framework === 'hono') {
    return `import type { Context } from 'hono';
import { validatePayload } from '../validators/get.${naming.file}';
import get${naming.class}Handler from '../handlers/get.${naming.file}';

export default async function get${naming.class}Controller(c: Context): Promise<Response> {
  try {
    const requestId = c.req.header('x-request-id') || \`req-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;

    const id = c.req.param('id');
    console.info(\`\${requestId} [CONTROLLER] - GET ${naming.constant} payload:\`, JSON.stringify({ id }, null, 2));

    const validation = validatePayload({ id });
    if (!validation.success) {
      return c.json({
        data: null,
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.error.message,
          statusCode: 400
        }
      }, 400);
    }

    const result = await get${naming.class}Handler({ ...validation.data, requestId });

    const statusCode = result.error ? result.error.statusCode : 200;
    return c.json(result, statusCode);
  } catch (error) {
    return c.json({
      data: null,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to process request',
        statusCode: 500
      }
    }, 500);
  }
}
`;
  }

  return `import type { Request, Response } from 'express';
import { validatePayload } from '../validators/get.${naming.file}';
import get${naming.class}Handler from '../handlers/get.${naming.file}';

export default async function get${naming.class}Controller(req: Request, res: Response): Promise<void> {
  const requestId = (req.headers['x-request-id'] as string) || \`req-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;

  console.info(\`\${requestId} [CONTROLLER] - GET ${naming.constant} payload:\`, JSON.stringify({ id: req.params.id }, null, 2));

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

  const result = await get${naming.class}Handler({ ...validation.data, requestId });

  const statusCode = result.error ? result.error.statusCode : 200;
  res.status(statusCode).json(result);
}
`;
};

/**
 * Generates LIST controller content
 */
const generateListControllerContent = (
  naming: ModuleNaming,
  _capitalizedOperation: string,
  framework: string = 'express'
): string => {
  if (framework === 'hono') {
    return `import type { Context } from 'hono';
import { validatePayload } from '../validators/list.${naming.file}';
import list${naming.class}sHandler from '../handlers/list.${naming.file}';

export default async function list${naming.class}sController(c: Context): Promise<Response> {
  try {
    const requestId = c.req.header('x-request-id') || \`req-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;

    const query = c.req.query();
    console.info(\`\${requestId} [CONTROLLER] - LIST ${naming.constant} payload:\`, JSON.stringify(query, null, 2));

    const validation = validatePayload(query);
    if (!validation.success) {
      return c.json({
        data: null,
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.error.message,
          statusCode: 400
        }
      }, 400);
    }

    const result = await list${naming.class}sHandler({ ...validation.data, requestId });

    const statusCode = result.error ? result.error.statusCode : 200;
    return c.json(result, statusCode);
  } catch (error) {
    return c.json({
      data: null,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to process request',
        statusCode: 500
      }
    }, 500);
  }
}
`;
  }

  return `import type { Request, Response } from 'express';
import { validatePayload } from '../validators/list.${naming.file}';
import list${naming.class}sHandler from '../handlers/list.${naming.file}';

export default async function list${naming.class}sController(req: Request, res: Response): Promise<void> {
  const requestId = (req.headers['x-request-id'] as string) || \`req-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;

  console.info(\`\${requestId} [CONTROLLER] - LIST ${naming.constant} payload:\`, JSON.stringify(req.query, null, 2));

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

  const result = await list${naming.class}sHandler({ ...validation.data, requestId });

  const statusCode = result.error ? result.error.statusCode : 200;
  res.status(statusCode).json(result);
}
`;
};

/**
 * Generates UPDATE controller content
 */
const generateUpdateControllerContent = (
  naming: ModuleNaming,
  _capitalizedOperation: string,
  framework: string = 'express'
): string => {
  if (framework === 'hono') {
    return `import type { Context } from 'hono';
import { validatePayload } from '../validators/update.${naming.file}';
import update${naming.class}Handler from '../handlers/update.${naming.file}';

export default async function update${naming.class}Controller(c: Context): Promise<Response> {
  try {
    const requestId = c.req.header('x-request-id') || \`req-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;

    const id = c.req.param('id');
    const body = await c.req.json();
    const payload = { id, ...body };

    console.info(\`\${requestId} [CONTROLLER] - UPDATE ${naming.constant} payload:\`, JSON.stringify(payload, null, 2));

    const validation = validatePayload(payload);
    if (!validation.success) {
      return c.json({
        data: null,
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.error.message,
          statusCode: 400
        }
      }, 400);
    }

    const result = await update${naming.class}Handler({ ...validation.data, requestId });

    const statusCode = result.error ? result.error.statusCode : 200;
    return c.json(result, statusCode);
  } catch (error) {
    return c.json({
      data: null,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to process request',
        statusCode: 500
      }
    }, 500);
  }
}
`;
  }

  return `import type { Request, Response } from 'express';
import { validatePayload } from '../validators/update.${naming.file}';
import update${naming.class}Handler from '../handlers/update.${naming.file}';

export default async function update${naming.class}Controller(req: Request, res: Response): Promise<void> {
  const requestId = (req.headers['x-request-id'] as string) || \`req-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;

  console.info(\`\${requestId} [CONTROLLER] - UPDATE ${naming.constant} payload:\`, JSON.stringify({ id: req.params.id, ...req.body }, null, 2));

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

  const result = await update${naming.class}Handler({ ...validation.data, requestId });

  const statusCode = result.error ? result.error.statusCode : 200;
  res.status(statusCode).json(result);
}
`;
};

/**
 * Generates DELETE controller content
 */
const generateDeleteControllerContent = (
  naming: ModuleNaming,
  _capitalizedOperation: string,
  framework: string = 'express'
): string => {
  if (framework === 'hono') {
    return `import type { Context } from 'hono';
import { validatePayload } from '../validators/delete.${naming.file}';
import delete${naming.class}Handler from '../handlers/delete.${naming.file}';

export default async function delete${naming.class}Controller(c: Context): Promise<Response> {
  try {
    const requestId = c.req.header('x-request-id') || \`req-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;

    const id = c.req.param('id');
    const body = await c.req.json().catch(() => ({})); // DELETE might not have body
    const payload = { id, ...body };

    console.info(\`\${requestId} [CONTROLLER] - DELETE ${naming.constant} payload:\`, JSON.stringify(payload, null, 2));

    const validation = validatePayload(payload);
    if (!validation.success) {
      return c.json({
        data: null,
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.error.message,
          statusCode: 400
        }
      }, 400);
    }

    const result = await delete${naming.class}Handler({ ...validation.data, requestId });

    const statusCode = result.error ? result.error.statusCode : 200;
    return c.json(result, statusCode);
  } catch (error) {
    return c.json({
      data: null,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to process request',
        statusCode: 500
      }
    }, 500);
  }
}
`;
  }

  return `import type { Request, Response } from 'express';
import { validatePayload } from '../validators/delete.${naming.file}';
import delete${naming.class}Handler from '../handlers/delete.${naming.file}';

export default async function delete${naming.class}Controller(req: Request, res: Response): Promise<void> {
  const requestId = (req.headers['x-request-id'] as string) || \`req-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;

  console.info(\`\${requestId} [CONTROLLER] - DELETE ${naming.constant} payload:\`, JSON.stringify({ id: req.params.id, ...req.body }, null, 2));

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

  const result = await delete${naming.class}Handler({ ...validation.data, requestId });

  const statusCode = result.error ? result.error.statusCode : 200;
  res.status(statusCode).json(result);
}
`;
};

/**
 * Generates generic controller content (fallback)
 */
const generateGenericControllerContent = (
  naming: ModuleNaming,
  _capitalizedOperation: string,
  operation: string,
  framework: string = 'express'
): string => {
  if (framework === 'hono') {
    return `import type { Context } from 'hono';
import { typeResult } from '../types/${operation}.${naming.file}';
import { validatePayload } from '../validators/${operation}.${naming.file}';
import { randomBytes } from 'crypto';
import ${operation}${naming.class}Handler from '../handlers/${operation}.${naming.file}';

export const ${operation}${naming.class} = async (c: Context): Promise<Response> => {
  const requestId = randomBytes(16).toString('hex');
  
  try {
    const body = await c.req.json();
    const validation = validatePayload(body);
    if (!validation.success) {
      return c.json({
        data: null,
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.error.message,
          statusCode: 400,
          requestId
        }
      }, 400);
    }

    const payload = validation.data;

    // Call handler with requestId
    const result = await ${operation}${naming.class}Handler({ ...payload, requestId });

    const statusCode = result.error ? result.error.statusCode || 500 : 200;
    return c.json(result, statusCode);
  } catch (error) {
    return c.json({
      data: null,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Something went wrong',
        statusCode: 500,
        requestId
      }
    }, 500);
  }
};
`;
  }

  return `import type { Request, Response } from 'express';
import { typeResult } from '../types/${operation}.${naming.file}';
import { validatePayload } from '../validators/${operation}.${naming.file}';
import { randomBytes } from 'crypto';
import ${operation}${naming.class}Handler from '../handlers/${operation}.${naming.file}';

export const ${operation}${naming.class} = async (req: Request, res: Response): Promise<void> => {
  const requestId = randomBytes(16).toString('hex');
  
  try {
    const validation = validatePayload(req.body);
    if (!validation.success) {
      res.status(400).json({
        data: null,
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.error.message,
          statusCode: 400,
          requestId
        }
      });
      return;
    }

    const payload = validation.data;

    // Call handler with requestId
    const result = await ${operation}${naming.class}Handler({ ...payload, requestId });

    const statusCode = result.error ? result.error.statusCode || 500 : 200;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({
      data: null,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Something went wrong',
        statusCode: 500,
        requestId
      }
    });
  }
};
`;
};
