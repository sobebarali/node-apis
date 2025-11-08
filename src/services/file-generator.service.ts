/**
 * File generation service
 */

import * as path from 'path';
import { ApiType, GeneratedFile } from '../types/common.types';
import { fileExists, writeFile } from '../filesystem/file.operations';
import { ensureDirectory } from '../filesystem/directory.operations';
import { getCrudFileNames, generateCrudFileContent } from '../templates/shared/crud.templates';

/**
 * Gets the test types for each operation
 */
const getTestTypesForOperation = (operation: string): string[] => {
  switch (operation) {
    case 'create':
      return ['success', 'validation', 'duplicate', 'unauthorized'];
    case 'get':
      return ['success', 'not-found', 'invalid-id', 'unauthorized'];
    case 'list':
      return ['success', 'validation', 'unauthorized'];
    case 'update':
      return ['success', 'validation', 'not-found', 'unauthorized'];
    case 'delete':
      return ['success', 'not-found', 'invalid-id', 'unauthorized'];
    default:
      return ['success', 'validation', 'errors'];
  }
};

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
      case 't3':
        // For T3, we use a different structure entirely
        // This would be handled separately in the T3 generation process
        // For now, we'll return an empty array as T3 generation is not part of this function
        return generatedFiles;
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
      case 't3':
        // For T3, we use a different structure entirely
        // This would be handled separately in the T3 generation process
        // For now, we'll return an empty array as T3 generation is not part of this function
        return generatedFiles;
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
    if (framework === 't3') {
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
  appendMode = false,
  trpcStyle = false,
  framework = 'express',
}: {
  moduleName: string;
  testPath: string;
  apiType: ApiType;
  appendMode?: boolean;
  trpcStyle?: boolean;
  framework?: string;
}): Promise<GeneratedFile[]> => {
  const generatedFiles: GeneratedFile[] = [];
  const moduleTestDir = path.join(testPath, moduleName);

  if (apiType.type === 'crud') {
    const crudOperations = ['create', 'get', 'list', 'update', 'delete'];

    if (trpcStyle || framework === 't3') {
      // Generate tRPC-style tests
      if (framework === 't3') {
        // T3 framework: Use modular test structure (success/validation/failure folders)
        for (const operation of crudOperations) {
          const operationDir = path.join(moduleTestDir, operation);
          await ensureDirectory({ dirPath: operationDir });

          // Create subdirectories for each test category
          const successDir = path.join(operationDir, 'success');
          const validationDir = path.join(operationDir, 'validation');
          const failureDir = path.join(operationDir, 'failure');

          await ensureDirectory({ dirPath: successDir });
          await ensureDirectory({ dirPath: validationDir });
          await ensureDirectory({ dirPath: failureDir });

          // Define test files for each category
          const testFiles = [
            'success/basic.test.ts',
            'success/variations.test.ts',
            'validation/required.test.ts',
            'validation/types.test.ts',
          ];

          // Add operation-specific failure tests
          if (operation === 'create') {
            testFiles.push('failure/duplicate.test.ts');
            testFiles.push('failure/unauthorized.test.ts');
          } else if (operation === 'list') {
            testFiles.push('failure/unauthorized.test.ts');
          } else {
            // get, update, delete operations
            testFiles.push('failure/not-found.test.ts');
            testFiles.push('failure/unauthorized.test.ts');
          }

          // Generate each test file
          for (const testFile of testFiles) {
            const testFilePath = path.join(operationDir, testFile);

            if (!appendMode || !(await fileExists({ filePath: testFilePath }))) {
              const t3TestModule = await import('../templates/t3/tests');
              const testContent = t3TestModule.generateSpecificTestContent({
                operation,
                testType: testFile, // Pass the full path like "success/basic.test.ts"
                moduleName
              });

              await writeFile({ filePath: testFilePath, content: testContent });
              generatedFiles.push({
                fileName: testFile,
                filePath: testFilePath,
                content: testContent,
              });
            }
          }
        }
      } else {
        // Regular tRPC: Use flat test structure
        const testTypes = ['procedure.test.ts', 'validation.test.ts', 'errors.test.ts'];

        for (const operation of crudOperations) {
          const operationDir = path.join(moduleTestDir, operation);
          await ensureDirectory({ dirPath: operationDir });

          for (const testType of testTypes) {
            const testFilePath = path.join(operationDir, testType);

            if (!appendMode || !(await fileExists({ filePath: testFilePath }))) {
              const trpcTestModule = await import('../templates/trpc.tests');
              const testContent = trpcTestModule.generateTrpcTestContent({ operation: operation, testType: testType, moduleName: moduleName });

              await writeFile({ filePath: testFilePath, content: testContent });
              generatedFiles.push({
                fileName: testType,
                filePath: testFilePath,
                content: testContent,
              });
            }
          }
        }
      }

      // Generate shared tRPC helpers (only for non-T3 frameworks)
      if (framework !== 't3') {
        const sharedDir = path.join(moduleTestDir, 'shared');
        await ensureDirectory({ dirPath: sharedDir });
        
        const helpersFilePath = path.join(sharedDir, 'trpc-helpers.ts');
        if (!appendMode || !(await fileExists({ filePath: helpersFilePath }))) {
          const trpcTestModule = await import('../templates/trpc.tests');
          const helpersContent = trpcTestModule.generateTrpcTestContent({ 
            operation: '', 
            testType: 'trpc-helpers.ts', 
            moduleName 
          });
          await writeFile({ filePath: helpersFilePath, content: helpersContent });
          generatedFiles.push({
            fileName: 'trpc-helpers.ts',
            filePath: helpersFilePath,
            content: helpersContent,
          });
        }
      }
    } else {
      // Generate REST-style tests - multiple specialized test files per operation
      for (const operation of crudOperations) {
        const operationDir = path.join(moduleTestDir, operation);

        // Ensure operation directory exists
        await ensureDirectory({ dirPath: operationDir });

        // Get test types for this operation
        const testTypes = getTestTypesForOperation(operation);

        for (const testType of testTypes) {
          const testFileName = `${testType}.test.ts`;
          const testFilePath = path.join(operationDir, testFileName);

          if (!appendMode || !(await fileExists({ filePath: testFilePath }))) {
            let testContent;
            if (framework === 'hono') {
              const honoTestModule = await import('../templates/hono/crud/tests');
              testContent = honoTestModule.generateCrudTestContent({ 
                operation, 
                moduleName, 
                testType: testType as 'success' | 'validation' | 'duplicate' | 'unauthorized' | 'not-found' | 'invalid-id'
              });
            } else {
              const expressTestModule = await import('../templates/express/crud/tests');
              testContent = expressTestModule.generateCrudTestContent({ 
                operation, 
                moduleName, 
                testType: testType as 'success' | 'validation' | 'duplicate' | 'unauthorized' | 'not-found' | 'invalid-id'
              });
            }
            await writeFile({ filePath: testFilePath, content: testContent });
            generatedFiles.push({
              fileName: testFileName,
              filePath: testFilePath,
              content: testContent,
            });
          }
        }
      }
    }
  } else if (apiType.type === 'custom' && apiType.customNames) {
    if (trpcStyle || framework === 't3') {
      // Generate tRPC-style tests for custom operations
      if (framework === 't3') {
        // T3 framework: Use modular test structure for custom operations
        for (const customName of apiType.customNames) {
          const operationDir = path.join(moduleTestDir, customName);
          await ensureDirectory({ dirPath: operationDir });

          // Create subdirectories for each test category
          const successDir = path.join(operationDir, 'success');
          const validationDir = path.join(operationDir, 'validation');
          const failureDir = path.join(operationDir, 'failure');

          await ensureDirectory({ dirPath: successDir });
          await ensureDirectory({ dirPath: validationDir });
          await ensureDirectory({ dirPath: failureDir });

          // Define test files for custom operations (generic structure)
          const testFiles = [
            'success/basic.test.ts',
            'success/variations.test.ts',
            'validation/required.test.ts',
            'validation/types.test.ts',
            'failure/unauthorized.test.ts', // All custom operations get unauthorized test
          ];

          // Generate each test file
          for (const testFile of testFiles) {
            const testFilePath = path.join(operationDir, testFile);

            if (!appendMode || !(await fileExists({ filePath: testFilePath }))) {
              const t3TestModule = await import('../templates/t3/tests');
              const testContent = t3TestModule.generateSpecificTestContent({
                operation: customName,
                testType: testFile,
                moduleName
              });

              await writeFile({ filePath: testFilePath, content: testContent });
              generatedFiles.push({
                fileName: testFile,
                filePath: testFilePath,
                content: testContent,
              });
            }
          }
        }
      } else {
        // Regular tRPC: Use flat test structure
        const testTypes = ['procedure.test.ts', 'validation.test.ts', 'errors.test.ts'];

        for (const customName of apiType.customNames) {
          const operationDir = path.join(moduleTestDir, customName);
          await ensureDirectory({ dirPath: operationDir });

          for (const testType of testTypes) {
            const testFilePath = path.join(operationDir, testType);

            if (!appendMode || !(await fileExists({ filePath: testFilePath }))) {
              const trpcTestModule = await import('../templates/trpc.tests');
              const testContent = trpcTestModule.generateTrpcTestContent({
                operation: customName,
                testType,
                moduleName
              });

              await writeFile({ filePath: testFilePath, content: testContent });
              generatedFiles.push({
                fileName: testType,
                filePath: testFilePath,
                content: testContent,
              });
            }
          }
        }
      }
    } else {
      // Generate REST-style tests for custom operations
      for (const customName of apiType.customNames) {
        const operationDir = path.join(moduleTestDir, customName);

        // Ensure operation directory exists
        await ensureDirectory({ dirPath: operationDir });

        // Get test types for custom operations
        const testTypes = ['success', 'validation', 'unauthorized'];

        for (const testType of testTypes) {
          const testFileName = `${testType}.test.ts`;
          const testFilePath = path.join(operationDir, testFileName);

          if (!appendMode || !(await fileExists({ filePath: testFilePath }))) {
            let testContent;
            if (framework === 'hono') {
              const honoTestModule = await import('../templates/hono/custom/tests');
              testContent = honoTestModule.generateCustomTestContent({ 
                operation: customName, 
                moduleName, 
                testType: testType as 'success' | 'validation' | 'unauthorized'
              });
            } else {
              const expressTestModule = await import('../templates/express/custom/tests');
              testContent = expressTestModule.generateCustomTestContent({ 
                operation: customName, 
                moduleName, 
                testType: testType as 'success' | 'validation' | 'unauthorized'
              });
            }
            await writeFile({ filePath: testFilePath, content: testContent });
            generatedFiles.push({
              fileName: testFileName,
              filePath: testFilePath,
              content: testContent,
            });
          }
        }
      }
    }
  } else if (apiType.type === 'services' && apiType.serviceNames) {
    if (trpcStyle || framework === 't3') {
      // Generate tRPC-style tests for service operations
      if (framework === 't3') {
        // T3 framework: Use modular test structure for service operations
        for (const serviceName of apiType.serviceNames) {
          const operationDir = path.join(moduleTestDir, serviceName);
          await ensureDirectory({ dirPath: operationDir });

          // Create subdirectories for each test category
          const successDir = path.join(operationDir, 'success');
          const validationDir = path.join(operationDir, 'validation');
          const failureDir = path.join(operationDir, 'failure');

          await ensureDirectory({ dirPath: successDir });
          await ensureDirectory({ dirPath: validationDir });
          await ensureDirectory({ dirPath: failureDir });

          // Define test files for service operations
          const testFiles = [
            'success/basic.test.ts',
            'success/variations.test.ts',
            'validation/required.test.ts',
            'validation/types.test.ts',
            'failure/unauthorized.test.ts',
          ];

          // Generate each test file
          for (const testFile of testFiles) {
            const testFilePath = path.join(operationDir, testFile);

            if (!appendMode || !(await fileExists({ filePath: testFilePath }))) {
              const t3TestModule = await import('../templates/t3/tests');
              const testContent = t3TestModule.generateSpecificTestContent({
                operation: serviceName,
                testType: testFile,
                moduleName
              });

              await writeFile({ filePath: testFilePath, content: testContent });
              generatedFiles.push({
                fileName: testFile,
                filePath: testFilePath,
                content: testContent,
              });
            }
          }
        }
      } else {
        // Regular tRPC: Use flat test structure
        const testTypes = ['procedure.test.ts', 'validation.test.ts', 'errors.test.ts'];

        for (const serviceName of apiType.serviceNames) {
          const operationDir = path.join(moduleTestDir, serviceName);
          await ensureDirectory({ dirPath: operationDir });

          for (const testType of testTypes) {
            const testFilePath = path.join(operationDir, testType);

            if (!appendMode || !(await fileExists({ filePath: testFilePath }))) {
              const trpcTestModule = await import('../templates/trpc.tests');
              const testContent = trpcTestModule.generateTrpcTestContent({
                operation: serviceName,
                testType,
                moduleName
              });

              await writeFile({ filePath: testFilePath, content: testContent });
              generatedFiles.push({
                fileName: testType,
                filePath: testFilePath,
                content: testContent,
              });
            }
          }
        }
      }
    } else {
      // Generate REST-style tests for service operations
      for (const serviceName of apiType.serviceNames) {
        const operationDir = path.join(moduleTestDir, serviceName);

        // Ensure operation directory exists
        await ensureDirectory({ dirPath: operationDir });

        const testFileName = `${serviceName}.test.ts`;
        const testFilePath = path.join(operationDir, testFileName);

        if (!appendMode || !(await fileExists({ filePath: testFilePath }))) {
          // Generate comprehensive test content for services
          const servicesTestsModule = await import('../templates/services.tests');
          const testContent = servicesTestsModule.generateServiceComprehensiveTestContent({ serviceName, moduleName });
          await writeFile({ filePath: testFilePath, content: testContent });
          generatedFiles.push({
            fileName: testFileName,
            filePath: testFilePath,
            content: testContent,
          });
        }
      }
    }
  }


  return generatedFiles;
};
