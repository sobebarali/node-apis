import { ApiType } from '../../../types/common.types';
import { getModuleNaming, ModuleNaming } from '../../shared/naming.utils';

export const generateRouteContent = ({
  moduleName,
  apiType,
}: {
  moduleName: string;
  apiType: ApiType;
}): string => {
  const naming = getModuleNaming(moduleName);

  if (apiType.type === 'crud') {
    return generateCrudRouteContent(naming);
  } else if (apiType.type === 'custom' && apiType.customNames) {
    return generateCustomRouteContent(naming, apiType.customNames);
  }

  return generateGenericRouteContent(naming);
};

const generateCrudRouteContent = (naming: ModuleNaming): string => {
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
};

/**
 * Generates custom route content
 */
const generateCustomRouteContent = (
  naming: ModuleNaming,
  customNames: string[],
): string => {
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
};

/**
 * Generates generic route content
 */
const generateGenericRouteContent = (
  naming: ModuleNaming,
): string => {
  return `import { Hono } from 'hono';

const app = new Hono();

// TODO: Add your ${naming.variable} routes here
// Example:
// import { create${naming.class} } from './controllers/create.${naming.file}';
// app.post('/', create${naming.class});

export default app;
`;
};