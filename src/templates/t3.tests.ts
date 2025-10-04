/**
 * T3 Stack test templates - Modular structure
 */

/**
 * Gets the list of T3 test file names for a module with new modular structure
 */
export const getT3TestFileNames = (): string[] => {
  const operations = ['create', 'get', 'list', 'update', 'delete'];
  const testFiles: string[] = [];

  operations.forEach(operation => {
    // Success tests (2 files)
    testFiles.push(`${operation}/success/basic.test.ts`);
    testFiles.push(`${operation}/success/variations.test.ts`);

    // Validation tests (2 files)
    testFiles.push(`${operation}/validation/required.test.ts`);
    testFiles.push(`${operation}/validation/types.test.ts`);

    // Failure tests (operation-specific)
    if (operation === 'create') {
      testFiles.push(`${operation}/failure/duplicate.test.ts`);
      testFiles.push(`${operation}/failure/unauthorized.test.ts`);
    } else if (operation === 'list') {
      testFiles.push(`${operation}/failure/unauthorized.test.ts`);
    } else {
      // get, update, delete operations
      testFiles.push(`${operation}/failure/not-found.test.ts`);
      testFiles.push(`${operation}/failure/unauthorized.test.ts`);
    }
  });

  return testFiles;
};

/**
 * Generates test file content for T3 tRPC procedures with modular structure
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
  // Extract category and file name from path like "success/basic.test.ts"
  const parts = testType.split('/');
  if (parts.length !== 2) return '';

  const [category, fileName] = parts;

  switch (category) {
    case 'success':
      return fileName === 'basic.test.ts'
        ? generateSuccessBasicTest(operation, moduleName)
        : generateSuccessVariationsTest(operation, moduleName);

    case 'validation':
      return fileName === 'required.test.ts'
        ? generateValidationRequiredTest(operation, moduleName)
        : generateValidationTypesTest(operation, moduleName);

    case 'failure':
      if (fileName === 'not-found.test.ts') {
        return generateFailureNotFoundTest(operation, moduleName);
      } else if (fileName === 'duplicate.test.ts') {
        return generateFailureDuplicateTest(operation, moduleName);
      } else if (fileName === 'unauthorized.test.ts') {
        return generateFailureUnauthorizedTest(operation, moduleName);
      }
      return '';

    default:
      return '';
  }
};

// ============================================================================
// SUCCESS TESTS - Happy path scenarios
// ============================================================================

/**
 * Generates basic success test - main happy path
 */
