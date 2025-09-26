/**
 * T3 Stack test templates
 */

/**
 * Gets the list of T3 test file names for a module
 */
export const getT3TestFileNames = (): string[] => {
  const operations = ['create', 'get', 'list', 'update', 'delete'];
  const testTypes = ['procedure.test.ts', 'validation.test.ts', 'errors.test.ts'];

  const testFiles: string[] = [];

  operations.forEach(operation => {
    testTypes.forEach(testType => {
      testFiles.push(`${operation}/${testType}`);
    });
  });

  return testFiles;
};

/**
 * Generates test file content for T3 tRPC procedures
 */
export const generateT3TestContent = ({
  operation,
  testType,
  moduleName,
}: {
  operation: string;
  testType: string;
  moduleName: string;
}): string => {
  switch (testType) {
    case 'procedure.test.ts':
      return generateT3ProcedureTestContent(operation, moduleName);
    case 'validation.test.ts':
      return generateT3ValidationTestContent(operation, moduleName);
    case 'errors.test.ts':
      return generateT3ErrorTestContent(operation, moduleName);
    default:
      return '';
  }
};

const generateT3ProcedureTestContent = (operation: string, moduleName: string): string => {
  const capitalizedModuleName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);

  switch (operation) {
    case 'create':
      return `import { expect, it } from "vitest";
import { appRouter, type RouterInputs, type RouterOutputs } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

it("should create ${moduleName} successfully", async () => {
  const ctx = await createTRPCContext({ headers: new Headers() });
  const caller = appRouter.createCaller(ctx);

  const input: RouterInputs["${moduleName}"]["create"] = {
    name: "Test ${capitalizedModuleName}",
    description: "Test description",
    status: "active",
  };

  const res: RouterOutputs["${moduleName}"]["create"] = await caller.${moduleName}.create(input);

  console.log("res:", res.data);

  const expectedResponse: RouterOutputs["${moduleName}"]["create"] = {
    data: {
      ${moduleName}Id: expect.any(String),
      name: input.name,
      description: input.description,
      status: input.status,
      created_at: expect.any(String),
      updated_at: expect.any(String),
    },
    error: null
  };

  expect(res).toEqual(expectedResponse);
});

it("should create ${moduleName} with minimal data", async () => {
  const ctx = await createTRPCContext({ headers: new Headers() });
  const caller = appRouter.createCaller(ctx);

  const input: RouterInputs["${moduleName}"]["create"] = {
    name: "Minimal ${capitalizedModuleName}",
  };

  const res: RouterOutputs["${moduleName}"]["create"] = await caller.${moduleName}.create(input);

  expect(res.data).toHaveProperty("${moduleName}Id");
  expect(res.data.name).toBe(input.name);
  expect(res.error).toBeNull();
});
`;

    case 'get':
      return `import { expect, it } from "vitest";
import { appRouter, type RouterInputs, type RouterOutputs } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

it("should get ${moduleName} by ID", async () => {
  const ctx = await createTRPCContext({ headers: new Headers() });
  const caller = appRouter.createCaller(ctx);

  const input: RouterInputs["${moduleName}"]["get"] = {
    ${moduleName}Id: "test-${moduleName}-id-123",
  };

  const res: RouterOutputs["${moduleName}"]["get"] = await caller.${moduleName}.get(input);

  console.log("res:", res.data);

  const expectedResponse: RouterOutputs["${moduleName}"]["get"] = {
    data: {
      ${moduleName}Id: input.${moduleName}Id,
      name: expect.any(String),
      description: expect.any(String),
      status: expect.any(String),
      created_at: expect.any(String),
      updated_at: expect.any(String),
    },
    error: null
  };

  expect(res).toEqual(expectedResponse);
});

it("should handle different ID formats", async () => {
  const ctx = await createTRPCContext({ headers: new Headers() });
  const caller = appRouter.createCaller(ctx);

  const testIds = ["uuid-format-id", "numeric-123", "custom-prefix-id"];

  for (const ${moduleName}Id of testIds) {
    const input: RouterInputs["${moduleName}"]["get"] = { ${moduleName}Id };
    const res: RouterOutputs["${moduleName}"]["get"] = await caller.${moduleName}.get(input);
    
    expect(res.data?.${moduleName}Id).toBe(${moduleName}Id);
    expect(res.error).toBeNull();
  }
});
`;

    case 'list':
      return `import { expect, it } from "vitest";
import { appRouter, type RouterInputs, type RouterOutputs } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

it("should list ${moduleName}s with default pagination", async () => {
  const ctx = await createTRPCContext({ headers: new Headers() });
  const caller = appRouter.createCaller(ctx);

  const input: RouterInputs["${moduleName}"]["list"] = {};

  const res: RouterOutputs["${moduleName}"]["list"] = await caller.${moduleName}.list(input);

  console.log("res:", res.data);

  const expectedResponse: RouterOutputs["${moduleName}"]["list"] = {
    data: {
      items: expect.any(Array),
      _metadata: {
        page: expect.any(Number),
        limit: expect.any(Number),
        total_count: expect.any(Number),
        total_pages: expect.any(Number),
        has_next: expect.any(Boolean),
        has_prev: expect.any(Boolean),
      },
    },
    error: null
  };

  expect(res).toEqual(expectedResponse);
});

it("should list ${moduleName}s with custom pagination", async () => {
  const ctx = await createTRPCContext({ headers: new Headers() });
  const caller = appRouter.createCaller(ctx);

  const input: RouterInputs["${moduleName}"]["list"] = {
    page: 2,
    limit: 5,
  };

  const res: RouterOutputs["${moduleName}"]["list"] = await caller.${moduleName}.list(input);

  expect(res.data?._metadata.page).toBe(input.page);
  expect(res.data?._metadata.limit).toBe(input.limit);
  expect(res.error).toBeNull();
});

it("should handle filtering and search", async () => {
  const ctx = await createTRPCContext({ headers: new Headers() });
  const caller = appRouter.createCaller(ctx);

  const input: RouterInputs["${moduleName}"]["list"] = {
    search: "test query",
    status: "active",
  };

  const res: RouterOutputs["${moduleName}"]["list"] = await caller.${moduleName}.list(input);

  expect(res.data).toHaveProperty("items");
  expect(Array.isArray(res.data?.items)).toBe(true);
  expect(res.error).toBeNull();
});
`;

    case 'update':
      return `import { expect, it } from "vitest";
import { appRouter, type RouterInputs, type RouterOutputs } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

it("should update ${moduleName} successfully", async () => {
  const ctx = await createTRPCContext({ headers: new Headers() });
  const caller = appRouter.createCaller(ctx);

  const input: RouterInputs["${moduleName}"]["update"] = {
    ${moduleName}Id: "test-${moduleName}-id-update",
    name: "Updated ${capitalizedModuleName} Name",
    description: "Updated description",
    status: "updated",
  };

  const res: RouterOutputs["${moduleName}"]["update"] = await caller.${moduleName}.update(input);

  console.log("res:", res.data);

  const expectedResponse: RouterOutputs["${moduleName}"]["update"] = {
    data: {
      ${moduleName}Id: input.${moduleName}Id,
      name: input.name,
      description: input.description,
      status: input.status,
      created_at: expect.any(String),
      updated_at: expect.any(String),
    },
    error: null
  };

  expect(res).toEqual(expectedResponse);
});

it("should handle partial updates", async () => {
  const ctx = await createTRPCContext({ headers: new Headers() });
  const caller = appRouter.createCaller(ctx);

  const input: RouterInputs["${moduleName}"]["update"] = {
    ${moduleName}Id: "test-${moduleName}-id-partial",
    name: "Partially Updated Name",
  };

  const res: RouterOutputs["${moduleName}"]["update"] = await caller.${moduleName}.update(input);

  expect(res.data?.name).toBe(input.name);
  expect(res.data?.${moduleName}Id).toBe(input.${moduleName}Id);
  expect(res.error).toBeNull();
});
`;

    case 'delete':
      return `import { expect, it } from "vitest";
import { appRouter, type RouterInputs, type RouterOutputs } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

it("should delete ${moduleName} successfully", async () => {
  const ctx = await createTRPCContext({ headers: new Headers() });
  const caller = appRouter.createCaller(ctx);

  const input: RouterInputs["${moduleName}"]["delete"] = {
    ${moduleName}Id: "test-${moduleName}-id-delete",
  };

  const res: RouterOutputs["${moduleName}"]["delete"] = await caller.${moduleName}.delete(input);

  console.log("res:", res.data);

  const expectedResponse: RouterOutputs["${moduleName}"]["delete"] = {
    data: {
      deleted_id: input.${moduleName}Id,
      deleted_at: expect.any(String),
    },
    error: null
  };

  expect(res).toEqual(expectedResponse);
});

it("should return proper deletion confirmation", async () => {
  const ctx = await createTRPCContext({ headers: new Headers() });
  const caller = appRouter.createCaller(ctx);

  const input: RouterInputs["${moduleName}"]["delete"] = {
    ${moduleName}Id: "test-${moduleName}-id-confirm",
  };

  const res: RouterOutputs["${moduleName}"]["delete"] = await caller.${moduleName}.delete(input);

  expect(res.data).toHaveProperty("deleted_id");
  expect(res.data).toHaveProperty("deleted_at");
  expect(res.error).toBeNull();
});
`;

    default:
      return '';
  }
};

