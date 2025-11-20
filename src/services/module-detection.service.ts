/**
 * Module detection service
 */

import * as path from 'path';
import { ExistingModule, ModuleDetectionInput } from '../types/common.types';
import { PathsConfig, SupportedFramework } from '../types/config.types';
import { getEffectiveFramework, getApisDir } from './config.service';
import { getModulePath } from '../filesystem/path.utils';
import { directoryExists, getDirectories } from '../filesystem/directory.operations';
import { getFilesWithExtension } from '../filesystem/file.operations';

/**
 * Detects if a module already exists and returns information about it
 */
export const detectExistingModule = async ({
  moduleName,
  baseDir = process.cwd(),
  framework,
}: ModuleDetectionInput & { framework?: SupportedFramework }): Promise<ExistingModule | null> => {
  // Get effective framework if not provided
  const effectiveFramework = framework || await getEffectiveFramework();
  const modulePath = await getModulePath({ moduleName, baseDir, framework: effectiveFramework });
  const exists = await directoryExists({ dirPath: modulePath });

  if (!exists) {
    return null;
  }

  const typesDir = path.join(modulePath, 'types');
  const hasTypes = await directoryExists({ dirPath: typesDir });

  let existingFiles: string[] = [];
  if (hasTypes) {
    existingFiles = await getFilesWithExtension({
      dirPath: typesDir,
      extension: '.ts',
    });
  }

  return {
    moduleName,
    modulePath,
    existingFiles,
    hasTypes,
  };
};

/**
 * Gets a list of existing modules in the project
 */
export const getExistingModules = async ({
  baseDir = process.cwd(),
  framework,
}: {
  baseDir?: string;
  framework?: SupportedFramework;
} = {}): Promise<string[]> => {
  // Get configured APIs directory (with framework-specific support)
  const apisRelativePath = await getApisDir(framework ? { framework } : {});
  const apisDir = path.join(baseDir, apisRelativePath);

  const exists = await directoryExists({ dirPath: apisDir });

  if (!exists) {
    return [];
  }

  return await getDirectories({ dirPath: apisDir });
};

/**
 * Detected path information
 */
export interface DetectedPaths {
  apisDir?: string;
  testsDir?: string;
  srcDir?: string;
  detectedFramework?: string;
}

/**
 * Detects existing API and test directory structure in the project
 */
export const detectExistingApiStructure = async ({
  baseDir = process.cwd(),
}: {
  baseDir?: string;
} = {}): Promise<DetectedPaths> => {
  const detected: DetectedPaths = {};

  // Detect source directory
  const { detectSourcePath } = await import('../filesystem/path.utils');
  const srcPath = await detectSourcePath(baseDir);
  detected.srcDir = srcPath;

  // Common API directory patterns to check
  const apiDirPatterns = [
    { path: path.join(baseDir, srcPath, 'apis'), framework: 'express' },
    { path: path.join(baseDir, srcPath, 'server', 'api'), framework: 't3' },
    { path: path.join(baseDir, srcPath, 'routers'), framework: 'tanstack' },
    { path: path.join(baseDir, 'src', 'apis'), framework: 'express' },
    { path: path.join(baseDir, 'api'), framework: 'express' },
  ];

  // Check for existing API directories
  for (const pattern of apiDirPatterns) {
    const exists = await directoryExists({ dirPath: pattern.path });
    if (exists) {
      // Make path relative to baseDir
      detected.apisDir = path.relative(baseDir, pattern.path);
      detected.detectedFramework = pattern.framework;
      break;
    }
  }

  // Common test directory patterns to check
  const testDirPatterns = [
    path.join(baseDir, 'tests'),
    path.join(baseDir, 'test'),
    path.join(baseDir, '__tests__'),
    path.join(baseDir, srcPath, '__tests__'),
    path.join(baseDir, 'src', '__tests__'),
  ];

  // Check for existing test directories
  for (const testPath of testDirPatterns) {
    const exists = await directoryExists({ dirPath: testPath });
    if (exists) {
      // Make path relative to baseDir
      detected.testsDir = path.relative(baseDir, testPath);
      break;
    }
  }

  return detected;
};

/**
 * Suggests path configuration based on detected structure
 */
export const suggestPathConfiguration = (detected: DetectedPaths): PathsConfig => {
  const config: PathsConfig = {
    srcDir: detected.srcDir || 'src',
  };

  // Add apisDir if detected
  if (detected.apisDir) {
    config.apisDir = detected.apisDir;
  } else {
    // Default based on detected framework
    if (detected.detectedFramework === 't3') {
      config.apisDir = path.join('src', 'server', 'api');
    } else if (detected.detectedFramework === 'tanstack') {
      config.apisDir = path.join('src', 'routers');
    } else {
      config.apisDir = path.join('src', 'apis');
    }
  }

  // Add testsDir if detected
  if (detected.testsDir) {
    config.testsDir = detected.testsDir;
  } else {
    config.testsDir = 'tests';
  }

  // Add default fallback paths for monorepo support
  config.fallbackPaths = [
    path.join('apps', 'server', 'src'),
    path.join('packages', 'api', 'src'),
  ];

  return config;
};