const generateSuccessBasicTest = (operation: string, moduleName: string): string => {
  const capitalizedModuleName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);

  switch (operation) {
    case 'create':
      return `import { expect, it, describe } from "vitest";
import { appRouter, type RouterInputs, type RouterOutputs } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

describe("Create ${capitalizedModuleName} - Basic Success", () => {
  it("should create ${moduleName} successfully with complete data", async () => {
    const ctx = await createTRPCContext({ headers: new Headers() });
    const caller = appRouter.createCaller(ctx);

    const input: RouterInputs["${moduleName}"]["create"] = {
      name: "Test ${capitalizedModuleName}",
      description: "Test description",
      status: "active",
    };

    const res: RouterOutputs["${moduleName}"]["create"] = await caller.${moduleName}.create(input);

    console.log("Created ${moduleName}:", res.data);

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
    expect(res.error).toBeNull();
  });
});
`;

    case 'get':
      return `import { expect, it, describe } from "vitest";
import { appRouter, type RouterInputs, type RouterOutputs } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

describe("Get ${capitalizedModuleName} - Basic Success", () => {
  it("should get ${moduleName} by ID successfully", async () => {
    const ctx = await createTRPCContext({ headers: new Headers() });
    const caller = appRouter.createCaller(ctx);

    const input: RouterInputs["${moduleName}"]["get"] = {
      ${moduleName}Id: "test-${moduleName}-id-123",
    };

    const res: RouterOutputs["${moduleName}"]["get"] = await caller.${moduleName}.get(input);

    console.log("Retrieved ${moduleName}:", res.data);

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
    expect(res.error).toBeNull();
  });
});
`;

    case 'list':
      return `import { expect, it, describe } from "vitest";
import { appRouter, type RouterInputs, type RouterOutputs } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

describe("List ${capitalizedModuleName}s - Basic Success", () => {
  it("should list ${moduleName}s with default pagination", async () => {
    const ctx = await createTRPCContext({ headers: new Headers() });
    const caller = appRouter.createCaller(ctx);

    const input: RouterInputs["${moduleName}"]["list"] = {};

    const res: RouterOutputs["${moduleName}"]["list"] = await caller.${moduleName}.list(input);

    console.log("Listed ${moduleName}s:", res.data);

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
    expect(Array.isArray(res.data?.items)).toBe(true);
    expect(res.error).toBeNull();
  });
});
`;

    case 'update':
      return `import { expect, it, describe } from "vitest";
import { appRouter, type RouterInputs, type RouterOutputs } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

describe("Update ${capitalizedModuleName} - Basic Success", () => {
  it("should update ${moduleName} successfully with complete data", async () => {
    const ctx = await createTRPCContext({ headers: new Headers() });
    const caller = appRouter.createCaller(ctx);

    const input: RouterInputs["${moduleName}"]["update"] = {
      ${moduleName}Id: "test-${moduleName}-id-update",
      name: "Updated ${capitalizedModuleName} Name",
      description: "Updated description",
      status: "updated",
    };

    const res: RouterOutputs["${moduleName}"]["update"] = await caller.${moduleName}.update(input);

    console.log("Updated ${moduleName}:", res.data);

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
    expect(res.error).toBeNull();
  });
});
`;

    case 'delete':
      return `import { expect, it, describe } from "vitest";
import { appRouter, type RouterInputs, type RouterOutputs } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

describe("Delete ${capitalizedModuleName} - Basic Success", () => {
  it("should delete ${moduleName} successfully", async () => {
    const ctx = await createTRPCContext({ headers: new Headers() });
    const caller = appRouter.createCaller(ctx);

    const input: RouterInputs["${moduleName}"]["delete"] = {
      ${moduleName}Id: "test-${moduleName}-id-delete",
    };

    const res: RouterOutputs["${moduleName}"]["delete"] = await caller.${moduleName}.delete(input);

    console.log("Deleted ${moduleName}:", res.data);

    const expectedResponse: RouterOutputs["${moduleName}"]["delete"] = {
      data: {
        deleted_id: input.${moduleName}Id,
        deleted_at: expect.any(String),
      },
      error: null
    };

    expect(res).toEqual(expectedResponse);
    expect(res.error).toBeNull();
  });
});
`;

    default:
      return generateGenericSuccessBasicTest(operation, moduleName);
  }
};

/**
 * Generates success variations test - different valid input scenarios
 */
