/**
 * tRPC router template for generating module routers
 */
import { getModuleNaming } from '../shared/utils/naming.utils';

export const generateTrpcRouterContent = ({
  moduleName,
  operations = ['create', 'get', 'list', 'update', 'delete'],
}: {
  moduleName: string;
  operations?: string[];
}): string => {
  const naming = getModuleNaming(moduleName);
  
  // Generate imports for each operation
  const procedureImports = operations
    .map(operation => {
      // const capitalizedOperation = operation.charAt(0).toUpperCase() + operation.slice(1);
      const procedureName = operation === 'list' 
        ? `list${naming.class}sProcedure` 
        : `${operation}${naming.class}Procedure`;
      
      return `import { ${procedureName} } from './procedures/${operation}.${naming.file}';`;
    })
    .join('\n');

  // Generate router object properties
  const routerProperties = operations
    .map(operation => {
      // const capitalizedOperation = operation.charAt(0).toUpperCase() + operation.slice(1);
      const procedureName = operation === 'list' 
        ? `list${naming.class}sProcedure` 
        : `${operation}${naming.class}Procedure`;
      
      return `  ${operation}: ${procedureName},`;
    })
    .join('\n');

  return `import { router } from '@/lib/trpc';
${procedureImports}

export const ${naming.variable}Router = router({
${routerProperties}
});

export type ${naming.class}Router = typeof ${naming.variable}Router;
`;
};

export const generateCustomTrpcRouterContent = ({
  moduleName,
  operations,
}: {
  moduleName: string;
  operations: string[];
}): string => {
  const naming = getModuleNaming(moduleName);
  
  // Generate imports for each custom operation
  const procedureImports = operations
    .map(operation => {
      // const capitalizedOperation = operation.charAt(0).toUpperCase() + operation.slice(1);
      const procedureName = `${operation}${naming.class}Procedure`;
      
      return `import { ${procedureName} } from './procedures/${operation}.${naming.file}';`;
    })
    .join('\n');

  // Generate router object properties
  const routerProperties = operations
    .map(operation => {
      const procedureName = `${operation}${naming.class}Procedure`;
      return `  ${operation}: ${procedureName},`;
    })
    .join('\n');

  return `import { router } from '../../trpc';
${procedureImports}

export const ${naming.variable}Router = router({
${routerProperties}
});

export type ${naming.class}Router = typeof ${naming.variable}Router;
`;
};

export const generateServicesTrpcRouterContent = ({
  moduleName,
  operations,
}: {
  moduleName: string;
  operations: string[];
}): string => {
  const naming = getModuleNaming(moduleName);
  
  // Generate imports for each service operation
  const procedureImports = operations
    .map(operation => {
      // const capitalizedOperation = operation.charAt(0).toUpperCase() + operation.slice(1);
      const procedureName = `${operation}${naming.class}Procedure`;
      
      return `import { ${procedureName} } from './procedures/${operation}.${naming.file}';`;
    })
    .join('\n');

  // Generate router object properties
  const routerProperties = operations
    .map(operation => {
      const procedureName = `${operation}${naming.class}Procedure`;
      return `  ${operation}: ${procedureName},`;
    })
    .join('\n');

  return `import { router } from '../../trpc';
${procedureImports}

export const ${naming.variable}Router = router({
${routerProperties}
});

export type ${naming.class}Router = typeof ${naming.variable}Router;
`;
};
