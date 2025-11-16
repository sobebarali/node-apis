/**
 * File generation service
 */

import * as path from 'path';
import { ApiType, GeneratedFile } from '../types/common.types';
import { fileExists, writeFile } from '../filesystem/file.operations';
import { ensureDirectory } from '../filesystem/directory.operations';
import { getCrudFileNames, generateCrudFileContent } from '../templates/shared/crud.templates';

const isT3StyleFramework = (framework?: string): boolean => framework === 't3' || framework === 'tanstack';

/**
 * Generates TypeScript files based on API type (types + validators + controllers + services + repository + routes)
 */
export const generateApiFiles = async ({
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
  const framework = apiType.framework || 'express'; // Default to express if framework is not specified
  const t3StyleFramework = isT3StyleFramework(framework);

  if (t3StyleFramework) {
    // T3/TanStack Start use dedicated two-phase generator flow
    return generatedFiles;
  }

  // Determine the directory structure based on API type
  const typesDir = path.join(modulePath, 'types');
  const validatorsDir = path.join(modulePath, 'validators');
  const controllersDir = path.join(modulePath, 'controllers');
  const repositoryDir = path.join(modulePath, 'repository');

  if (apiType.type === 'crud') {
    // Determine which framework-specific templates to use
    let crudControllerModule, crudValidatorModule;
    
    switch (framework) {
      case 'hono':
        crudControllerModule = await import('../templates/hono/crud/controllers');
        crudValidatorModule = await import('../templates/hono/crud/validators');
        break;
      case 'express':
      default:
        crudControllerModule = await import('../templates/express/crud/controllers');
        crudValidatorModule = await import('../templates/express/crud/validators');
        break;
    }

    // Generate type files
    const crudFileNames = getCrudFileNames({ moduleName });
    const crudValidatorFileNames = crudControllerModule.getCrudValidatorFileNames({ moduleName });
    const crudControllerFileNames = crudControllerModule.getCrudControllerFileNames({ moduleName });

    const crudOperations = ['create', 'get', 'list', 'delete', 'update'];

    for (let i = 0; i < crudFileNames.length; i++) {
      const fileName = crudFileNames[i];
      const validatorFileName = crudValidatorFileNames[i];
      const controllerFileName = crudControllerFileNames[i];

      const operation = crudOperations[i];

      // Generate type file
      const typeFilePath = path.join(typesDir, fileName);
      if (!appendMode || !(await fileExists({ filePath: typeFilePath }))) {
        const typeContent = generateCrudFileContent({ operation, moduleName });
        await writeFile({ filePath: typeFilePath, content: typeContent });
        generatedFiles.push({ fileName, filePath: typeFilePath, content: typeContent });
      }

      // Generate validator file
      const validatorFilePath = path.join(validatorsDir, validatorFileName);
      if (!appendMode || !(await fileExists({ filePath: validatorFilePath }))) {
        const validatorContent = crudValidatorModule.generateCrudValidatorContent({ operation, moduleName });
        await writeFile({ filePath: validatorFilePath, content: validatorContent });
        generatedFiles.push({
          fileName: validatorFileName,
          filePath: validatorFilePath,
          content: validatorContent,
        });
      }

      // Generate controller file
      const controllerFilePath = path.join(controllersDir, controllerFileName);
      if (!appendMode || !(await fileExists({ filePath: controllerFilePath }))) {
        const controllerContent = crudControllerModule.generateCrudControllerContent({ operation, moduleName });
        await writeFile({ filePath: controllerFilePath, content: controllerContent });
        generatedFiles.push({
          fileName: controllerFileName,
          filePath: controllerFilePath,
          content: controllerContent,
        });
      }

      // Generate handler files for each operation (handlers are framework-agnostic)
      // Note: handler files would be generated separately with business logic
    }
  } else if (apiType.type === 'custom' && apiType.customNames) {
    // Determine which framework-specific templates to use
    let customControllerModule, customValidatorModule;
    
    switch (framework) {
      case 'hono':
        customControllerModule = await import('../templates/hono/custom/controllers');
        customValidatorModule = await import('../templates/hono/custom/validators');
        break;
      case 'express':
      default:
        customControllerModule = await import('../templates/express/custom/controllers');
        customValidatorModule = await import('../templates/express/custom/validators');
        break;
    }

    // Generate type files
    const customFileNames = getCrudFileNames({ moduleName }); // Reusing CRUD file naming for types
    const customValidatorFileNames = customControllerModule.getCustomValidatorFileNames({
      moduleName,
      customNames: apiType.customNames,
    });
    const customControllerFileNames = customControllerModule.getCustomControllerFileNames({
      moduleName,
      customNames: apiType.customNames,
    });
    // Custom service files not generated - business logic is now in handlers

    for (let i = 0; i < apiType.customNames.length; i++) {
      const fileName = customFileNames[i % customFileNames.length]; // Cycle through CRUD type files
      const validatorFileName = customValidatorFileNames[i];
      const controllerFileName = customControllerFileNames[i];
      const customName = apiType.customNames[i];

      // Generate type file
      const typeFilePath = path.join(typesDir, fileName.replace('create', customName)); // Replace operation name
      if (!appendMode || !(await fileExists({ filePath: typeFilePath }))) {
        const typeContent = generateCrudFileContent({ operation: customName, moduleName });
        await writeFile({ filePath: typeFilePath, content: typeContent });
        generatedFiles.push({ fileName: fileName.replace('create', customName), filePath: typeFilePath, content: typeContent });
      }

      // Generate validator file
      const validatorFilePath = path.join(validatorsDir, validatorFileName);
      if (!appendMode || !(await fileExists({ filePath: validatorFilePath }))) {
        const validatorContent = customValidatorModule.generateCustomValidatorContent({ operation: customName, moduleName });
        await writeFile({ filePath: validatorFilePath, content: validatorContent });
        generatedFiles.push({
          fileName: validatorFileName,
          filePath: validatorFilePath,
          content: validatorContent,
        });
      }

      // Generate controller file
      const controllerFilePath = path.join(controllersDir, controllerFileName);
      if (!appendMode || !(await fileExists({ filePath: controllerFilePath }))) {
        const controllerContent = customControllerModule.generateCustomControllerContent({ operation: customName, moduleName });
        await writeFile({ filePath: controllerFilePath, content: controllerContent });
        generatedFiles.push({
          fileName: controllerFileName,
          filePath: controllerFilePath,
          content: controllerContent,
        });
      }

      // Generate handler files for custom operations (handlers are framework-agnostic)
      // Note: handler files would be generated separately with business logic
    }
  }

  // Generate repository file
  const repositoryFileName = `${moduleName}.repository.ts`;
  const repositoryFilePath = path.join(repositoryDir, repositoryFileName);
  if (!appendMode || !(await fileExists({ filePath: repositoryFilePath }))) {
    const repositoryModule = framework === 'hono' 
      ? await import('../templates/hono/repository') 
      : await import('../templates/express/repository');
      
    const repositoryContent = repositoryModule.generateRepositoryContent({ moduleName });
    await writeFile({ filePath: repositoryFilePath, content: repositoryContent });
    generatedFiles.push({
      fileName: repositoryFileName,
      filePath: repositoryFilePath,
      content: repositoryContent,
    });
  }

  // Generate route file
  const routeFileName = `${moduleName}.routes.ts`;
  const routeFilePath = path.join(modulePath, routeFileName);
  if (!appendMode || !(await fileExists({ filePath: routeFilePath }))) {
    // Import the appropriate route module based on framework and API type
    let routeModule;
    if (t3StyleFramework) {
      routeModule = await import('../templates/t3/router');
    } else if (framework === 'hono') {
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
    
    const routeContent = routeModule.generateRouteContent({ moduleName, apiType });
    await writeFile({ filePath: routeFilePath, content: routeContent });
    generatedFiles.push({
      fileName: routeFileName,
      filePath: routeFilePath,
      content: routeContent,
    });
  }

  return generatedFiles;
};

/**
 * Generates test files based on API type
 */
export const generateTestFiles = async ({
  moduleName,
  testPath,
  apiType,
  trpcStyle = false,
  framework = 'express',
}: {
  moduleName: string;
  testPath: string;
  apiType: ApiType;
  trpcStyle?: boolean;
  framework?: string;
}): Promise<GeneratedFile[]> => {
  const generatedFiles: GeneratedFile[] = [];
  const t3StyleFramework = isT3StyleFramework(framework);
  
  // Check if there's a "server" directory in the root
  const hasServerDir = await fileExists({ filePath: path.join(testPath, '..', 'server') });
  let moduleTestDir: string;
  
  if (!hasServerDir) {
    // Use tests directory in the root
    const testsDir = path.join(testPath, '..', 'tests');
    await ensureDirectory({ dirPath: testsDir });
    moduleTestDir = path.join(testsDir, moduleName);
  } else {
    // Use tests directory relative to testPath (this might be inside server/)
    moduleTestDir = path.join(testPath, moduleName);
  }

  if (apiType.type === 'crud') {
    const crudOperations = ['create', 'get', 'list', 'update', 'delete'];

    if (trpcStyle || t3StyleFramework) {
      // Generate tRPC-style tests
      if (t3StyleFramework) {
        // T3 framework: Use the new test structure (validators/success/failed folders)
        for (const operation of crudOperations) {
          const operationDir = path.join(moduleTestDir, operation);
          await ensureDirectory({ dirPath: operationDir });

          // Create subdirectories for each test category
          const validatorsDir = path.join(operationDir, 'validators');
          const successDir = path.join(operationDir, 'success');
          const failedDir = path.join(operationDir, 'failed');

          await ensureDirectory({ dirPath: validatorsDir });
          await ensureDirectory({ dirPath: successDir });
          await ensureDirectory({ dirPath: failedDir });
        }
      } else {
        // Regular tRPC: Use the new test structure (validators/success/failed folders)
        for (const operation of crudOperations) {
          const operationDir = path.join(moduleTestDir, operation);
          await ensureDirectory({ dirPath: operationDir });

          // Create subdirectories for each test category
          const validatorsDir = path.join(operationDir, 'validators');
          const successDir = path.join(operationDir, 'success');
          const failedDir = path.join(operationDir, 'failed');

          await ensureDirectory({ dirPath: validatorsDir });
          await ensureDirectory({ dirPath: successDir });
          await ensureDirectory({ dirPath: failedDir });
        }
      }

      // Generate shared tRPC helpers (only for non-T3 frameworks)
      if (!t3StyleFramework) {
        const sharedDir = path.join(moduleTestDir, 'shared');
        await ensureDirectory({ dirPath: sharedDir });

        const validatorsDir = path.join(sharedDir, 'validators');
        const successDir = path.join(sharedDir, 'success');
        const failedDir = path.join(sharedDir, 'failed');

        await ensureDirectory({ dirPath: validatorsDir });
        await ensureDirectory({ dirPath: successDir });
        await ensureDirectory({ dirPath: failedDir });
      }
    } else {
      // Generate REST-style tests - use the new test structure (validators/success/failed folders)
      for (const operation of crudOperations) {
        const operationDir = path.join(moduleTestDir, operation);

        // Ensure operation directory exists
        await ensureDirectory({ dirPath: operationDir });

        // Create subdirectories for each test category
        const validatorsDir = path.join(operationDir, 'validators');
        const successDir = path.join(operationDir, 'success');
        const failedDir = path.join(operationDir, 'failed');

        await ensureDirectory({ dirPath: validatorsDir });
        await ensureDirectory({ dirPath: successDir });
        await ensureDirectory({ dirPath: failedDir });
      }
    }
  } else if (apiType.type === 'custom' && apiType.customNames) {
    if (trpcStyle || t3StyleFramework) {
      // Generate tRPC-style tests for custom operations
      if (t3StyleFramework) {
        // T3 framework: Use the new test structure (validators/success/failed folders)
        for (const customName of apiType.customNames) {
          const operationDir = path.join(moduleTestDir, customName);
          await ensureDirectory({ dirPath: operationDir });

          // Create subdirectories for each test category
          const validatorsDir = path.join(operationDir, 'validators');
          const successDir = path.join(operationDir, 'success');
          const failedDir = path.join(operationDir, 'failed');

          await ensureDirectory({ dirPath: validatorsDir });
          await ensureDirectory({ dirPath: successDir });
          await ensureDirectory({ dirPath: failedDir });
        }
      } else {
        // Regular tRPC: Use the new test structure (validators/success/failed folders)
        for (const customName of apiType.customNames) {
          const operationDir = path.join(moduleTestDir, customName);
          await ensureDirectory({ dirPath: operationDir });

          // Create subdirectories for each test category
          const validatorsDir = path.join(operationDir, 'validators');
          const successDir = path.join(operationDir, 'success');
          const failedDir = path.join(operationDir, 'failed');

          await ensureDirectory({ dirPath: validatorsDir });
          await ensureDirectory({ dirPath: successDir });
          await ensureDirectory({ dirPath: failedDir });
        }
      }
    } else {
      // Generate REST-style tests for custom operations
      for (const customName of apiType.customNames) {
        const operationDir = path.join(moduleTestDir, customName);

        // Ensure operation directory exists
        await ensureDirectory({ dirPath: operationDir });

        // Create subdirectories for each test category
        const validatorsDir = path.join(operationDir, 'validators');
        const successDir = path.join(operationDir, 'success');
        const failedDir = path.join(operationDir, 'failed');

        await ensureDirectory({ dirPath: validatorsDir });
        await ensureDirectory({ dirPath: successDir });
        await ensureDirectory({ dirPath: failedDir });
      }
    }
  } else if (apiType.type === 'services' && apiType.serviceNames) {
    if (trpcStyle || t3StyleFramework) {
      // Generate tRPC-style tests for service operations
      if (t3StyleFramework) {
        // T3 framework: Use the new test structure (validators/success/failed folders)
        for (const serviceName of apiType.serviceNames) {
          const operationDir = path.join(moduleTestDir, serviceName);
          await ensureDirectory({ dirPath: operationDir });

          // Create subdirectories for each test category
          const validatorsDir = path.join(operationDir, 'validators');
          const successDir = path.join(operationDir, 'success');
          const failedDir = path.join(operationDir, 'failed');

          await ensureDirectory({ dirPath: validatorsDir });
          await ensureDirectory({ dirPath: successDir });
          await ensureDirectory({ dirPath: failedDir });
        }
      } else {
        // Regular tRPC: Use the new test structure (validators/success/failed folders)
        for (const serviceName of apiType.serviceNames) {
          const operationDir = path.join(moduleTestDir, serviceName);
          await ensureDirectory({ dirPath: operationDir });

          // Create subdirectories for each test category
          const validatorsDir = path.join(operationDir, 'validators');
          const successDir = path.join(operationDir, 'success');
          const failedDir = path.join(operationDir, 'failed');

          await ensureDirectory({ dirPath: validatorsDir });
          await ensureDirectory({ dirPath: successDir });
          await ensureDirectory({ dirPath: failedDir });
        }
      }
    } else {
      // Generate REST-style tests for service operations
      for (const serviceName of apiType.serviceNames) {
        const operationDir = path.join(moduleTestDir, serviceName);

        // Ensure operation directory exists
        await ensureDirectory({ dirPath: operationDir });

        // Create subdirectories for each test category
        const validatorsDir = path.join(operationDir, 'validators');
        const successDir = path.join(operationDir, 'success');
        const failedDir = path.join(operationDir, 'failed');

        await ensureDirectory({ dirPath: validatorsDir });
        await ensureDirectory({ dirPath: successDir });
        await ensureDirectory({ dirPath: failedDir });
      }
    }
  }


  return generatedFiles;
};
