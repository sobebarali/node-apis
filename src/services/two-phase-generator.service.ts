import * as path from 'path';
import { ApiType, GeneratedFile } from '../types/common.types';
import { fileExists, writeFile, readFile } from '../filesystem/file.operations';
import { ensureDirectory } from '../filesystem/directory.operations';
import { getCrudFileNames, generateCrudFileContent } from '../templates/crud.templates';
import { getCustomFileNames, generateCustomFileContent } from '../templates/custom.templates';
import {
  getServiceFileNames,
  generateServiceTypeContent,
  generateServiceContent,
} from '../templates/services.templates';
import { parseModuleTypes, convertEmptyTypePayload } from './type-parser.service';

import {
  getCrudRepositoryFileNames,
  generateCrudRepositoryContent,
  generateCustomRepositoryContent
} from '../templates/typed-repository.templates';
import {
  getCrudValidatorFileNames,
  generateCrudValidatorContent,
} from '../templates/typed-crud.validators';
import {
  getCustomValidatorFileNames,
} from '../templates/custom.validators';
import {
  generateTypedCustomValidatorContent,
} from '../templates/typed-custom.validators';
import {
  getCrudControllerFileNames,
  generateCrudControllerContent,
} from '../templates/crud.controllers';
import {
  getCustomControllerFileNames,
  generateCustomControllerContent,
} from '../templates/custom.controllers';
import {
  getTrpcProcedureFileNames,
  generateTrpcProcedureContent,
} from '../templates/trpc.procedures';
import {
  generateTrpcRouterContent,
  generateCustomTrpcRouterContent,
  generateServicesTrpcRouterContent,
} from '../templates/trpc.router';
import {
  generateT3ProcedureContent,
} from '../templates/t3.procedures';
import {
  generateMergedT3RouterContent,
  parseT3RouterOperations,
} from '../templates/t3.router';
import {
  generateErrorConstantsContent,
  getErrorConstantsFileName,
} from '../templates/t3.constants';
import {
  generateLoggerContent,
  getLoggerFileName,
} from '../templates/t3.logger';
import {
  getT3CrudTypeFileNames,
  getT3CustomTypeFileNames,
  generateT3CrudTypeContent,
  generateT3CustomTypeContent,
} from '../templates/t3.types';
import { getCrudHandlerFileNames } from '../templates/typed-crud.handlers';

// The generateRouteContent function is now dynamically imported based on framework
// to use the appropriate route template (Express, Hono, or T3)
import { formatGeneratedFiles } from './formatter.service';

const isT3StyleFramework = (framework?: string): boolean =>
  framework === 't3' || framework === 'tanstack';

const getT3ApiBasePath = (framework?: string): string =>
  framework === 'tanstack' ? '~/api' : '~/server/api';

