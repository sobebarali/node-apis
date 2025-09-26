import * as path from 'path';
import { ApiType, GeneratedFile } from '../types/common.types';
import { fileExists, writeFile } from '../filesystem/file.operations';
import { ensureDirectory } from '../filesystem/directory.operations';
import { getCrudFileNames, generateCrudFileContent } from '../templates/crud.templates';
import { getCustomFileNames, generateCustomFileContent } from '../templates/custom.templates';
import {
  getServiceFileNames,
  generateServiceTypeContent,
  generateServiceContent,
} from '../templates/services.templates';
import { parseModuleTypes } from './type-parser.service';

import { generateTypedRepositoryContent } from '../templates/typed-repository.templates';
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
  generateT3RouterContent,
  generateCustomT3RouterContent,
  generateServicesT3RouterContent,
} from '../templates/t3.router';
import {
  getCrudHandlerFileNames,
  generateCrudHandlerContent,
} from '../templates/typed-crud.handlers';
import {
  generateTypedCustomHandlerContent,
} from '../templates/typed-custom.handlers';

import { generateRouteContent } from '../templates/routes.templates';
import { formatGeneratedFiles } from './formatter.service';

export const generateTypeFilesOnly = async ({
  moduleName,
  modulePath,
  apiType,
  appendMode = false,
}: {
  moduleName: string;
  modulePath: string;
  apiType: ApiType;
  appendMode?: boolean;
}): Promise<GeneratedFile[]> => {
  const generatedFiles: GeneratedFile[] = [];
  const typesDir = path.join(modulePath, 'types');

  if (apiType.type === 'crud') {
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
  } else if (apiType.type === 'custom' && apiType.customNames) {
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
  const validatorsDir = path.join(modulePath, 'validators');
  const controllersDir = path.join(modulePath, 'controllers');
  const proceduresDir = path.join(modulePath, 'procedures');
  const handlersDir = path.join(modulePath, 'handlers');

  const repositoryDir = path.join(modulePath, 'repository');

  // Parse the type files to get actual field names
  const parsedTypes = await parseModuleTypes(modulePath);

  if (apiType.type === 'crud') {
    const crudValidatorFileNames = getCrudValidatorFileNames({ moduleName });
    const crudControllerFileNames = getCrudControllerFileNames({ moduleName });
    const crudProcedureFileNames = getTrpcProcedureFileNames({ moduleName });
    const crudHandlerFileNames = getCrudHandlerFileNames({ moduleName });
    // const crudServiceFileNames = getCrudServiceFileNames({ moduleName }); // Removed - no longer using service layer
    const crudOperations = ['create', 'get', 'list', 'delete', 'update'];

    for (let i = 0; i < crudOperations.length; i++) {
      const validatorFileName = crudValidatorFileNames[i];
      const controllerFileName = crudControllerFileNames[i];
      const procedureFileName = crudProcedureFileNames[i];
      const handlerFileName = crudHandlerFileNames[i];
      // const serviceFileName = crudServiceFileNames[i]; // Removed - no longer using service layer
      const operation = crudOperations[i];
      const parsedType = parsedTypes[operation] || {
        fields: [],
        hasId: false,
        hasPagination: false,
      };

      // Generate validator file
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

      // Generate controller or procedure file based on style
      if (framework === 't3') {
        // Generate T3 procedure file
        const procedureFilePath = path.join(proceduresDir, procedureFileName);
        if (!appendMode || !(await fileExists({ filePath: procedureFilePath }))) {
          const procedureContent = generateT3ProcedureContent({
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
      } else if (trpcStyle) {
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
      } else {
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
        const handlerContent = generateCrudHandlerContent({ operation, moduleName, parsedType });
        await writeFile({ filePath: handlerFilePath, content: handlerContent });
        generatedFiles.push({
          fileName: handlerFileName,
          filePath: handlerFilePath,
          content: handlerContent,
        });
      }

      // Skip service generation - business logic is now in handlers
    }

    // Generate repository file with parsed types
    const repositoryFileName = `${moduleName}.repository.ts`;
    const repositoryFilePath = path.join(repositoryDir, repositoryFileName);
    if (!appendMode || !(await fileExists({ filePath: repositoryFilePath }))) {
      const repositoryContent = generateTypedRepositoryContent({
        moduleName,
        apiType,
        parsedTypes,
      });
      await writeFile({ filePath: repositoryFilePath, content: repositoryContent });
      generatedFiles.push({
        fileName: repositoryFileName,
        filePath: repositoryFilePath,
        content: repositoryContent,
      });
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

      // Generate validator file with parsed types
      const validatorFilePath = path.join(validatorsDir, validatorFileName);
      if (!appendMode || !(await fileExists({ filePath: validatorFilePath }))) {
        const parsedType = parsedTypes[customName] || { fields: [], hasId: false, hasPagination: false };
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

      // Generate controller or procedure file based on framework
      if (framework === 't3') {
        // Generate T3 procedure file
        const procedureFilePath = path.join(proceduresDir, procedureFileName);
        if (!appendMode || !(await fileExists({ filePath: procedureFilePath }))) {
          const procedureContent = generateT3ProcedureContent({
            operation: customName,
            moduleName,
          });
          await writeFile({ filePath: procedureFilePath, content: procedureContent });
          generatedFiles.push({
            fileName: procedureFileName,
            filePath: procedureFilePath,
            content: procedureContent,
          });
        }
      } else {
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
        const parsedType = parsedTypes[customName] || { fields: [], hasId: false, hasPagination: false };
        const handlerContent = generateTypedCustomHandlerContent({
          customName,
          moduleName,
          parsedType,
        });
        await writeFile({ filePath: handlerFilePath, content: handlerContent });
        generatedFiles.push({
          fileName: handlerFileName,
          filePath: handlerFilePath,
          content: handlerContent,
        });
      }
    }

    // Generate repository file with parsed types
    const repositoryFileName = `${moduleName}.repository.ts`;
    const repositoryFilePath = path.join(repositoryDir, repositoryFileName);
    if (!appendMode || !(await fileExists({ filePath: repositoryFilePath }))) {
      const repositoryContent = generateTypedRepositoryContent({
        moduleName,
        apiType,
        parsedTypes,
      });
      await writeFile({ filePath: repositoryFilePath, content: repositoryContent });
      generatedFiles.push({
        fileName: repositoryFileName,
        filePath: repositoryFilePath,
        content: repositoryContent,
      });
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
        const serviceContent = generateServiceContent({ serviceName, moduleName });
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
  if (framework === 't3') {
    // Generate T3 router file
    const routerFileName = `${moduleName}.ts`;
    const routersDir = path.join(modulePath, '..', 'routers');
    const routerFilePath = path.join(routersDir, routerFileName);
    
    // Ensure routers directory exists
    await ensureDirectory({ dirPath: routersDir });
    
    if (!appendMode || !(await fileExists({ filePath: routerFilePath }))) {
      let routerContent: string;
      
      if (apiType.type === 'crud') {
        routerContent = generateT3RouterContent({ 
          moduleName, 
          operations: ['create', 'get', 'list', 'update', 'delete'] 
        });
      } else if (apiType.type === 'custom' && apiType.customNames) {
        routerContent = generateCustomT3RouterContent({ 
          moduleName, 
          operations: apiType.customNames 
        });
      } else if (apiType.type === 'services' && apiType.serviceNames) {
        routerContent = generateServicesT3RouterContent({ 
          moduleName, 
          operations: apiType.serviceNames 
        });
      } else {
        routerContent = generateT3RouterContent({ moduleName });
      }
      
      await writeFile({ filePath: routerFilePath, content: routerContent });
      generatedFiles.push({
        fileName: routerFileName,
        filePath: routerFilePath,
        content: routerContent,
      });
    }
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
      const routesContent = generateRouteContent({ moduleName, apiType, framework });
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