const generateT3ValidationTestContent = (operation: string, moduleName: string): string => {
  return `import { expect, it } from "vitest";
import { appRouter, type RouterInputs, type RouterOutputs } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

it("should validate required fields for ${operation}", async () => {
  const ctx = await createTRPCContext({ headers: new Headers() });
  const caller = appRouter.createCaller(ctx);

  const invalidInput = {}; // Missing required fields

  await expect(caller.${moduleName}.${operation}(invalidInput as any)).rejects.toThrow();
});

it("should validate field types for ${operation}", async () => {
  const ctx = await createTRPCContext({ headers: new Headers() });
  const caller = appRouter.createCaller(ctx);

  const invalidInput = {
    ${operation === 'create' ? `
    name: 123, // Should be string
    status: "invalid-status", // Should be valid enum
    ` : operation === 'get' ? `
    ${moduleName}Id: 123, // Should be string
    ` : operation === 'update' ? `
    ${moduleName}Id: null, // Should be string
    name: [], // Should be string
    ` : operation === 'delete' ? `
    ${moduleName}Id: {}, // Should be string
    ` : operation === 'list' ? `
    page: "invalid", // Should be number
    limit: -1, // Should be positive
    ` : '// Add validation cases for custom operation'}
  };

  await expect(caller.${moduleName}.${operation}(invalidInput as any)).rejects.toThrow();
});

it("should handle edge cases for ${operation} validation", async () => {
  const ctx = await createTRPCContext({ headers: new Headers() });
  const caller = appRouter.createCaller(ctx);

  const edgeCases = [
    null,
    undefined,
    "",
    [],
    {},
  ];

  for (const invalidInput of edgeCases) {
    await expect(caller.${moduleName}.${operation}(invalidInput as any)).rejects.toThrow();
  }
});
`;
};

