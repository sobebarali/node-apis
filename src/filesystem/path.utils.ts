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
    'backend/src'
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
  if (targetDir) {
    // If targetDir is absolute, use it directly with detected source path
    if (path.isAbsolute(targetDir)) {
      const srcPath = await detectSourcePath(targetDir);
      if (framework === 't3') {
        return path.join(targetDir, srcPath, 'server', 'api', moduleName);
      }
      return path.join(targetDir, srcPath, 'apis', moduleName);
    }
    // If targetDir is relative, resolve it from baseDir with detected source path
    const targetBasePath = path.join(baseDir, targetDir);
    const srcPath = await detectSourcePath(targetBasePath);
    if (framework === 't3') {
      return path.join(targetBasePath, srcPath, 'server', 'api', moduleName);
    }
    return path.join(targetBasePath, srcPath, 'apis', moduleName);
  }

  // Default behavior: detect source path and use it
  const srcPath = await detectSourcePath(baseDir);
  if (framework === 't3') {
    return path.join(baseDir, srcPath, 'server', 'api', moduleName);
  }
  return path.join(baseDir, srcPath, 'apis', moduleName);
};

/**
 * Gets the list of subdirectories to create for an API module based on type
 */
export const getModuleSubdirectories = (apiType?: ApiType, trpcStyle?: boolean, framework?: string): string[] => {
  if (apiType?.type === 'services') {
    if (trpcStyle || framework === 't3') {
      // tRPC services need procedures/ and types/ folders
      return ['procedures', 'types'];
    }
    // REST services only need services/ and types/ folders
    return ['services', 'types'];
  }

  if (trpcStyle || framework === 't3') {
    // tRPC APIs need procedures/ instead of controllers/, services not needed
    return ['procedures', 'handlers', 'repository', 'types', 'validators'];
  }

  // REST CRUD and custom APIs - services folder not needed, business logic is in handlers
  return ['controllers', 'handlers', 'repository', 'types', 'validators'];
};