export const generateTypeFilesOnly = async ({
  moduleName,
  modulePath,
  apiType,
  appendMode = false,
  framework = 'express',
}: {
  moduleName: string;
  modulePath: string;
  apiType: ApiType;
  appendMode?: boolean;
  framework?: 'express' | 'hono' | 't3' | 'tanstack';
}): Promise<GeneratedFile[]> => {
  const generatedFiles: GeneratedFile[] = [];
  const typesDir = path.join(modulePath, 'types');

  if (apiType.type === 'crud') {
    // Use T3/TanStack-specific type templates for these frameworks
    if (isT3StyleFramework(framework)) {
      const crudFileNames = getT3CrudTypeFileNames({ moduleName });
      const crudOperations = ['create', 'get', 'list', 'delete', 'update'];

      for (let i = 0; i < crudFileNames.length; i++) {
        const fileName = crudFileNames[i];
        const operation = crudOperations[i];

        // Generate T3 type file (only typePayload and typeResult)
        const typeFilePath = path.join(typesDir, fileName);
        if (!appendMode || !(await fileExists({ filePath: typeFilePath }))) {
          const typeContent = generateT3CrudTypeContent({ operation, moduleName });
          await writeFile({ filePath: typeFilePath, content: typeContent });
          generatedFiles.push({ fileName, filePath: typeFilePath, content: typeContent });
        }
      }
    } else {
      // Use standard type templates for Express/Hono
      const crudFileNames = getCrudFileNames({ moduleName });
      const crudOperations = ['create', 'get', 'list', 'delete', 'update'];

      for (let i = 0; i < crudFileNames.length; i++) {
        const fileName = crudFileNames[i];
        const operation = crudOperations[i];

        // Generate type file
        const typeFilePath = path.join(typesDir, fileName);
        if (!appendMode || !(await fileExists({ filePath: typeFilePath }))) {
          const typeContent = generateCrudFileContent({ operation, moduleName });
          await writeFile({ filePath: typeFilePath, content: typeContent });
          generatedFiles.push({ fileName, filePath: typeFilePath, content: typeContent });
        }
      }
    }
  } else if (apiType.type === 'custom' && apiType.customNames) {
    // Use T3/TanStack-specific type templates for these frameworks
    if (isT3StyleFramework(framework)) {
      const customFileNames = getT3CustomTypeFileNames({
        customNames: apiType.customNames,
        moduleName,
      });

      for (let i = 0; i < customFileNames.length; i++) {
        const fileName = customFileNames[i];
        const customName = apiType.customNames[i];

        // Generate T3 custom type file (only typePayload and typeResult)
        const typeFilePath = path.join(typesDir, fileName);
        if (!appendMode || !(await fileExists({ filePath: typeFilePath }))) {
          const typeContent = generateT3CustomTypeContent({ customName, moduleName });
          await writeFile({ filePath: typeFilePath, content: typeContent });
          generatedFiles.push({ fileName, filePath: typeFilePath, content: typeContent });
        }
      }
    } else {
      // Use standard type templates for Express/Hono
      const customFileNames = getCustomFileNames({
        customNames: apiType.customNames,
        moduleName,
      });

      for (let i = 0; i < customFileNames.length; i++) {
        const fileName = customFileNames[i];
        const customName = apiType.customNames[i];

        // Generate type file
        const typeFilePath = path.join(typesDir, fileName);
        if (!appendMode || !(await fileExists({ filePath: typeFilePath }))) {
          const typeContent = generateCustomFileContent({ customName, moduleName });
          await writeFile({ filePath: typeFilePath, content: typeContent });
          generatedFiles.push({ fileName, filePath: typeFilePath, content: typeContent });
        }
      }
    }
  } else if (apiType.type === 'services' && apiType.serviceNames) {
    const serviceFileNames = getServiceFileNames({
      moduleName,
      serviceNames: apiType.serviceNames,
    });

    for (let i = 0; i < serviceFileNames.length; i++) {
      const fileName = serviceFileNames[i];
      const serviceName = apiType.serviceNames[i];

      // Generate type file
      const typeFilePath = path.join(typesDir, fileName);
      if (!appendMode || !(await fileExists({ filePath: typeFilePath }))) {
        const typeContent = generateServiceTypeContent({ serviceName, moduleName });
        await writeFile({ filePath: typeFilePath, content: typeContent });
        generatedFiles.push({ fileName, filePath: typeFilePath, content: typeContent });
      }
    }
  }

  return generatedFiles;
};