const generateT3ErrorTestContent = (operation: string, moduleName: string): string => {
  const capitalizedModuleName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);

  return `import { expect, it } from "vitest";
import { appRouter, type RouterInputs, type RouterOutputs } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

it("should handle server errors gracefully for ${operation}", async () => {
  const ctx = await createTRPCContext({ headers: new Headers() });
  const caller = appRouter.createCaller(ctx);

  // Test with data that might cause server errors
  const problematicInput: RouterInputs["${moduleName}"]["${operation}"] = {
    ${operation === 'create' ? `
    name: 'A'.repeat(10000), // Extremely long name
    description: 'Test description',
    ` : operation === 'get' || operation === 'delete' ? `
    ${moduleName}Id: 'non-existent-id-12345',
    ` : operation === 'update' ? `
    ${moduleName}Id: 'non-existent-id-12345',
    name: 'Updated name',
    ` : operation === 'list' ? `
    page: 999999, // Very high page number
    limit: 10000, // Very high limit
    ` : '// Add error cases for custom operation'}
  } as any;

  const res: RouterOutputs["${moduleName}"]["${operation}"] = await caller.${moduleName}.${operation}(problematicInput);
  
  // Should handle gracefully and return error response
  expect(res).toHaveProperty("data");
  expect(res).toHaveProperty("error");
});

it("should return consistent error format for ${operation}", async () => {
  const ctx = await createTRPCContext({ headers: new Headers() });
  const caller = appRouter.createCaller(ctx);

  const invalidInput: RouterInputs["${moduleName}"]["${operation}"] = {
    ${operation === 'get' || operation === 'delete' ? `
    ${moduleName}Id: 'definitely-not-found-id',
    ` : operation === 'update' ? `
    ${moduleName}Id: 'definitely-not-found-id',
    name: 'Some name',
    ` : operation === 'create' ? `
    name: '', // Empty required field
    ` : operation === 'list' ? `
    page: -5, // Invalid pagination
    ` : '// Add error cases for custom operation'}
  } as any;

  try {
    const res: RouterOutputs["${moduleName}"]["${operation}"] = await caller.${moduleName}.${operation}(invalidInput);
    
    if (res.error) {
      expect(res.error).toHaveProperty("code");
      expect(res.error).toHaveProperty("message");
      expect(res.error).toHaveProperty("statusCode");
    }
  } catch (error) {
    // tRPC validation errors are thrown
    expect(error).toBeDefined();
  }
});

it("should handle timeout scenarios for ${operation}", async () => {
  const ctx = await createTRPCContext({ headers: new Headers() });
  const caller = appRouter.createCaller(ctx);

  // This test simulates slow operations
  const timeoutInput: RouterInputs["${moduleName}"]["${operation}"] = {
    ${operation === 'create' ? `
    name: 'Timeout Test ${capitalizedModuleName}',
    description: 'Testing timeout scenarios',
    ` : operation === 'get' || operation === 'delete' ? `
    ${moduleName}Id: 'timeout-test-id',
    ` : operation === 'update' ? `
    ${moduleName}Id: 'timeout-test-id',
    name: 'Timeout update',
    ` : operation === 'list' ? `
    search: 'timeout test query',
    ` : '// Add timeout cases for custom operation'}
  } as any;

  // Should complete within reasonable time
  const startTime = Date.now();
  await caller.${moduleName}.${operation}(timeoutInput);
  const duration = Date.now() - startTime;
  
  expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
});
`;
};
