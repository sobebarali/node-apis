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

    console.log("Created ${moduleName}:", res);

    expect(res).toHaveProperty("${moduleName}Id");
    expect(res.name).toBe(input.name);
    expect(res.description).toBe(input.description);
    expect(res.status).toBe(input.status);
    expect(res).toHaveProperty("created_at");
    expect(res).toHaveProperty("updated_at");
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

    console.log("Retrieved ${moduleName}:", res);

    expect(res).toHaveProperty("${moduleName}Id");
    expect(res.${moduleName}Id).toBe(input.${moduleName}Id);
    expect(res).toHaveProperty("name");
    expect(res).toHaveProperty("description");
    expect(res).toHaveProperty("status");
    expect(res).toHaveProperty("created_at");
    expect(res).toHaveProperty("updated_at");
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

    console.log("Listed ${moduleName}s:", res);

    expect(res).toHaveProperty("items");
    expect(Array.isArray(res.items)).toBe(true);
    expect(res).toHaveProperty("_metadata");
    expect(res._metadata).toHaveProperty("page");
    expect(res._metadata).toHaveProperty("limit");
    expect(res._metadata).toHaveProperty("total_count");
    expect(res._metadata).toHaveProperty("total_pages");
    expect(res._metadata).toHaveProperty("has_next");
    expect(res._metadata).toHaveProperty("has_prev");
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

    console.log("Updated ${moduleName}:", res);

    expect(res).toHaveProperty("${moduleName}Id");
    expect(res.${moduleName}Id).toBe(input.${moduleName}Id);
    expect(res.name).toBe(input.name);
    expect(res.description).toBe(input.description);
    expect(res.status).toBe(input.status);
    expect(res).toHaveProperty("created_at");
    expect(res).toHaveProperty("updated_at");
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

    console.log("Deleted ${moduleName}:", res);

    expect(res).toHaveProperty("deleted_id");
    expect(res.deleted_id).toBe(input.${moduleName}Id);
    expect(res).toHaveProperty("deleted_at");
  });
});
`;

    default:
      return generateGenericSuccessBasicTest(operation, moduleName);
  }
};

/**
 * Generates success variations test - different valid input scenarios (simplified)
 */
const generateSuccessVariationsTest = (operation: string, moduleName: string): string => {
  const capitalizedModuleName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  const operationTitle = operation.charAt(0).toUpperCase() + operation.slice(1);

  return `import { expect, it, describe } from "vitest";

describe("${operationTitle} ${capitalizedModuleName} - Input Variations", () => {
  it("should handle different input variations", async () => {
    // TODO: Implement test with different input variations
    expect(true).toBe(true);
  });
});
`;
};

// ============================================================================
// VALIDATION TESTS - Input validation & schema tests
// ============================================================================

/**
 * Generates validation test for required fields (simplified)
 */
const generateValidationRequiredTest = (operation: string, moduleName: string): string => {
  const capitalizedModuleName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  const operationTitle = operation.charAt(0).toUpperCase() + operation.slice(1);

  return `import { expect, it, describe } from "vitest";

describe("${capitalizedModuleName} ${operationTitle} - Required Field Validation", () => {
  it("should reject request with missing required fields", async () => {
    // TODO: Implement validation test for required fields
    expect(true).toBe(true);
  });
});
`;
};

/**
 * Generates validation test for field types and formats (simplified)
 */
const generateValidationTypesTest = (operation: string, moduleName: string): string => {
  const capitalizedModuleName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  const operationTitle = operation.charAt(0).toUpperCase() + operation.slice(1);

  return `import { expect, it, describe } from "vitest";

describe("${capitalizedModuleName} ${operationTitle} - Field Type Validation", () => {
  it("should reject invalid field types", async () => {
    // TODO: Implement validation test for field types
    expect(true).toBe(true);
  });
});
`;
};

// ============================================================================
// FAILURE TESTS - Error scenarios
// ============================================================================

/**
 * Generates failure test for not-found errors (404) (simplified)
 */
const generateFailureNotFoundTest = (operation: string, moduleName: string): string => {
  const capitalizedModuleName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  const operationTitle = operation.charAt(0).toUpperCase() + operation.slice(1);

  return `import { expect, it, describe } from "vitest";

describe("${capitalizedModuleName} ${operationTitle} - Not Found Errors", () => {
  it("should handle non-existent ${moduleName} ID gracefully", async () => {
    // TODO: Implement test for not found errors
    expect(true).toBe(true);
  });
});
`;
};

/**
 * Generates failure test for duplicate/conflict errors (409) (simplified)
 */
const generateFailureDuplicateTest = (_operation: string, moduleName: string): string => {
  const capitalizedModuleName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);

  return `import { expect, it, describe } from "vitest";

describe("${capitalizedModuleName} Create - Duplicate/Conflict Errors", () => {
  it("should handle duplicate ${moduleName} creation gracefully", async () => {
    // TODO: Implement test for duplicate/conflict errors
    expect(true).toBe(true);
  });
});
`;
};

/**
 * Generates failure test for unauthorized errors (401) (simplified)
 */
const generateFailureUnauthorizedTest = (operation: string, moduleName: string): string => {
  const capitalizedModuleName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  const operationTitle = operation.charAt(0).toUpperCase() + operation.slice(1);

  return `import { expect, it, describe } from "vitest";

describe("${capitalizedModuleName} ${operationTitle} - Authorization Errors", () => {
  it("should handle unauthorized ${operation} attempts gracefully", async () => {
    // TODO: Implement test for unauthorized access
    expect(true).toBe(true);
  });
});
`;
};

// ============================================================================
// GENERIC TESTS - For custom operations (simplified)
// ============================================================================

const generateGenericSuccessBasicTest = (operation: string, moduleName: string): string => {
  const capitalizedModuleName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  const operationTitle = operation.charAt(0).toUpperCase() + operation.slice(1);

  return `import { expect, it, describe } from "vitest";

describe("${capitalizedModuleName} ${operationTitle} - Basic Success", () => {
  it("should ${operation} successfully", async () => {
    // TODO: Implement test for custom operation
    expect(true).toBe(true);
  });
});
`;
};