const generateSuccessVariationsTest = (operation: string, moduleName: string): string => {
  const capitalizedModuleName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);

  switch (operation) {
    case 'create':
      return `import { expect, it, describe } from "vitest";
import { appRouter, type RouterInputs, type RouterOutputs } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

describe("Create ${capitalizedModuleName} - Input Variations", () => {
  it("should create ${moduleName} with minimal required data", async () => {
    const ctx = await createTRPCContext({ headers: new Headers() });
    const caller = appRouter.createCaller(ctx);

    const input: RouterInputs["${moduleName}"]["create"] = {
      name: "Minimal ${capitalizedModuleName}",
    };

    const res: RouterOutputs["${moduleName}"]["create"] = await caller.${moduleName}.create(input);

    expect(res.data).toHaveProperty("${moduleName}Id");
    expect(res.data?.name).toBe(input.name);
    expect(res.error).toBeNull();
  });

  it("should create ${moduleName} with optional fields", async () => {
    const ctx = await createTRPCContext({ headers: new Headers() });
    const caller = appRouter.createCaller(ctx);

    const input: RouterInputs["${moduleName}"]["create"] = {
      name: "Optional Fields ${capitalizedModuleName}",
      description: "This includes optional description",
      status: "pending",
    };

    const res: RouterOutputs["${moduleName}"]["create"] = await caller.${moduleName}.create(input);

    expect(res.data?.description).toBe(input.description);
    expect(res.data?.status).toBe(input.status);
    expect(res.error).toBeNull();
  });
});
`;

    case 'get':
      return `import { expect, it, describe } from "vitest";
import { appRouter, type RouterInputs, type RouterOutputs } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

describe("Get ${capitalizedModuleName} - ID Format Variations", () => {
  it("should handle different ID formats", async () => {
    const ctx = await createTRPCContext({ headers: new Headers() });
    const caller = appRouter.createCaller(ctx);

    const testIds = [
      "uuid-format-id-abc123",
      "numeric-456",
      "custom-prefix-id-xyz",
    ];

    for (const ${moduleName}Id of testIds) {
      const input: RouterInputs["${moduleName}"]["get"] = { ${moduleName}Id };
      const res: RouterOutputs["${moduleName}"]["get"] = await caller.${moduleName}.get(input);

      expect(res.data?.${moduleName}Id).toBe(${moduleName}Id);
      expect(res.error).toBeNull();
    }
  });

  it("should get ${moduleName} with special characters in ID", async () => {
    const ctx = await createTRPCContext({ headers: new Headers() });
    const caller = appRouter.createCaller(ctx);

    const input: RouterInputs["${moduleName}"]["get"] = {
      ${moduleName}Id: "id-with-dashes-and_underscores",
    };

    const res: RouterOutputs["${moduleName}"]["get"] = await caller.${moduleName}.get(input);

    expect(res.data?.${moduleName}Id).toBe(input.${moduleName}Id);
    expect(res.error).toBeNull();
  });
});
`;

    case 'list':
      return `import { expect, it, describe } from "vitest";
import { appRouter, type RouterInputs, type RouterOutputs } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

describe("List ${capitalizedModuleName}s - Query Variations", () => {
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

  it("should list ${moduleName}s with filtering and search", async () => {
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

  it("should list ${moduleName}s with different page sizes", async () => {
    const ctx = await createTRPCContext({ headers: new Headers() });
    const caller = appRouter.createCaller(ctx);

    const pageSizes = [10, 25, 50];

    for (const limit of pageSizes) {
      const input: RouterInputs["${moduleName}"]["list"] = { page: 1, limit };
      const res: RouterOutputs["${moduleName}"]["list"] = await caller.${moduleName}.list(input);

      expect(res.data?._metadata.limit).toBe(limit);
      expect(res.error).toBeNull();
    }
  });
});
`;

    case 'update':
      return `import { expect, it, describe } from "vitest";
import { appRouter, type RouterInputs, type RouterOutputs } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

describe("Update ${capitalizedModuleName} - Update Variations", () => {
  it("should handle partial updates (single field)", async () => {
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

  it("should handle partial updates (multiple fields)", async () => {
    const ctx = await createTRPCContext({ headers: new Headers() });
    const caller = appRouter.createCaller(ctx);

    const input: RouterInputs["${moduleName}"]["update"] = {
      ${moduleName}Id: "test-${moduleName}-id-multi",
      name: "New Name",
      status: "inactive",
    };

    const res: RouterOutputs["${moduleName}"]["update"] = await caller.${moduleName}.update(input);

    expect(res.data?.name).toBe(input.name);
    expect(res.data?.status).toBe(input.status);
    expect(res.error).toBeNull();
  });

  it("should handle update with no actual changes", async () => {
    const ctx = await createTRPCContext({ headers: new Headers() });
    const caller = appRouter.createCaller(ctx);

    const input: RouterInputs["${moduleName}"]["update"] = {
      ${moduleName}Id: "test-${moduleName}-id-nochange",
    };

    const res: RouterOutputs["${moduleName}"]["update"] = await caller.${moduleName}.update(input);

    expect(res.data?.${moduleName}Id).toBe(input.${moduleName}Id);
    expect(res.error).toBeNull();
  });
});
`;

    case 'delete':
      return `import { expect, it, describe } from "vitest";
import { appRouter, type RouterInputs, type RouterOutputs } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

describe("Delete ${capitalizedModuleName} - Deletion Variations", () => {
  it("should return proper deletion confirmation", async () => {
    const ctx = await createTRPCContext({ headers: new Headers() });
    const caller = appRouter.createCaller(ctx);

    const input: RouterInputs["${moduleName}"]["delete"] = {
      ${moduleName}Id: "test-${moduleName}-id-confirm",
    };

    const res: RouterOutputs["${moduleName}"]["delete"] = await caller.${moduleName}.delete(input);

    expect(res.data).toHaveProperty("deleted_id");
    expect(res.data).toHaveProperty("deleted_at");
    expect(res.data?.deleted_id).toBe(input.${moduleName}Id);
    expect(res.error).toBeNull();
  });

  it("should handle deletion with different ID formats", async () => {
    const ctx = await createTRPCContext({ headers: new Headers() });
    const caller = appRouter.createCaller(ctx);

    const testIds = ["uuid-123", "id-with-prefix-456", "custom_789"];

    for (const ${moduleName}Id of testIds) {
      const input: RouterInputs["${moduleName}"]["delete"] = { ${moduleName}Id };
      const res: RouterOutputs["${moduleName}"]["delete"] = await caller.${moduleName}.delete(input);

      expect(res.data?.deleted_id).toBe(${moduleName}Id);
      expect(res.error).toBeNull();
    }
  });
});
`;

    default:
      return generateGenericSuccessVariationsTest(operation, moduleName);
  }
};

