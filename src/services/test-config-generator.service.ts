/**
 * Test configuration generator service
 */

import * as path from 'path';
import { fileExists, writeFile } from '../filesystem/file.operations';
import {
  generateVitestConfig,
  generateTestSetup,
  generateTestScripts,
  generateTestDependencies,
  generateTestGitignore,
  generateGitHubWorkflow,
  generateVSCodeSettings,
} from '../templates/test.config';
import { GeneratedFile } from '../types/common.types';

/**
 * Generates test configuration files
 */
export const generateTestConfiguration = async ({
  projectRoot,
  appendMode = false,
}: {
  projectRoot: string;
  appendMode?: boolean;
}): Promise<GeneratedFile[]> => {
  const generatedFiles: GeneratedFile[] = [];

  // Generate vitest.config.ts
  const vitestConfigPath = path.join(projectRoot, 'vitest.config.ts');
  if (!appendMode || !(await fileExists({ filePath: vitestConfigPath }))) {
    const vitestConfigContent = generateVitestConfig();
    await writeFile({ filePath: vitestConfigPath, content: vitestConfigContent });
    generatedFiles.push({
      fileName: 'vitest.config.ts',
      filePath: vitestConfigPath,
      content: vitestConfigContent,
    });
  }

  // Generate test setup file
  const testsDir = path.join(projectRoot, 'tests');
  const setupPath = path.join(testsDir, 'setup.ts');
  if (!appendMode || !(await fileExists({ filePath: setupPath }))) {
    const setupContent = generateTestSetup();
    await writeFile({ filePath: setupPath, content: setupContent });
    generatedFiles.push({
      fileName: 'setup.ts',
      filePath: setupPath,
      content: setupContent,
    });
  }

  return generatedFiles;
};

/**
 * Updates package.json with test scripts and dependencies
 */
export const updatePackageJsonForTests = async ({
  packageJsonPath,
  appendMode = false,
}: {
  packageJsonPath: string;
  appendMode?: boolean;
}): Promise<{
  updated: boolean;
  scripts: Record<string, string>;
  devDependencies: Record<string, string>;
}> => {
  if (!(await fileExists({ filePath: packageJsonPath }))) {
    throw new Error('package.json not found');
  }

  const fs = await import('fs-extra');
  const packageJson = await fs.readJson(packageJsonPath);

  const testScripts = generateTestScripts();
  const testDependencies = generateTestDependencies();

  let updated = false;

  // Add test scripts
  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }

  for (const [scriptName, scriptCommand] of Object.entries(testScripts)) {
    if (!appendMode || !packageJson.scripts[scriptName]) {
      packageJson.scripts[scriptName] = scriptCommand;
      updated = true;
    }
  }

  // Add test dependencies
  if (!packageJson.devDependencies) {
    packageJson.devDependencies = {};
  }

  for (const [depName, depVersion] of Object.entries(testDependencies)) {
    if (!appendMode || !packageJson.devDependencies[depName]) {
      packageJson.devDependencies[depName] = depVersion;
      updated = true;
    }
  }

  if (updated) {
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  }

  return {
    updated,
    scripts: testScripts,
    devDependencies: testDependencies,
  };
};

/**
 * Generates additional test configuration files
 */
export const generateAdditionalTestConfig = async ({
  projectRoot,
  appendMode = false,
}: {
  projectRoot: string;
  appendMode?: boolean;
}): Promise<GeneratedFile[]> => {
  const generatedFiles: GeneratedFile[] = [];

  // Generate .gitignore entries for tests
  const gitignorePath = path.join(projectRoot, '.gitignore');
  if (await fileExists({ filePath: gitignorePath })) {
    const fs = await import('fs-extra');
    const existingGitignore = await fs.readFile(gitignorePath, 'utf-8');
    const testGitignoreEntries = generateTestGitignore();

    let updatedGitignore = existingGitignore;
    let hasUpdates = false;

    for (const entry of testGitignoreEntries) {
      if (!existingGitignore.includes(entry.replace('# ', ''))) {
        updatedGitignore += `\n${entry}`;
        hasUpdates = true;
      }
    }

    if (hasUpdates) {
      await fs.writeFile(gitignorePath, updatedGitignore);
      generatedFiles.push({
        fileName: '.gitignore',
        filePath: gitignorePath,
        content: updatedGitignore,
      });
    }
  }

  // Generate GitHub Actions workflow
  const workflowsDir = path.join(projectRoot, '.github', 'workflows');
  const workflowPath = path.join(workflowsDir, 'tests.yml');
  if (!appendMode || !(await fileExists({ filePath: workflowPath }))) {
    const workflowContent = generateGitHubWorkflow();
    await writeFile({ filePath: workflowPath, content: workflowContent });
    generatedFiles.push({
      fileName: 'tests.yml',
      filePath: workflowPath,
      content: workflowContent,
    });
  }

  // Generate VSCode settings
  const vscodeDir = path.join(projectRoot, '.vscode');
  const settingsPath = path.join(vscodeDir, 'settings.json');
  if (!appendMode || !(await fileExists({ filePath: settingsPath }))) {
    const vscodeSettings = generateVSCodeSettings();
    const settingsContent = JSON.stringify(vscodeSettings, null, 2);
    await writeFile({ filePath: settingsPath, content: settingsContent });
    generatedFiles.push({
      fileName: 'settings.json',
      filePath: settingsPath,
      content: settingsContent,
    });
  }

  return generatedFiles;
};

/**
 * Generates complete test setup for a project
 */
export const generateCompleteTestSetup = async ({
  projectRoot,
  appendMode = false,
}: {
  projectRoot: string;
  appendMode?: boolean;
}): Promise<{
  configFiles: GeneratedFile[];
  packageJsonUpdated: boolean;
  additionalFiles: GeneratedFile[];
}> => {
  // Generate test configuration files
  const configFiles = await generateTestConfiguration({ projectRoot, appendMode });

  // Update package.json
  const packageJsonPath = path.join(projectRoot, 'package.json');
  const packageJsonResult = await updatePackageJsonForTests({ packageJsonPath, appendMode });

  // Generate additional configuration files
  const additionalFiles = await generateAdditionalTestConfig({ projectRoot, appendMode });

  return {
    configFiles,
    packageJsonUpdated: packageJsonResult.updated,
    additionalFiles,
  };
};
