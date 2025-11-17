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
  inlineProcedures = false,
  inlineRouterImportPath,
}: {
  moduleName: string;
  operations: string[];
  apiBasePath?: string;
  inlineProcedures?: boolean;
  inlineRouterImportPath?: string;
}): string => {
  const naming = getModuleNaming(moduleName);

  // Remove duplicates and sort operations
  const uniqueOperations = [...new Set(operations)].sort();

  const trpcImport = inlineProcedures
    ? inlineRouterImportPath
      ? `import { publicProcedure, router } from "${inlineRouterImportPath}";`
      : `import { createTRPCRouter, publicProcedure } from "${apiBasePath}/trpc";`
    : `import { createTRPCRouter } from "${apiBasePath}/trpc";`;

  if (!inlineProcedures) {
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

    return `${trpcImport}
${procedureImports}

export const ${naming.variable}Router = createTRPCRouter({
${routerProperties}
});
`;
  }

  const operationConfigs = uniqueOperations.map(operation => ({
    operation,
    schemaAlias: getValidatorSchemaAlias(operation),
  }));

  const handlerImports = operationConfigs
    .map(({ operation }) => {
      const handlerName = getHandlerImportName(operation, naming.class);
      return `import ${handlerName} from "../${naming.variable}/handlers/${operation}.${naming.file}";`;
    })
    .join('\n');

  const validatorImports = operationConfigs
    .map(({ operation, schemaAlias }) => {
      return `import { payloadSchema as ${schemaAlias} } from "../${naming.variable}/validators/${operation}.${naming.file}";`;
    })
    .join('\n');

  const routerEntries = operationConfigs
    .map(({ operation, schemaAlias }) => generateInlineRouterEntry({ operation, naming, schemaAlias }))
    .join('\n\n');

  const routerFactory = inlineRouterImportPath ? 'router' : 'createTRPCRouter';

  return `import { randomBytes } from "node:crypto";
${trpcImport}
${handlerImports}
${validatorImports}

export const ${naming.variable}Router = ${routerFactory}({
${routerEntries}
});
`;
};

const getValidatorSchemaAlias = (operation: string): string => `${operation}PayloadSchema`;

const getHandlerImportName = (operation: string, capitalizedModule: string): string => {
  if (operation === 'list') {
    return `list${capitalizedModule}sHandler`;
  }
  return `${operation}${capitalizedModule}Handler`;
};

const getRouterMethod = (operation: string): 'query' | 'mutation' => {
  return operation === 'get' || operation === 'list' ? 'query' : 'mutation';
};

const generateInlineRouterEntry = ({
  operation,
  naming,
  schemaAlias,
}: {
  operation: string;
  naming: ReturnType<typeof getModuleNaming>;
  schemaAlias: string;
}): string => {
  const handlerName = getHandlerImportName(operation, naming.class);
  const routerMethod = getRouterMethod(operation);
  return `  ${operation}: publicProcedure
    .input(${schemaAlias})
    .${routerMethod}(async ({ input }) => {
      const requestId = randomBytes(16).toString("hex");

      return await ${handlerName}({
        ...input,
        requestId,
      });
    }),`;
};
