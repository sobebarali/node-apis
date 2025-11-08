import { getModuleNaming, ModuleNaming } from '../../shared/naming.utils';
import { ApiType } from '../../../types/common.types';

export const generateRouteContent = (
  { moduleName, apiType }: { moduleName: string; apiType: ApiType }
): string => {
  const naming = getModuleNaming(moduleName);
  
  if (apiType.type === 'custom' && apiType.customNames) {
    return generateCustomRouteContent(naming, apiType.customNames);
  } else {
    // Fallback for non-custom types
    return generateGenericRouteContent(naming);
  }
};

export const generateCustomRouteContent = (
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
): string => {
  return `import { Router } from 'express';

const router = Router();

// TODO: Add your ${naming.variable} routes here
// Example:
// import { create${naming.class} } from './controllers/create.${naming.file}';
// router.post('/', create${naming.class});

export default router;
`;
};