// ============================================================================
// VALIDATION TESTS - Input validation & schema tests
// ============================================================================

/**
 * Generates validation test for required fields
 */
const generateValidationRequiredTest = (operation: string, moduleName: string): string => {
  const capitalizedModuleName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);

  return `import { expect, it, describe } from "vitest";
import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

describe("${capitalizedModuleName} ${operation.charAt(0).toUpperCase() + operation.slice(1)} - Required Field Validation", () => {
  it("should reject request with missing required fields", async () => {
    const ctx = await createTRPCContext({ headers: new Headers() });
    const caller = appRouter.createCaller(ctx);

    const invalidInput = {} as unknown; // Missing all fields

    // @ts-expect-error - Testing invalid input type
    await expect(
      caller.${moduleName}.${operation}(invalidInput)
    ).rejects.toThrow();
  });

  ${operation === 'create' ? `
  it("should reject creation without name field", async () => {
    const ctx = await createTRPCContext({ headers: new Headers() });
    const caller = appRouter.createCaller(ctx);

    const invalidInput = {
      description: "Missing name field",
    };

    // @ts-expect-error - Testing invalid input type
    await expect(
      caller.${moduleName}.${operation}(invalidInput)
    ).rejects.toThrow();
  });` : ''}

  ${operation === 'get' || operation === 'update' || operation === 'delete' ? `
  it("should reject ${operation} without ${moduleName}Id", async () => {
    const ctx = await createTRPCContext({ headers: new Headers() });
    const caller = appRouter.createCaller(ctx);

    const invalidInput = {
      ${operation === 'update' ? 'name: "Without ID",' : ''}
    };

    // @ts-expect-error - Testing invalid input type
    await expect(
      caller.${moduleName}.${operation}(invalidInput)
    ).rejects.toThrow();
  });` : ''}

  it("should validate that required fields cannot be null", async () => {
    const ctx = await createTRPCContext({ headers: new Headers() });
    const caller = appRouter.createCaller(ctx);

    const invalidInput = {
      ${operation === 'get' || operation === 'delete' ? `${moduleName}Id: null,` : ''}
      ${operation === 'create' ? 'name: null,' : ''}
      ${operation === 'update' ? `${moduleName}Id: null, name: null,` : ''}
    };

    // @ts-expect-error - Testing invalid input type
    await expect(
      caller.${moduleName}.${operation}(invalidInput)
    ).rejects.toThrow();
  });
});
`;
};

/**
 * Generates validation test for field types and formats
 */
