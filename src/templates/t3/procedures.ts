/**
 * T3 procedure templates
 */

import { getModuleNaming } from '../shared/naming.utils';

export const generateProceduresContent = ({ moduleName }: { moduleName: string }): string => {
  const naming = getModuleNaming(moduleName);

  return `import { procedure, router } from '../trpc';
import { z } from 'zod';
import {
  create${naming.class}Service,
  get${naming.class}Service,
  list${naming.class}sService,
  update${naming.class}Service,
  delete${naming.class}Service,
} from '../services/${naming.file}.service';

export const create${naming.class} = procedure
  .input(
    z.object({
      name: z.string().min(1, 'Name is required'),
      description: z.string().optional(),
      status: z.string().optional(),
      // Add more ${naming.variable} creation fields with validation here
    })
  )
  .mutation(async ({ input }) => {
    return await create${naming.class}Service(input);
  });

export const get${naming.class} = procedure
  .input(
    z.object({
      ${naming.variable}Id: z.string().min(1, '${naming.class} ID is required'),
    })
  )
  .query(async ({ input }) => {
    return await get${naming.class}Service(input.${naming.variable}Id);
  });

export const list${naming.class}s = procedure
  .input(
    z.object({
      page: z.number().int().positive().optional(),
      limit: z.number().int().positive().max(100).optional(),
      sort_by: z.string().optional(),
      sort_order: z.enum(['asc', 'desc']).optional(),
      search: z.string().optional(),
      status: z.string().optional(),
      // Add more ${naming.variable} specific filters here
    }).optional().default({})
  )
  .query(async ({ input }) => {
    return await list${naming.class}sService(input);
  });

export const update${naming.class} = procedure
  .input(
    z.object({
      ${naming.variable}Id: z.string().min(1, '${naming.class} ID is required'),
      name: z.string().min(1, 'Name is required').optional(),
      description: z.string().optional(),
      status: z.string().optional(),
      // Add more ${naming.variable} update fields with validation here
    })
  )
  .mutation(async ({ input }) => {
    const { ${naming.variable}Id, ...data } = input;
    return await update${naming.class}Service(${naming.variable}Id, data);
  });

export const delete${naming.class} = procedure
  .input(
    z.object({
      ${naming.variable}Id: z.string().min(1, '${naming.class} ID is required'),
    })
  )
  .mutation(async ({ input }) => {
    return await delete${naming.class}Service(input.${naming.variable}Id);
  });
  
export const ${naming.variable}Router = router({
  create: create${naming.class},
  get: get${naming.class},
  list: list${naming.class}s,
  update: update${naming.class},
  delete: delete${naming.class},
});
`;
};

export const getProceduresFileName = ({ moduleName }: { moduleName: string }): string => {
  const naming = getModuleNaming(moduleName);
  return `${naming.file}.procedures.ts`;
};

export const generateCustomProceduresContent = ({ moduleName, customNames }: { moduleName: string; customNames: string[] }): string => {
  const naming = getModuleNaming(moduleName);

  return `import { procedure } from '../trpc';
import { z } from 'zod';
import { ${customNames.map(name => `${name}${naming.class}Service`).join(', ')} } from '../services/${naming.file}.service';

${customNames.map(name => `export const ${name}${naming.class} = procedure
  .input(
    z.object({
      // Define input validation for ${name} operation
    })
  )
  .mutation(async ({ input }) => {
    return await ${name}${naming.class}Service(input);
  });
`).join('\n\n')}
`;
};