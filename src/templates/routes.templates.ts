import { ApiType } from '../types/common.types';
import { getModuleNaming, ModuleNaming } from '../shared/utils/naming.utils';

export const generateRouteContent = ({
  moduleName,
  apiType,
  framework = 'express',
}: {
  moduleName: string;
  apiType: ApiType;
  framework?: string;
}): string => {
  const naming = getModuleNaming(moduleName);

  if (apiType.type === 'crud') {
    return generateCrudRouteContent(naming, framework);
  } else if (apiType.type === 'custom' && apiType.customNames) {
    return generateCustomRouteContent(naming, apiType.customNames, framework);
  }

  return generateGenericRouteContent(naming, framework);
};

const generateCrudRouteContent = (naming: ModuleNaming, framework: string = 'express'): string => {
  if (framework === 't3') {
    // For T3, we don't generate routes - we generate routers instead
    return '';
  }
  
  if (framework === 'hono') {
    return `import { Hono } from 'hono';
import create${naming.class}Controller from './controllers/create.${naming.file}';
import get${naming.class}Controller from './controllers/get.${naming.file}';
import list${naming.class}sController from './controllers/list.${naming.file}';
import update${naming.class}Controller from './controllers/update.${naming.file}';
import delete${naming.class}Controller from './controllers/delete.${naming.file}';

const app = new Hono();

app.post('/', create${naming.class}Controller);
app.get('/', list${naming.class}sController);
app.get('/:id', get${naming.class}Controller);
app.put('/:id', update${naming.class}Controller);
app.delete('/:id', delete${naming.class}Controller);

export default app;
`;
  }

  // Default to Express
  return `import { Router } from 'express';
import create${naming.class}Controller from './controllers/create.${naming.file}';
import get${naming.class}Controller from './controllers/get.${naming.file}';
import list${naming.class}sController from './controllers/list.${naming.file}';
import update${naming.class}Controller from './controllers/update.${naming.file}';
import delete${naming.class}Controller from './controllers/delete.${naming.file}';

const router = Router();

// CRUD Routes
router.post('/', create${naming.class}Controller);
router.get('/', list${naming.class}sController);
router.get('/:id', get${naming.class}Controller);
router.put('/:id', update${naming.class}Controller);
router.delete('/:id', delete${naming.class}Controller);

export default router;
`;
};

/**
 * Generates custom route content
 */
const generateCustomRouteContent = (
  naming: ModuleNaming,
  customNames: string[],
  framework: string = 'express'
): string => {
  if (framework === 't3') {
    // For T3, we don't generate routes - we generate routers instead
    return '';
  }
  
  if (framework === 'hono') {
    const imports = customNames
      .map(
        customName =>
          `import { ${customName}${naming.class} } from './controllers/${customName}.${naming.file}';`
      )
      .join('\n');

    const routes = customNames
      .map(
        customName =>
          `app.post('/${customName}', ${customName}${naming.class});    // POST /api/${naming.url}s/${customName}`
      )
      .join('\n');

    return `import { Hono } from 'hono';
${imports}

const app = new Hono();

// Custom Routes
${routes}

export default app;
`;
  }

  const imports = customNames
    .map(
      customName =>
        `import { ${customName}${naming.class} } from './controllers/${customName}.${naming.file}';`
    )
    .join('\n');

  const routes = customNames
    .map(
      customName =>
        `router.post('/${customName}', ${customName}${naming.class});    // POST /api/${naming.url}s/${customName}`
    )
    .join('\n');

  return `import { Router } from 'express';
${imports}

const router = Router();

// Custom Routes
${routes}

export default router;
`;
};

/**
 * Generates generic route content
 */
const generateGenericRouteContent = (
  naming: ModuleNaming,
  framework: string = 'express'
): string => {
  if (framework === 't3') {
    // For T3, we don't generate routes - we generate routers instead
    return '';
  }
  
  if (framework === 'hono') {
    return `import { Hono } from 'hono';

const app = new Hono();

// TODO: Add your ${naming.variable} routes here
// Example:
// import { create${naming.class} } from './controllers/create.${naming.file}';
// app.post('/', create${naming.class});

export default app;
`;
  }

  return `import { Router } from 'express';

const router = Router();

// TODO: Add your ${naming.variable} routes here
// Example:
// import { create${naming.class} } from './controllers/create.${naming.file}';
// router.post('/', create${naming.class});

export default router;
`;
};