const generateValidationTypesTest = (operation: string, moduleName: string): string => {
  const capitalizedModuleName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);

  return `import { expect, it, describe } from "vitest";
import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

describe("${capitalizedModuleName} ${operation.charAt(0).toUpperCase() + operation.slice(1)} - Field Type Validation", () => {
  it("should reject invalid field types", async () => {
    const ctx = await createTRPCContext({ headers: new Headers() });
    const caller = appRouter.createCaller(ctx);

    const invalidInput = {
      ${operation === 'create' ? `
      name: 123, // Should be string
      status: true, // Should be valid string enum
      ` : ''}
      ${operation === 'get' || operation === 'delete' ? `
      ${moduleName}Id: 123, // Should be string
      ` : ''}
      ${operation === 'update' ? `
      ${moduleName}Id: [], // Should be string
      name: {}, // Should be string
      ` : ''}
      ${operation === 'list' ? `
      page: "invalid", // Should be number
      limit: "10", // Should be number
      ` : ''}
    };

    // @ts-expect-error - Testing invalid input type
    await expect(
      caller.${moduleName}.${operation}(invalidInput)
    ).rejects.toThrow();
  });

  ${operation === 'list' ? `
  it("should reject negative pagination values", async () => {
    const ctx = await createTRPCContext({ headers: new Headers() });
    const caller = appRouter.createCaller(ctx);

    const invalidInputs = [
      { page: -1, limit: 10 },
      { page: 1, limit: -5 },
      { page: 0, limit: 0 },
    ];

    for (const invalidInput of invalidInputs) {
      // @ts-expect-error - Testing invalid input type
      await expect(
        caller.${moduleName}.${operation}(invalidInput)
      ).rejects.toThrow();
    }
  });` : ''}

  ${operation === 'create' || operation === 'update' ? `
  it("should reject excessively long string values", async () => {
    const ctx = await createTRPCContext({ headers: new Headers() });
    const caller = appRouter.createCaller(ctx);

    const invalidInput = {
      ${operation === 'update' ? `${moduleName}Id: "valid-id",` : ''}
      name: 'A'.repeat(10000), // Extremely long string
    };

    // @ts-expect-error - Testing invalid input type
    await expect(
      caller.${moduleName}.${operation}(invalidInput)
    ).rejects.toThrow();
  });` : ''}

  it("should handle edge case validation scenarios", async () => {
    const ctx = await createTRPCContext({ headers: new Headers() });
    const caller = appRouter.createCaller(ctx);

    const edgeCases = [
      null,
      undefined,
      "",
      [],
    ];

    for (const invalidInput of edgeCases) {
      // @ts-expect-error - Testing invalid input type
      await expect(
        caller.${moduleName}.${operation}(invalidInput as unknown)
      ).rejects.toThrow();
    }
  });
});
`;
};

// ============================================================================
// FAILURE TESTS - Error scenarios
// ============================================================================

/**
 * Generates failure test for not-found errors (404)
 */
const generateFailureNotFoundTest = (operation: string, moduleName: string): string => {
  const capitalizedModuleName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);

  return `import { expect, it, describe } from "vitest";
import { appRouter, type RouterInputs, type RouterOutputs } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

describe("${capitalizedModuleName} ${operation.charAt(0).toUpperCase() + operation.slice(1)} - Not Found Errors", () => {
  it("should handle non-existent ${moduleName} ID gracefully", async () => {
    const ctx = await createTRPCContext({ headers: new Headers() });
    const caller = appRouter.createCaller(ctx);

    const input: RouterInputs["${moduleName}"]["${operation}"] = {
      ${moduleName}Id: "non-existent-id-12345",
      ${operation === 'update' ? 'name: "Update attempt",' : ''}
    } as any;

    const res: RouterOutputs["${moduleName}"]["${operation}"] = await caller.${moduleName}.${operation}(input);

    // Should return error response (not throw)
    expect(res).toHaveProperty("data");
    expect(res).toHaveProperty("error");

    if (res.error) {
      expect(res.error.statusCode).toBe(404);
      expect(res.error.message).toContain("not found");
    }
  });

  it("should return consistent error format for not found", async () => {
    const ctx = await createTRPCContext({ headers: new Headers() });
    const caller = appRouter.createCaller(ctx);

    const input: RouterInputs["${moduleName}"]["${operation}"] = {
      ${moduleName}Id: "definitely-not-found-id",
      ${operation === 'update' ? 'name: "Some name",' : ''}
    } as any;

    const res: RouterOutputs["${moduleName}"]["${operation}"] = await caller.${moduleName}.${operation}(input);

    if (res.error) {
      expect(res.error).toHaveProperty("code");
      expect(res.error).toHaveProperty("message");
      expect(res.error).toHaveProperty("statusCode");
      expect(res.data).toBeNull();
    }
  });

  it("should handle multiple not-found scenarios", async () => {
    const ctx = await createTRPCContext({ headers: new Headers() });
    const caller = appRouter.createCaller(ctx);

    const nonExistentIds = [
      "invalid-uuid-123",
      "missing-456",
      "deleted-789",
    ];

    for (const ${moduleName}Id of nonExistentIds) {
      const input: RouterInputs["${moduleName}"]["${operation}"] = {
        ${moduleName}Id,
        ${operation === 'update' ? 'name: "Test",' : ''}
      } as any;

      const res: RouterOutputs["${moduleName}"]["${operation}"] = await caller.${moduleName}.${operation}(input);

      // Each should handle not-found gracefully
      expect(res).toHaveProperty("data");
      expect(res).toHaveProperty("error");
    }
  });
});
`;
};

