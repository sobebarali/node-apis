/**
 * Path utility functions
 */

import * as path from 'path';
import * as fs from 'fs';
import { ModulePathInput, ApiType } from '../types/common.types';
import { loadConfig } from '../services/config.service';

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
}: ModulePathInput & { targetDir?: string; framework?: string }): Promise<string> => {
  const resolveBasePath = async (base: string) => {
    const srcPath = await detectSourcePath(base);

    if (framework === 't3') {
      return path.join(base, srcPath, 'server', 'api', moduleName);
    }

    if (framework === 'tanstack') {
      return path.join(base, srcPath, moduleName);
    }

    return path.join(base, srcPath, 'apis', moduleName);
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
 * Gets the list of subdirectories to create for an API module based on type
 */
export const getModuleSubdirectories = (apiType?: ApiType, trpcStyle?: boolean, framework?: string): string[] => {
  const isT3StyleFramework = framework === 't3' || framework === 'tanstack';

  if (apiType?.type === 'services') {
    if (trpcStyle || isT3StyleFramework) {
      // tRPC services need procedures/ and types/ folders
      return ['procedures', 'types'];
    }
    // REST services only need services/ and types/ folders
    return ['services', 'types'];
  }

  if (trpcStyle || isT3StyleFramework) {
    // tRPC APIs need procedures/ instead of controllers/, services not needed
    return ['procedures', 'handlers', 'repository', 'types', 'validators'];
  }

  // REST CRUD and custom APIs - services folder not needed, business logic is in handlers
  return ['controllers', 'handlers', 'repository', 'types', 'validators'];
};
