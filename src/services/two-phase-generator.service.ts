import * as path from 'path';
import { ApiType, GeneratedFile } from '../types/common.types';
import { fileExists, writeFile } from '../filesystem/file.operations';
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
import {
  getCrudHandlerFileNames,
  generateCrudHandlerContent,
} from '../templates/typed-crud.handlers';

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
}: {
  moduleName: string;
  modulePath: string;
  apiType: ApiType;
  framework?: string;
  appendMode?: boolean;
}): Promise<GeneratedFile[]> => {
  const generatedFiles: GeneratedFile[] = [];
  const validatorsDir = path.join(modulePath, 'validators');
  const controllersDir = path.join(modulePath, 'controllers');
  const handlersDir = path.join(modulePath, 'handlers');

  const repositoryDir = path.join(modulePath, 'repository');

  // Parse the type files to get actual field names
  const parsedTypes = await parseModuleTypes(modulePath);

  if (apiType.type === 'crud') {
    const crudValidatorFileNames = getCrudValidatorFileNames({ moduleName });
    const crudControllerFileNames = getCrudControllerFileNames({ moduleName });
    const crudHandlerFileNames = getCrudHandlerFileNames({ moduleName });
    // const crudServiceFileNames = getCrudServiceFileNames({ moduleName }); // Removed - no longer using service layer
    const crudOperations = ['create', 'get', 'list', 'delete', 'update'];

    for (let i = 0; i < crudOperations.length; i++) {
      const validatorFileName = crudValidatorFileNames[i];
      const controllerFileName = crudControllerFileNames[i];
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

      // Generate controller file
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

  // Generate routes file
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

  // Format all generated files
  const filePaths = generatedFiles.map(file => file.filePath);
  await formatGeneratedFiles(filePaths);

  return generatedFiles;
};
