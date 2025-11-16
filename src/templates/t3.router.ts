/**
 * T3 Stack tRPC router template for generating module routers
 */
import { getModuleNaming } from '../shared/utils/naming.utils';

/**
 * Parse existing T3 router file and extract operations
 */
export const parseT3RouterOperations = (content: string): string[] => {
  const operations: string[] = [];

  // Match the createTRPCRouter object
  const routerMatch = content.match(/createTRPCRouter\(\{([^}]+)\}\)/s);

  if (!routerMatch) {
    return operations;
  }

  const routerBody = routerMatch[1];

  // Extract operation names (keys in the router object)
  const operationMatches = routerBody.matchAll(/^\s*(\w+):\s*\w+Procedure,?/gm);

  for (const match of operationMatches) {
    if (match[1]) {
      operations.push(match[1]);
    }
  }

  return operations;
};

export const generateT3RouterContent = ({
  moduleName,
  operations = ['create', 'get', 'list', 'update', 'delete'],
  apiBasePath = '~/server/api',
}: {
  moduleName: string;
  operations?: string[];
  apiBasePath?: string;
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

  return `import { createTRPCRouter } from "${apiBasePath}/trpc";
${procedureImports}

export const ${naming.variable}Router = createTRPCRouter({
${routerProperties}
});
`;
};

export const generateCustomT3RouterContent = ({
  moduleName,
  operations,
  apiBasePath = '~/server/api',
}: {
  moduleName: string;
  operations: string[];
  apiBasePath?: string;
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

  return `import { createTRPCRouter } from "${apiBasePath}/trpc";
${procedureImports}

export const ${naming.variable}Router = createTRPCRouter({
${routerProperties}
});
`;
};

export const generateServicesT3RouterContent = ({
  moduleName,
  operations,
  apiBasePath = '~/server/api',
}: {
  moduleName: string;
  operations: string[];
  apiBasePath?: string;
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

  return `import { createTRPCRouter } from "${apiBasePath}/trpc";
${procedureImports}

export const ${naming.variable}Router = createTRPCRouter({
${routerProperties}
});
`;
};

/**
 * Generate T3 router with merged operations (CRUD + custom)
 * This is the unified function that handles all operation types
 */
export const generateMergedT3RouterContent = ({
  moduleName,
  operations,
  apiBasePath = '~/server/api',
}: {
  moduleName: string;
  operations: string[];
  apiBasePath?: string;
}): string => {
  const naming = getModuleNaming(moduleName);

  // Remove duplicates and sort operations
  const uniqueOperations = [...new Set(operations)].sort();

  // Generate imports for each operation
  const procedureImports = uniqueOperations
    .map(operation => {
      const procedureName = operation === 'list'
        ? `list${naming.class}sProcedure`
        : `${operation}${naming.class}Procedure`;

      return `import { ${procedureName} } from "../${naming.variable}/procedures/${operation}.${naming.file}";`;
    })
    .join('\n');

  // Generate router object properties
  const routerProperties = uniqueOperations
    .map(operation => {
      const procedureName = operation === 'list'
        ? `list${naming.class}sProcedure`
        : `${operation}${naming.class}Procedure`;

      return `\t${operation}: ${procedureName},`;
    })
    .join('\n');

  return `import { createTRPCRouter } from "${apiBasePath}/trpc";
${procedureImports}

export const ${naming.variable}Router = createTRPCRouter({
${routerProperties}
});
`;
};
