/**
 * Path utility functions
 */

import * as path from 'path';
import * as fs from 'fs';
import { ModulePathInput, ApiType } from '../types/common.types';
import { SupportedFramework } from '../types/config.types';
import { loadConfig, getApisDir, getTestsDir } from '../services/config.service';

/**
 * Detects the correct source directory path for the project
 */
export const detectSourcePath = async (baseDir: string = process.cwd()): Promise<string> => {
  // Load config to get custom paths
  const config = await loadConfig();
  
  // Default source directory
  const defaultSrcDir = config?.paths?.srcDir || 'src';
  
  // Default fallback paths for common monorepo structures
  const defaultFallbacks = [
    'apps/server/src',
    'packages/api/src',
    'apps/api/src',
    'services/api/src',
    'backend/src',
    'api/src',
  ];
  
  // Get fallback paths from config or use defaults
  const fallbackPaths = config?.paths?.fallbackPaths || defaultFallbacks;
  
  // All paths to check in order
  const pathsToCheck = [defaultSrcDir, ...fallbackPaths];
  
  // Check each path
  for (const srcPath of pathsToCheck) {
    const fullPath = path.join(baseDir, srcPath);
    try {
      const stats = fs.statSync(fullPath);
      if (stats.isDirectory()) {
        // Check if it has an 'apis' directory or could be a valid source directory
        const apisPath = path.join(fullPath, 'apis');
        const hasApis = fs.existsSync(apisPath) && fs.statSync(apisPath).isDirectory();
        
        // Return the path if it has apis directory or if it's the first valid directory
        if (hasApis || srcPath === defaultSrcDir) {
          return srcPath;
        }
        
        // For fallback paths, any directory structure is acceptable
        if (srcPath !== defaultSrcDir) {
          return srcPath;
        }
      }
    } catch (error) {
      // Directory doesn't exist, continue to next path
      continue;
    }
  }
  
  // If nothing found, return the default
  return defaultSrcDir;
};

/**
 * Generates the target directory path for a module
 */
export const getModulePath = async ({
  moduleName,
  baseDir = process.cwd(),
  targetDir,
  framework,
}: ModulePathInput & { targetDir?: string; framework?: SupportedFramework }): Promise<string> => {
  const resolveBasePath = async (base: string) => {
    // Get configured APIs directory (with framework-specific support)
    const apisDir = await getApisDir(framework ? { framework } : {});

    // Join with base directory and module name
    return path.join(base, apisDir, moduleName);
  };

  if (targetDir) {
    if (path.isAbsolute(targetDir)) {
      return resolveBasePath(targetDir);
    }

    const targetBasePath = path.join(baseDir, targetDir);
    return resolveBasePath(targetBasePath);
  }

  return resolveBasePath(baseDir);
};

/**
 * Gets the configured tests directory path
 */
export const getTestsPath = async ({
  baseDir = process.cwd(),
}: {
  baseDir?: string;
} = {}): Promise<string> => {
  // Get configured tests directory
  const testsDir = await getTestsDir({});

  // Join with base directory
  return path.join(baseDir, testsDir);
};

/**
 * Gets the list of subdirectories to create for an API module based on type
 */
export const getModuleSubdirectories = (apiType?: ApiType, trpcStyle?: boolean, framework?: string): string[] => {
  const isTanstackFramework = framework === 'tanstack';
  const isT3StyleFramework = framework === 't3' || isTanstackFramework;

  if (apiType?.type === 'services') {
    if (trpcStyle || isT3StyleFramework) {
      if (isTanstackFramework) {
        // TanStack services keep business logic within services + types
        return ['services', 'types'];
      }
      // tRPC services need procedures/ and types/ folders
      return ['procedures', 'types'];
    }
    // REST services only need services/ and types/ folders
    return ['services', 'types'];
  }

  if (trpcStyle || isT3StyleFramework) {
    if (isTanstackFramework) {
      // TanStack Start keeps logic in handlers + validators alongside types
      return ['handlers', 'types', 'validators'];
    }
    // tRPC APIs need procedures/ instead of controllers/, services not needed
    return ['procedures', 'handlers', 'repository', 'types', 'validators'];
  }

  // REST CRUD and custom APIs - services folder not needed, business logic is in handlers
  return ['controllers', 'handlers', 'repository', 'types', 'validators'];
};