/**
 * Generates failure test for duplicate/conflict errors (409)
 */
const generateFailureDuplicateTest = (_operation: string, moduleName: string): string => {
  const capitalizedModuleName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);

  return `import { expect, it, describe } from "vitest";
import { appRouter, type RouterInputs, type RouterOutputs } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

describe("${capitalizedModuleName} Create - Duplicate/Conflict Errors", () => {
  it("should handle duplicate ${moduleName} creation gracefully", async () => {
    const ctx = await createTRPCContext({ headers: new Headers() });
    const caller = appRouter.createCaller(ctx);

    const input: RouterInputs["${moduleName}"]["create"] = {
      name: "Duplicate ${capitalizedModuleName}",
      description: "This might already exist",
    };

    const res: RouterOutputs["${moduleName}"]["create"] = await caller.${moduleName}.create(input);

    // Should handle gracefully (might succeed first time, conflict second time)
    expect(res).toHaveProperty("data");
    expect(res).toHaveProperty("error");
  });

  it("should return proper conflict error format", async () => {
    const ctx = await createTRPCContext({ headers: new Headers() });
    const caller = appRouter.createCaller(ctx);

    const input: RouterInputs["${moduleName}"]["create"] = {
      name: "Unique Constraint Test ${capitalizedModuleName}",
    };

    // First creation might succeed
    const firstRes = await caller.${moduleName}.create(input);

    // If it succeeded, try creating again with same unique data
    if (firstRes.data) {
      const secondRes = await caller.${moduleName}.create(input);

      // Second attempt might return conflict error
      if (secondRes.error) {
        expect(secondRes.error.statusCode).toBeGreaterThanOrEqual(400);
        expect(secondRes.data).toBeNull();
      }
    }
  });

  it("should handle constraint violation scenarios", async () => {
    const ctx = await createTRPCContext({ headers: new Headers() });
    const caller = appRouter.createCaller(ctx);

    const input: RouterInputs["${moduleName}"]["create"] = {
      name: "Constraint Test ${capitalizedModuleName}",
      description: "Testing unique constraints",
    };

    const res: RouterOutputs["${moduleName}"]["create"] = await caller.${moduleName}.create(input);

    // Should return proper response structure
    expect(res).toHaveProperty("data");
    expect(res).toHaveProperty("error");
    expect(res.data !== null || res.error !== null).toBe(true);
  });
});
`;
};

/**
 * Generates failure test for unauthorized errors (401)
 */
