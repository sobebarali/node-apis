/**
 * T3 router templates
 */

import { getModuleNaming } from '../shared/naming.utils';

export const generateRouteContent = ({ moduleName }: { moduleName: string; apiType?: any }): string => {
  const naming = getModuleNaming(moduleName);

  // For T3, we return an empty string because T3 uses a different structure (routers)
  // Routers are generated separately in the T3-specific way
  return `// T3 Router for ${naming.class} - actual router generation handled separately
// This file is a placeholder to maintain consistent interface with other frameworks
// The actual T3 router is generated in a different location with a different structure
`;
};

export const generateT3RouterContent = ({ moduleName }: { moduleName: string }): string => {
  const naming = getModuleNaming(moduleName);

  return `import { router } from '../trpc';
import { create${naming.class}, get${naming.class}, list${naming.class}s, update${naming.class}, delete${naming.class} } from './${naming.file}.procedures';

export const ${naming.variable}Router = router({
  create: create${naming.class},
  get: get${naming.class},
  list: list${naming.class}s,
  update: update${naming.class},
  delete: delete${naming.class},
});

export default ${naming.variable}Router;
`;
};

export const getRouterFileName = ({ moduleName }: { moduleName: string }): string => {
  const naming = getModuleNaming(moduleName);
  return `${naming.file}.router.ts`;
};