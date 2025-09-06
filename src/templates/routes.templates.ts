/**
 * Route templates
 */

import { ApiType } from '../types/common.types';

/**
 * Generates route file content for a module
 */
export const generateRouteContent = ({ 
  moduleName, 
  apiType 
}: { 
  moduleName: string; 
  apiType: ApiType; 
}): string => {
  const capitalizedModule = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  
  if (apiType.type === 'crud') {
    return generateCrudRouteContent(moduleName, capitalizedModule);
  } else if (apiType.type === 'custom' && apiType.customNames) {
    return generateCustomRouteContent(moduleName, capitalizedModule, apiType.customNames);
  }
  
  return generateGenericRouteContent(moduleName, capitalizedModule);
};

/**
 * Generates CRUD route content
 */
const generateCrudRouteContent = (moduleName: string, capitalizedModule: string): string => {
  return `import { Router } from 'express';
import create${capitalizedModule}Controller from './controllers/create.${moduleName}';
import get${capitalizedModule}Controller from './controllers/get.${moduleName}';
import list${capitalizedModule}sController from './controllers/list.${moduleName}';
import update${capitalizedModule}Controller from './controllers/update.${moduleName}';
import delete${capitalizedModule}Controller from './controllers/delete.${moduleName}';

const router = Router();

// CRUD Routes
router.post('/', create${capitalizedModule}Controller);           // POST /api/${moduleName}s
router.get('/', list${capitalizedModule}sController);             // GET /api/${moduleName}s
router.get('/:id', get${capitalizedModule}Controller);            // GET /api/${moduleName}s/:id
router.put('/:id', update${capitalizedModule}Controller);         // PUT /api/${moduleName}s/:id
router.delete('/:id', delete${capitalizedModule}Controller);      // DELETE /api/${moduleName}s/:id

export default router;
`;
};

/**
 * Generates custom route content
 */
const generateCustomRouteContent = (moduleName: string, capitalizedModule: string, customNames: string[]): string => {
  const imports = customNames
    .map(customName => `import { ${customName}${capitalizedModule} } from './controllers/${customName}.${moduleName}';`)
    .join('\n');
  
  const routes = customNames
    .map(customName => `router.post('/${customName}', ${customName}${capitalizedModule});    // POST /api/${moduleName}s/${customName}`)
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
const generateGenericRouteContent = (moduleName: string, capitalizedModule: string): string => {
  return `import { Router } from 'express';

const router = Router();

// TODO: Add your ${moduleName} routes here
// Example:
// import { create${capitalizedModule} } from './controllers/create.${moduleName}';
// router.post('/', create${capitalizedModule});

export default router;
`;
};