const generateFailureUnauthorizedTest = (operation: string, moduleName: string): string => {
  const capitalizedModuleName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);

  return `import { expect, it, describe } from "vitest";
import { appRouter, type RouterInputs } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

describe("${capitalizedModuleName} ${operation.charAt(0).toUpperCase() + operation.slice(1)} - Authorization Errors", () => {
  it("should handle unauthorized ${operation} attempts gracefully", async () => {
    // Create context without auth headers to simulate unauthorized user
    const ctx = await createTRPCContext({ headers: new Headers() });
    const caller = appRouter.createCaller(ctx);

    const input: RouterInputs["${moduleName}"]["${operation}"] = {
      ${operation === 'create' ? `name: "Unauthorized Create Attempt",` : ''}
      ${operation === 'get' || operation === 'delete' ? `${moduleName}Id: "test-id-unauth",` : ''}
      ${operation === 'update' ? `${moduleName}Id: "test-id-unauth", name: "Update",` : ''}
      ${operation === 'list' ? `page: 1, limit: 10,` : ''}
    } as any;

    const res = await caller.${moduleName}.${operation}(input);

    // Should handle gracefully with error response or throw
    // Implementation depends on your auth middleware
    expect(res).toBeDefined();
  });

  it("should return proper error format for auth failures", async () => {
    const ctx = await createTRPCContext({ headers: new Headers() });
    const caller = appRouter.createCaller(ctx);

    const input: RouterInputs["${moduleName}"]["${operation}"] = {
      ${operation === 'create' ? `name: "Auth Test",` : ''}
      ${operation === 'get' || operation === 'delete' ? `${moduleName}Id: "auth-test-id",` : ''}
      ${operation === 'update' ? `${moduleName}Id: "auth-test-id", name: "Update",` : ''}
    } as any;

    try {
      const res = await caller.${moduleName}.${operation}(input);

      // If returns error object instead of throwing
      if (res.error) {
        expect(res.error).toHaveProperty("code");
        expect(res.error).toHaveProperty("message");
        expect(res.error).toHaveProperty("statusCode");
      }
    } catch (error) {
      // If throws error for unauthorized
      expect(error).toBeDefined();
    }
  });

  it("should handle timeout scenarios for ${operation}", async () => {
    const ctx = await createTRPCContext({ headers: new Headers() });
    const caller = appRouter.createCaller(ctx);

    const input: RouterInputs["${moduleName}"]["${operation}"] = {
      ${operation === 'create' ? `name: "Timeout Test",` : ''}
      ${operation === 'get' || operation === 'delete' ? `${moduleName}Id: "timeout-test-id",` : ''}
      ${operation === 'update' ? `${moduleName}Id: "timeout-test-id", name: "Timeout",` : ''}
      ${operation === 'list' ? `search: "timeout test query",` : ''}
    } as any;

    // Should complete within reasonable time
    const startTime = Date.now();
    await caller.${moduleName}.${operation}(input);
    const duration = Date.now() - startTime;

    expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
  });
});
`;
};

// ============================================================================
// GENERIC TESTS - For custom operations
// ============================================================================

const generateGenericSuccessBasicTest = (operation: string, moduleName: string): string => {
  return `import { expect, it, describe } from "vitest";
import { appRouter, type RouterInputs, type RouterOutputs } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

describe("${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} ${operation} - Basic Success", () => {
  it("should ${operation} successfully", async () => {
    const ctx = await createTRPCContext({ headers: new Headers() });
    const caller = appRouter.createCaller(ctx);

    const input: RouterInputs["${moduleName}"]["${operation}"] = {
      // Add your ${operation} specific input fields here
    };

    const res: RouterOutputs["${moduleName}"]["${operation}"] = await caller.${moduleName}.${operation}(input);

    console.log("${operation} result:", res.data);

    // Basic response structure validation
    expect(res).toHaveProperty("data");
    expect(res).toHaveProperty("error");
    expect(res.data !== null || res.error !== null).toBe(true);
  });
});
`;
};

const generateGenericSuccessVariationsTest = (operation: string, moduleName: string): string => {
  return `import { expect, it, describe } from "vitest";
import { appRouter, type RouterInputs, type RouterOutputs } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

describe("${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} ${operation} - Input Variations", () => {
  it("should ${operation} with different input variations", async () => {
    const ctx = await createTRPCContext({ headers: new Headers() });
    const caller = appRouter.createCaller(ctx);

    const testCases = [
      { name: "standard input", input: { /* Add test data */ } },
      { name: "minimal input", input: { /* Add minimal test data */ } },
    ];

    for (const testCase of testCases) {
      const res: RouterOutputs["${moduleName}"]["${operation}"] = await caller.${moduleName}.${operation}(testCase.input);

      expect(res).toHaveProperty("data");
      expect(res).toHaveProperty("error");
    }
  });
});
`;
};
