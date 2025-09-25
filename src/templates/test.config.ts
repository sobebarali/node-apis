/**
 * Test configuration templates
 */

/**
 * Generates vitest configuration file
 */
export const generateVitestConfig = (): string => {
  return `import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    root: './tests',
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 5000,
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'tests/**',
        'dist/**',
        'node_modules/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    setupFiles: ['./setup.ts'],
    reporters: ['verbose'],
    outputFile: {
      json: './coverage/test-results.json',
      junit: './coverage/junit.xml'
    }
  },
  resolve: {
    alias: {
      '@': './src',
      '@tests': './tests'
    }
  }
});
`;
};

/**
 * Generates test setup file
 */
export const generateTestSetup = (): string => {
  return `/**
 * Global test setup
 */

import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';

// Global test configuration
beforeAll(async () => {
  // Global setup before all tests
  console.log('🧪 Starting test suite...');
  
  // Setup test database connection if needed
  // await setupTestDatabase();
  
  // Setup global mocks
  setupGlobalMocks();
});

afterAll(async () => {
  // Global cleanup after all tests
  console.log('✅ Test suite completed');
  
  // Cleanup test database if needed
  // await cleanupTestDatabase();
});

beforeEach(() => {
  // Setup before each test
  // Reset mocks, clear caches, etc.
});

afterEach(() => {
  // Cleanup after each test
  // Clear any test data, reset state, etc.
});

/**
 * Setup global mocks
 */
function setupGlobalMocks() {
  // Mock console methods in test environment
  if (process.env.NODE_ENV === 'test') {
    // Optionally suppress console.log in tests
    // vi.spyOn(console, 'log').mockImplementation(() => {});
  }
  
  // Mock Date.now for consistent timestamps in tests
  // vi.spyOn(Date, 'now').mockReturnValue(1640995200000); // 2022-01-01
  
  // Mock process.env if needed
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'error';
}

/**
 * Test database setup (if using database)
 */
// async function setupTestDatabase() {
//   // Initialize test database
//   // Run migrations
//   // Seed test data
// }

/**
 * Test database cleanup (if using database)
 */
// async function cleanupTestDatabase() {
//   // Clear test data
//   // Close database connections
// }

// Export test utilities
export const testUtils = {
  generateId: () => \`test-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`,
  sleep: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  mockTimestamp: '2024-01-01T00:00:00.000Z'
};
`;
};

/**
 * Generates package.json test scripts
 */
export const generateTestScripts = (): Record<string, string> => {
  return {
    test: 'vitest',
    'test:run': 'vitest run',
    'test:watch': 'vitest --watch',
    'test:ui': 'vitest --ui',
    'test:coverage': 'vitest --coverage',
    'test:unit': 'vitest tests/**/*.test.ts',
    'test:integration': 'vitest tests/**/integration.test.ts',
    'test:module': 'vitest tests/{module-name}/**/*.test.ts',
    'test:operation': 'vitest tests/{module-name}/{operation-name}/*.test.ts',
    'test:success': 'vitest tests/**/success.test.ts',
    'test:validation': 'vitest tests/**/validation.test.ts',
    'test:errors': 'vitest tests/**/duplicate.test.ts tests/**/unauthorized.test.ts tests/**/not-found.test.ts tests/**/invalid-id.test.ts',
    'test:auth': 'vitest tests/**/unauthorized.test.ts',
    'test:duplicate': 'vitest tests/**/duplicate.test.ts',
    'test:not-found': 'vitest tests/**/not-found.test.ts',
    'test:invalid-id': 'vitest tests/**/invalid-id.test.ts',
    'test:ci': 'vitest run --coverage --reporter=junit --outputFile=coverage/junit.xml',
  };
};

/**
 * Generates test dependencies for package.json
 */
export const generateTestDependencies = (): Record<string, string> => {
  return {
    vitest: '^1.0.0',
    '@vitest/ui': '^1.0.0',
    supertest: '^6.3.3',
    '@types/supertest': '^6.0.2',
    c8: '^8.0.1',
  };
};

/**
 * Generates .gitignore entries for tests
 */
export const generateTestGitignore = (): string[] => {
  return [
    '# Test coverage',
    'coverage/',
    '*.lcov',
    '',
    '# Test results',
    'test-results/',
    'junit.xml',
    '',
    '# Test artifacts',
    '.nyc_output',
    '*.tgz',
    '*.tar.gz',
  ];
};

/**
 * Generates GitHub Actions workflow for tests
 */
export const generateGitHubWorkflow = (): string => {
  return `name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Use Node.js \${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: \${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build project
      run: npm run build
    
    - name: Run tests
      run: npm run test:ci
    
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        flags: unittests
        name: codecov-umbrella
        fail_ci_if_error: false
`;
};

/**
 * Generates VSCode settings for tests
 */
export const generateVSCodeSettings = (): Record<string, any> => {
  return {
    'vitest.enable': true,
    'vitest.commandLine': 'npm run test',
    'testing.automaticallyOpenPeekView': 'never',
    'testing.followRunningTest': false,
    'testing.openTesting': 'neverOpen',
    'files.associations': {
      '*.test.ts': 'typescript',
    },
    'typescript.preferences.includePackageJsonAutoImports': 'auto',
    'editor.codeActionsOnSave': {
      'source.organizeImports': true,
    },
  };
};
