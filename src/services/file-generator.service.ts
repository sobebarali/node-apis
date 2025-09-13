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
import { generateTrpcTestContent, getTrpcTestFileNames } from '../templates/trpc.tests';
import {
  generateServiceValidationTestContent,
  generateServiceSuccessTestContent,
  generateServiceErrorTestContent,
  generateServiceTestHelpersContent,
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
  
  // Only create services directory for 'services' API type
  const servicesDir = apiType.type === 'services' ? path.join(modulePath, 'services') : '';

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
}: {
  moduleName: string;
  testPath: string;
  apiType: ApiType;
  appendMode?: boolean;
  trpcStyle?: boolean;
}): Promise<GeneratedFile[]> => {
  const generatedFiles: GeneratedFile[] = [];
  const moduleTestDir = path.join(testPath, moduleName);

  if (apiType.type === 'crud') {
    const crudOperations = ['create', 'get', 'list', 'update', 'delete'];

    if (trpcStyle) {
      // Generate tRPC-style tests
      const testTypes = ['procedure.test.ts', 'validation.test.ts', 'errors.test.ts'];

      for (const operation of crudOperations) {
        const operationDir = path.join(moduleTestDir, operation);

        // Ensure operation directory exists
        await ensureDirectory({ dirPath: operationDir });

        for (const testType of testTypes) {
          const testFilePath = path.join(operationDir, testType);

          if (!appendMode || !(await fileExists({ filePath: testFilePath }))) {
            const testContent = generateTrpcTestContent({ operation, testType, moduleName });
            await writeFile({ filePath: testFilePath, content: testContent });
            generatedFiles.push({
              fileName: testType,
              filePath: testFilePath,
              content: testContent,
            });
          }
        }
      }

      // Generate shared tRPC helpers
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
    } else {
      // Generate REST-style tests
      const testTypes: ('validation' | 'success' | 'errors')[] = ['validation', 'success', 'errors'];

      for (const operation of crudOperations) {
        const operationDir = path.join(moduleTestDir, operation);

        // Ensure operation directory exists
        await ensureDirectory({ dirPath: operationDir });

        for (const testType of testTypes) {
          const testFileName = `${testType}.test.ts`;
          const testFilePath = path.join(operationDir, testFileName);

          if (!appendMode || !(await fileExists({ filePath: testFilePath }))) {
            const testContent = generateCrudTestContent({ operation, moduleName, testType });
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
    // TODO: Add tRPC-specific custom test templates
    // For now, custom operations use REST-style tests even with tRPC
    const testTypes: ('validation' | 'success' | 'errors')[] = ['validation', 'success', 'errors'];

    for (const customName of apiType.customNames) {
      const operationDir = path.join(moduleTestDir, customName);

      // Ensure operation directory exists
      await ensureDirectory({ dirPath: operationDir });

      for (const testType of testTypes) {
        const testFileName = `${testType}.test.ts`;
        const testFilePath = path.join(operationDir, testFileName);

        if (!appendMode || !(await fileExists({ filePath: testFilePath }))) {
          const testContent = generateCustomTestContent({ customName, moduleName, testType });
          await writeFile({ filePath: testFilePath, content: testContent });
          generatedFiles.push({
            fileName: testFileName,
            filePath: testFilePath,
            content: testContent,
          });
        }
      }
    }
  } else if (apiType.type === 'services' && apiType.serviceNames) {
    const testTypes: ('validation' | 'success' | 'errors')[] = ['validation', 'success', 'errors'];

    for (const serviceName of apiType.serviceNames) {
      const operationDir = path.join(moduleTestDir, serviceName);

      // Ensure operation directory exists
      await ensureDirectory({ dirPath: operationDir });

      for (const testType of testTypes) {
        const testFileName = `${testType}.test.ts`;
        const testFilePath = path.join(operationDir, testFileName);

        if (!appendMode || !(await fileExists({ filePath: testFilePath }))) {
          let testContent: string;

          if (testType === 'validation') {
            testContent = generateServiceValidationTestContent({ serviceName, moduleName });
          } else if (testType === 'success') {
            testContent = generateServiceSuccessTestContent({ serviceName, moduleName });
          } else {
            testContent = generateServiceErrorTestContent({ serviceName, moduleName });
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

  // Generate shared helpers
  const sharedDir = path.join(moduleTestDir, 'shared');
  const helpersFileName = 'helpers.ts';
  const helpersFilePath = path.join(sharedDir, helpersFileName);

  // Ensure shared directory exists
  await ensureDirectory({ dirPath: sharedDir });

  if (!appendMode || !(await fileExists({ filePath: helpersFilePath }))) {
    let helpersContent: string;

    if (apiType.type === 'crud') {
      helpersContent = generateCrudTestContent({
        operation: 'create',
        moduleName,
        testType: 'helpers',
      });
    } else if (apiType.type === 'custom') {
      helpersContent = generateCustomTestContent({
        customName: 'default',
        moduleName,
        testType: 'helpers',
      });
    } else if (apiType.type === 'services' && apiType.serviceNames) {
      helpersContent = generateServiceTestHelpersContent({
        moduleName,
        serviceNames: apiType.serviceNames,
      });
    } else {
      helpersContent = '// No helpers generated for this API type';
    }

    await writeFile({ filePath: helpersFilePath, content: helpersContent });
    generatedFiles.push({
      fileName: helpersFileName,
      filePath: helpersFilePath,
      content: helpersContent,
    });
  }

  return generatedFiles;
};
