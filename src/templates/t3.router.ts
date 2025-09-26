/**
 * T3 Stack tRPC router template for generating module routers
 */
import { getModuleNaming } from '../shared/utils/naming.utils';

export const generateT3RouterContent = ({
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
      const procedureName = operation === 'list' 
        ? `list${naming.class}sProcedure` 
        : `${operation}${naming.class}Procedure`;
      
      return `import { ${procedureName} } from "../${naming.variable}/procedures/${operation}.${naming.file}";`;
    })
    .join('\n');

  // Generate router object properties
  const routerProperties = operations
    .map(operation => {
      const procedureName = operation === 'list' 
        ? `list${naming.class}sProcedure` 
        : `${operation}${naming.class}Procedure`;
      
      return `  ${operation}: ${procedureName},`;
    })
    .join('\n');

  return `import { createTRPCRouter } from "~/server/api/trpc";
${procedureImports}

export const ${naming.variable}Router = createTRPCRouter({
${routerProperties}
});
`;
};

export const generateCustomT3RouterContent = ({
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
      const procedureName = `${operation}${naming.class}Procedure`;
      return `import { ${procedureName} } from "../${naming.variable}/procedures/${operation}.${naming.file}";`;
    })
    .join('\n');

  // Generate router object properties
  const routerProperties = operations
    .map(operation => {
      const procedureName = `${operation}${naming.class}Procedure`;
      return `  ${operation}: ${procedureName},`;
    })
    .join('\n');

  return `import { createTRPCRouter } from "~/server/api/trpc";
${procedureImports}

export const ${naming.variable}Router = createTRPCRouter({
${routerProperties}
});
`;
};

export const generateServicesT3RouterContent = ({
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
      const procedureName = `${operation}${naming.class}Procedure`;
      return `import { ${procedureName} } from "../${naming.variable}/procedures/${operation}.${naming.file}";`;
    })
    .join('\n');

  // Generate router object properties
  const routerProperties = operations
    .map(operation => {
      const procedureName = `${operation}${naming.class}Procedure`;
      return `  ${operation}: ${procedureName},`;
    })
    .join('\n');

  return `import { createTRPCRouter } from "~/server/api/trpc";
${procedureImports}

export const ${naming.variable}Router = createTRPCRouter({
${routerProperties}
});
`;
};