export const generateCodeWithParsedTypes = async ({
  moduleName,
  modulePath,
  apiType,
  framework = 'express',
  appendMode = false,
  trpcStyle = false,
}: {
  moduleName: string;
  modulePath: string;
  apiType: ApiType;
  framework?: string;
  appendMode?: boolean;
  trpcStyle?: boolean;
}): Promise<GeneratedFile[]> => {
  const generatedFiles: GeneratedFile[] = [];
  const t3StyleFramework = isT3StyleFramework(framework);
  const isTanstackFramework = framework === 'tanstack';
  const t3ApiBasePath = getT3ApiBasePath(framework);
  const validatorsDir = path.join(modulePath, 'validators');
  const controllersDir = path.join(modulePath, 'controllers');
  const proceduresDir = path.join(modulePath, 'procedures');
  const handlersDir = path.join(modulePath, 'handlers');

  const repositoryDir = path.join(modulePath, 'repository');
  const typesDir = path.join(modulePath, 'types');

  // Parse the type files to get actual field names
  const parsedTypes = await parseModuleTypes(modulePath);

  // Convert empty typePayloads to Record<string, never>
  await Promise.all(
    Object.entries(parsedTypes).map(async ([operation, parsedType]) => {
      if (parsedType.isEmpty) {
        const typeFilePath = path.join(typesDir, `${operation}.${moduleName}.ts`);
        await convertEmptyTypePayload(typeFilePath);
      }
    })
  );

  if (apiType.type === 'crud') {
    const crudValidatorFileNames = getCrudValidatorFileNames({ moduleName });
    const crudControllerFileNames = getCrudControllerFileNames({ moduleName });
    const crudProcedureFileNames = getTrpcProcedureFileNames({ moduleName });
    const crudHandlerFileNames = getCrudHandlerFileNames({ moduleName });
    const crudRepositoryFileNames = getCrudRepositoryFileNames({ moduleName });
    // const crudServiceFileNames = getCrudServiceFileNames({ moduleName }); // Removed - no longer using service layer
    const crudOperations = ['create', 'get', 'list', 'delete', 'update'];

    for (let i = 0; i < crudOperations.length; i++) {
      const validatorFileName = crudValidatorFileNames[i];
      const controllerFileName = crudControllerFileNames[i];
      const procedureFileName = crudProcedureFileNames[i];
      const handlerFileName = crudHandlerFileNames[i];
      const repositoryFileName = crudRepositoryFileNames[i];
      // const serviceFileName = crudServiceFileNames[i]; // Removed - no longer using service layer
      const operation = crudOperations[i];
      const parsedType = parsedTypes[operation] || {
        fields: [],
        hasId: false,
        hasPagination: false,
      };

      // Generate validator file (skip if typePayload is empty)
      if (!parsedType.isEmpty) {
        const validatorFilePath = path.join(validatorsDir, validatorFileName);
        if (!appendMode || !(await fileExists({ filePath: validatorFilePath }))) {
          const validatorContent = generateCrudValidatorContent({
            operation,
            moduleName,
            parsedType,
          });
          await writeFile({ filePath: validatorFilePath, content: validatorContent });
          generatedFiles.push({
            fileName: validatorFileName,
            filePath: validatorFilePath,
            content: validatorContent,
          });
        }
      }

      // Generate controller or procedure file based on style
      if (t3StyleFramework && !isTanstackFramework) {
        // Generate T3 procedure file
        const procedureFilePath = path.join(proceduresDir, procedureFileName);
        if (!appendMode || !(await fileExists({ filePath: procedureFilePath }))) {
          const procedureContent = generateT3ProcedureContent({
            operation,
            moduleName,
            apiBasePath: t3ApiBasePath,
          });
          await writeFile({ filePath: procedureFilePath, content: procedureContent });
          generatedFiles.push({
            fileName: procedureFileName,
            filePath: procedureFilePath,
            content: procedureContent,
          });
        }
      } else if (trpcStyle && !isTanstackFramework) {
        // Generate tRPC procedure file
        const procedureFilePath = path.join(proceduresDir, procedureFileName);
        if (!appendMode || !(await fileExists({ filePath: procedureFilePath }))) {
          const procedureContent = generateTrpcProcedureContent({
            operation,
            moduleName,
          });
          await writeFile({ filePath: procedureFilePath, content: procedureContent });
          generatedFiles.push({
            fileName: procedureFileName,
            filePath: procedureFilePath,
            content: procedureContent,
          });
        }
      } else if (!t3StyleFramework && !trpcStyle) {
        // Generate REST controller file
        const controllerFilePath = path.join(controllersDir, controllerFileName);
        if (!appendMode || !(await fileExists({ filePath: controllerFilePath }))) {
          const controllerContent = generateCrudControllerContent({
            operation,
            moduleName,
            framework,
          });
          await writeFile({ filePath: controllerFilePath, content: controllerContent });
          generatedFiles.push({
            fileName: controllerFileName,
            filePath: controllerFilePath,
            content: controllerContent,
          });
        }
      }

      // Generate handler file with parsed types (contains business logic)
      const handlerFilePath = path.join(handlersDir, handlerFileName);
      if (!appendMode || !(await fileExists({ filePath: handlerFilePath }))) {
        // Dynamically import the appropriate handler module based on framework
        let handlerModule;
        if (framework === 'hono') {
          handlerModule = await import('../templates/typed-crud.handlers'); // Use framework-agnostic for now
        } else if (t3StyleFramework) {
          handlerModule = await import('../templates/typed-crud.handlers'); // Use framework-agnostic for now
        } else { // Express
          handlerModule = await import('../templates/express/crud/handlers');
        }
        
        const handlerContent = handlerModule.generateCrudHandlerContent({
          operation,
          moduleName,
          parsedType,
          useRepositoryLayer: !isTanstackFramework,
        });
        await writeFile({ filePath: handlerFilePath, content: handlerContent });
        generatedFiles.push({
          fileName: handlerFileName,
          filePath: handlerFilePath,
          content: handlerContent,
        });
      }

      if (!isTanstackFramework) {
        // Generate individual repository file per operation
        const repositoryFilePath = path.join(repositoryDir, repositoryFileName);
        if (!appendMode || !(await fileExists({ filePath: repositoryFilePath }))) {
          const repositoryContent = generateCrudRepositoryContent({
            operation,
            moduleName,
            parsedType,
          });
          await writeFile({ filePath: repositoryFilePath, content: repositoryContent });
          generatedFiles.push({
            fileName: repositoryFileName,
            filePath: repositoryFilePath,
            content: repositoryContent,
          });
        }
      }

      // Skip service generation - business logic is now in handlers
    }
  } else if (apiType.type === 'custom' && apiType.customNames) {
    const customValidatorFileNames = getCustomValidatorFileNames({
      customNames: apiType.customNames,
      moduleName,
    });
    const customControllerFileNames = getCustomControllerFileNames({
      customNames: apiType.customNames,
      moduleName,
    });
    for (let i = 0; i < apiType.customNames.length; i++) {
      const validatorFileName = customValidatorFileNames[i];
      const controllerFileName = customControllerFileNames[i];
      const customName = apiType.customNames[i];
      
      // Generate procedure file name for custom operations
      const procedureFileName = `${customName}.${moduleName}.ts`;

      // Generate validator file with parsed types (skip if typePayload is empty)
      const parsedType = parsedTypes[customName] || { fields: [], hasId: false, hasPagination: false };
      if (!parsedType.isEmpty) {
        const validatorFilePath = path.join(validatorsDir, validatorFileName);
        if (!appendMode || !(await fileExists({ filePath: validatorFilePath }))) {
          const validatorContent = generateTypedCustomValidatorContent({
            customName,
            moduleName,
            parsedType
          });
          await writeFile({ filePath: validatorFilePath, content: validatorContent });
          generatedFiles.push({
            fileName: validatorFileName,
            filePath: validatorFilePath,
            content: validatorContent,
          });
        }
      }

      // Generate controller or procedure file based on framework
      if (t3StyleFramework && !isTanstackFramework) {
        // Generate T3 procedure file
        const procedureFilePath = path.join(proceduresDir, procedureFileName);
        if (!appendMode || !(await fileExists({ filePath: procedureFilePath }))) {
          const procedureContent = generateT3ProcedureContent({
            operation: customName,
            moduleName,
            apiBasePath: t3ApiBasePath,
          });
          await writeFile({ filePath: procedureFilePath, content: procedureContent });
          generatedFiles.push({
            fileName: procedureFileName,
            filePath: procedureFilePath,
            content: procedureContent,
          });
        }
      } else if (!t3StyleFramework) {
        // Generate REST controller file
        const controllerFilePath = path.join(controllersDir, controllerFileName);
        if (!appendMode || !(await fileExists({ filePath: controllerFilePath }))) {
          const controllerContent = generateCustomControllerContent({
            customName,
            moduleName,
            framework,
          });
          await writeFile({ filePath: controllerFilePath, content: controllerContent });
          generatedFiles.push({
            fileName: controllerFileName,
            filePath: controllerFilePath,
            content: controllerContent,
          });
        }
      }

      // Generate handler file
      const handlerFileName = `${customName}.${moduleName}.ts`;
      const handlerFilePath = path.join(handlersDir, handlerFileName);
      if (!appendMode || !(await fileExists({ filePath: handlerFilePath }))) {
        // Dynamically import the appropriate handler module based on framework
        let handlerModule;
        if (framework === 'hono') {
          handlerModule = await import('../templates/typed-custom.handlers'); // Use framework-agnostic for now
        } else if (t3StyleFramework) {
          handlerModule = await import('../templates/typed-custom.handlers'); // Use framework-agnostic for now
        } else { // Express
          handlerModule = await import('../templates/express/custom/handlers');
        }
        
        const handlerContent = handlerModule.generateTypedCustomHandlerContent({
          customName,
          moduleName,
          parsedType: parsedTypes[customName] || { fields: [], hasId: false, hasPagination: false },
          useRepositoryLayer: !isTanstackFramework,
        });
        await writeFile({ filePath: handlerFilePath, content: handlerContent });
        generatedFiles.push({
          fileName: handlerFileName,
          filePath: handlerFilePath,
          content: handlerContent,
        });
      }

      if (!isTanstackFramework) {
        // Generate individual repository file per custom operation
        const repositoryFileName = `${customName}.${moduleName}.ts`;
        const repositoryFilePath = path.join(repositoryDir, repositoryFileName);
        if (!appendMode || !(await fileExists({ filePath: repositoryFilePath }))) {
          const parsedType = parsedTypes[customName] || { fields: [], hasId: false, hasPagination: false };
          const repositoryContent = generateCustomRepositoryContent({
            customName,
            moduleName,
            parsedType,
          });
          await writeFile({ filePath: repositoryFilePath, content: repositoryContent });
          generatedFiles.push({
            fileName: repositoryFileName,
            filePath: repositoryFilePath,
            content: repositoryContent,
          });
        }
      }
    }
  } else if (apiType.type === 'services' && apiType.serviceNames) {
    const servicesDir = path.join(modulePath, 'services');
    const serviceFileNames = getServiceFileNames({
      moduleName,
      serviceNames: apiType.serviceNames,
    });

    for (let i = 0; i < apiType.serviceNames.length; i++) {
      const serviceFileName = serviceFileNames[i];
      const serviceName = apiType.serviceNames[i];

      // Generate service file
      const serviceFilePath = path.join(servicesDir, serviceFileName);
      if (!appendMode || !(await fileExists({ filePath: serviceFilePath }))) {
        const serviceContent = generateServiceContent({
          serviceName,
          moduleName,
          ...(t3StyleFramework ? { apiBasePath: t3ApiBasePath } : {}),
        });
        await writeFile({ filePath: serviceFilePath, content: serviceContent });
        generatedFiles.push({
          fileName: serviceFileName,
          filePath: serviceFilePath,
          content: serviceContent,
        });
      }
    }

    // Skip routes generation for services (they are internal)
    // Format all generated files
    const filePaths = generatedFiles.map(file => file.filePath);
    await formatGeneratedFiles(filePaths);

    return generatedFiles;
  }

  // Generate routes or router file based on style
  if (t3StyleFramework) {
    // Generate T3 utility files (constants and logger) - only once
    const sharedBaseDir =
      framework === 'tanstack'
        ? path.join(modulePath, '..', '..')
        : path.join(modulePath, '..', '..');
    const constantsDir = path.join(sharedBaseDir, 'constants');
    const utilsDir = path.join(sharedBaseDir, 'utils');

    await ensureDirectory({ dirPath: constantsDir });
    await ensureDirectory({ dirPath: utilsDir });

    // Generate error constants file if it doesn't exist
    const constantsFileName = getErrorConstantsFileName();
    const constantsFilePath = path.join(constantsDir, constantsFileName);
    if (!(await fileExists({ filePath: constantsFilePath }))) {
      const constantsContent = generateErrorConstantsContent();
      await writeFile({ filePath: constantsFilePath, content: constantsContent });
      generatedFiles.push({
        fileName: constantsFileName,
        filePath: constantsFilePath,
        content: constantsContent,
      });
    }

    // Generate logger file if it doesn't exist
    const loggerFileName = getLoggerFileName();
    const loggerFilePath = path.join(utilsDir, loggerFileName);
    if (!(await fileExists({ filePath: loggerFilePath }))) {
      const loggerContent = generateLoggerContent();
      await writeFile({ filePath: loggerFilePath, content: loggerContent });
      generatedFiles.push({
        fileName: loggerFileName,
        filePath: loggerFilePath,
        content: loggerContent,
      });
    }

    // Generate T3 router file with automatic operation merging
    const routerFileName = `${moduleName}.ts`;
    const routerDir = isTanstackFramework ? modulePath : path.join(modulePath, '..', 'routers');
    const routerFilePath = path.join(routerDir, routerFileName);

    // Ensure routers directory exists (non-TanStack routers folder may not exist)
    await ensureDirectory({ dirPath: routerDir });

    // Determine new operations to add
    let newOperations: string[] = [];
    if (apiType.type === 'crud') {
      newOperations = ['create', 'get', 'list', 'update', 'delete'];
    } else if (apiType.type === 'custom' && apiType.customNames) {
      newOperations = apiType.customNames;
    } else if (apiType.type === 'services' && apiType.serviceNames) {
      newOperations = apiType.serviceNames;
    }

    // Check if router file already exists
    const routerExists = await fileExists({ filePath: routerFilePath });
    let existingOperations: string[] = [];

    if (routerExists) {
      try {
        const existingContent = await readFile({ filePath: routerFilePath });
        existingOperations = parseT3RouterOperations(existingContent);
      } catch (error) {
        // If parsing fails, continue with just new operations
        existingOperations = [];
      }
    }

    // Merge existing and new operations (removes duplicates)
    const allOperations = [...new Set([...existingOperations, ...newOperations])];

    // Generate router with merged operations
    const inlineRouterImportPath = isTanstackFramework ? '../../index' : undefined;
    const routerContent = generateMergedT3RouterContent({
      moduleName,
      operations: allOperations,
      apiBasePath: t3ApiBasePath,
      inlineProcedures: isTanstackFramework,
      ...(inlineRouterImportPath && { inlineRouterImportPath }),
    });

    await writeFile({ filePath: routerFilePath, content: routerContent });
    generatedFiles.push({
      fileName: routerFileName,
      filePath: routerFilePath,
      content: routerContent,
    });
  } else if (trpcStyle) {
    // Generate tRPC router file
    const routerFileName = `${moduleName}.router.ts`;
    const routerFilePath = path.join(modulePath, routerFileName);
    if (!appendMode || !(await fileExists({ filePath: routerFilePath }))) {
      let routerContent: string;
      
      if (apiType.type === 'crud') {
        routerContent = generateTrpcRouterContent({ 
          moduleName, 
          operations: ['create', 'get', 'list', 'update', 'delete'] 
        });
      } else if (apiType.type === 'custom' && apiType.customNames) {
        routerContent = generateCustomTrpcRouterContent({ 
          moduleName, 
          operations: apiType.customNames 
        });
      } else if (apiType.type === 'services' && apiType.serviceNames) {
        routerContent = generateServicesTrpcRouterContent({ 
          moduleName, 
          operations: apiType.serviceNames 
        });
      } else {
        routerContent = generateTrpcRouterContent({ moduleName });
      }
      
      await writeFile({ filePath: routerFilePath, content: routerContent });
      generatedFiles.push({
        fileName: routerFileName,
        filePath: routerFilePath,
        content: routerContent,
      });
    }
  } else {
    // Generate REST routes file
    const routesFileName = `${moduleName}.routes.ts`;
    const routesFilePath = path.join(modulePath, routesFileName);
    if (!appendMode || !(await fileExists({ filePath: routesFilePath }))) {
      // Import the appropriate route module based on framework and API type
      let routeModule;
      if (framework === 'hono') {
        if (apiType.type === 'custom' && apiType.customNames) {
          routeModule = await import('../templates/hono/custom/routes');
        } else {
          routeModule = await import('../templates/hono/crud/routes');
        }
      } else {
        if (apiType.type === 'custom' && apiType.customNames) {
          routeModule = await import('../templates/express/custom/routes');
        } else {
          routeModule = await import('../templates/express/crud/routes');
        }
      }

      const routesContent = routeModule.generateRouteContent({ moduleName, apiType });
      await writeFile({ filePath: routesFilePath, content: routesContent });
      generatedFiles.push({
        fileName: routesFileName,
        filePath: routesFilePath,
        content: routesContent,
      });
    }
  }

  // Format all generated files
  const filePaths = generatedFiles.map(file => file.filePath);
  await formatGeneratedFiles(filePaths);

  return generatedFiles;
};
