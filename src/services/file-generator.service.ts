/**
 * File generation service
 */

import * as path from 'path';
import { ApiType, GeneratedFile } from '../types/common.types';
import { fileExists, writeFile } from '../filesystem/file.operations';
import { ensureDirectory } from '../filesystem/directory.operations';
import { getCrudFileNames, generateCrudFileContent } from '../templates/crud.templates';
import { getCustomFileNames, generateCustomFileContent } from '../templates/custom.templates';
import {
  getCrudValidatorFileNames,
  generateCrudValidatorContent,
} from '../templates/crud.validators';
import {
  getCustomValidatorFileNames,
  generateCustomValidatorContent,
} from '../templates/custom.validators';
import {
  getCrudControllerFileNames,
  generateCrudControllerContent,
} from '../templates/crud.controllers';
import {
  getCustomControllerFileNames,
  generateCustomControllerContent,
} from '../templates/custom.controllers';

// Custom services not generated - business logic is now in handlers
import { generateRouteContent } from '../templates/routes.templates';
import { generateRepositoryContent } from '../templates/repository.templates';
import { generateCrudTestContent } from '../templates/crud.tests';
import { generateCustomTestContent } from '../templates/custom.tests';
import { generateTrpcTestContent } from '../templates/trpc.tests';
import { generateT3TestContent } from '../templates/t3.tests';

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
import {
  generateServiceComprehensiveTestContent,
} from '../templates/services.tests';

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
  const typesDir = path.join(modulePath, 'types');
  const validatorsDir = path.join(modulePath, 'validators');
  const controllersDir = path.join(modulePath, 'controllers');
  const repositoryDir = path.join(modulePath, 'repository');

  if (apiType.type === 'crud') {
    // Generate type files
    const crudFileNames = getCrudFileNames({ moduleName });
    const crudValidatorFileNames = getCrudValidatorFileNames({ moduleName });
    const crudControllerFileNames = getCrudControllerFileNames({ moduleName });

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
        const validatorContent = generateCrudValidatorContent({ operation, moduleName });
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
        const controllerContent = generateCrudControllerContent({ operation, moduleName });
        await writeFile({ filePath: controllerFilePath, content: controllerContent });
        generatedFiles.push({
          fileName: controllerFileName,
          filePath: controllerFilePath,
          content: controllerContent,
        });
      }

      // Skip service generation - business logic is now in handlers
    }
  } else if (apiType.type === 'custom' && apiType.customNames) {
    // Generate type files
    const customFileNames = getCustomFileNames({
      customNames: apiType.customNames,
      moduleName,
    });
    const customValidatorFileNames = getCustomValidatorFileNames({
      customNames: apiType.customNames,
      moduleName,
    });
    const customControllerFileNames = getCustomControllerFileNames({
      customNames: apiType.customNames,
      moduleName,
    });
    // Custom service files not generated - business logic is now in handlers

    for (let i = 0; i < customFileNames.length; i++) {
      const fileName = customFileNames[i];
      const validatorFileName = customValidatorFileNames[i];
      const controllerFileName = customControllerFileNames[i];
      const customName = apiType.customNames[i];

      // Generate type file
      const typeFilePath = path.join(typesDir, fileName);
      if (!appendMode || !(await fileExists({ filePath: typeFilePath }))) {
        const typeContent = generateCustomFileContent({ customName, moduleName });
        await writeFile({ filePath: typeFilePath, content: typeContent });
        generatedFiles.push({ fileName, filePath: typeFilePath, content: typeContent });
      }

      // Generate validator file
      const validatorFilePath = path.join(validatorsDir, validatorFileName);
      if (!appendMode || !(await fileExists({ filePath: validatorFilePath }))) {
        const validatorContent = generateCustomValidatorContent({ customName, moduleName });
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
        const controllerContent = generateCustomControllerContent({ customName, moduleName });
        await writeFile({ filePath: controllerFilePath, content: controllerContent });
        generatedFiles.push({
          fileName: controllerFileName,
          filePath: controllerFilePath,
          content: controllerContent,
        });
      }

      // Skip service generation for custom APIs - business logic is now in handlers
    }
  }

  // Generate repository file
  const repositoryFileName = `${moduleName}.repository.ts`;
  const repositoryFilePath = path.join(repositoryDir, repositoryFileName);
  if (!appendMode || !(await fileExists({ filePath: repositoryFilePath }))) {
    const repositoryContent = generateRepositoryContent({ moduleName, apiType });
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
    const routeContent = generateRouteContent({ moduleName, apiType });
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
      const testTypes = ['procedure.test.ts', 'validation.test.ts', 'errors.test.ts'];

      for (const operation of crudOperations) {
        const operationDir = path.join(moduleTestDir, operation);

        // Ensure operation directory exists
        await ensureDirectory({ dirPath: operationDir });

        for (const testType of testTypes) {
          const testFilePath = path.join(operationDir, testType);

          if (!appendMode || !(await fileExists({ filePath: testFilePath }))) {
            // Use T3 test templates for T3 framework, otherwise use regular tRPC templates
            const testContent = framework === 't3' 
              ? generateT3TestContent({ operation, testType, moduleName })
              : generateTrpcTestContent({ operation, testType, moduleName });
            
            await writeFile({ filePath: testFilePath, content: testContent });
            generatedFiles.push({
              fileName: testType,
              filePath: testFilePath,
              content: testContent,
            });
          }
        }
      }

      // Generate shared tRPC helpers (only for non-T3 frameworks)
      if (framework !== 't3') {
        const sharedDir = path.join(moduleTestDir, 'shared');
        await ensureDirectory({ dirPath: sharedDir });
        
        const helpersFilePath = path.join(sharedDir, 'trpc-helpers.ts');
        if (!appendMode || !(await fileExists({ filePath: helpersFilePath }))) {
          const helpersContent = generateTrpcTestContent({ 
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
            const testContent = generateCrudTestContent({ 
              operation, 
              moduleName, 
              testType: testType as 'success' | 'validation' | 'duplicate' | 'unauthorized' | 'not-found' | 'invalid-id'
            });
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
      const testTypes = ['procedure.test.ts', 'validation.test.ts', 'errors.test.ts'];

      for (const customName of apiType.customNames) {
        const operationDir = path.join(moduleTestDir, customName);

        // Ensure operation directory exists
        await ensureDirectory({ dirPath: operationDir });

        for (const testType of testTypes) {
          const testFilePath = path.join(operationDir, testType);

          if (!appendMode || !(await fileExists({ filePath: testFilePath }))) {
            // Use T3 test templates for T3 framework, otherwise use regular tRPC templates
            const testContent = framework === 't3' 
              ? generateT3TestContent({ operation: customName, testType, moduleName })
              : generateTrpcTestContent({ operation: customName, testType, moduleName });
            
            await writeFile({ filePath: testFilePath, content: testContent });
            generatedFiles.push({
              fileName: testType,
              filePath: testFilePath,
              content: testContent,
            });
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
            const testContent = generateCustomTestContent({ 
              customName, 
              moduleName, 
              testType: testType as 'success' | 'validation' | 'unauthorized'
            });
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
      const testTypes = ['procedure.test.ts', 'validation.test.ts', 'errors.test.ts'];

      for (const serviceName of apiType.serviceNames) {
        const operationDir = path.join(moduleTestDir, serviceName);

        // Ensure operation directory exists
        await ensureDirectory({ dirPath: operationDir });

        for (const testType of testTypes) {
          const testFilePath = path.join(operationDir, testType);

          if (!appendMode || !(await fileExists({ filePath: testFilePath }))) {
            // Use T3 test templates for T3 framework, otherwise use regular tRPC templates
            const testContent = framework === 't3' 
              ? generateT3TestContent({ operation: serviceName, testType, moduleName })
              : generateTrpcTestContent({ operation: serviceName, testType, moduleName });
            
            await writeFile({ filePath: testFilePath, content: testContent });
            generatedFiles.push({
              fileName: testType,
              filePath: testFilePath,
              content: testContent,
            });
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
          const testContent = generateServiceComprehensiveTestContent({ serviceName, moduleName });
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
