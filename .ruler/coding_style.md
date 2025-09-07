# Coding Style Guidelines

This document outlines the coding style and quality standards for the Node.js API Generator project, enforcing strict type safety and consistent code quality using ESLint and Prettier.

## Key Principles

- **Type Safety First**: Strict TypeScript configuration with no implicit any
- **Consistent Formatting**: Automated code formatting with Prettier
- **Code Quality**: ESLint rules for maintainable and readable code
- **Error Prevention**: Comprehensive linting to catch issues early
- **Performance**: Efficient patterns and best practices

## ⚠️ CRITICAL: Template Structure Protection

**NEVER MODIFY EXISTING TEMPLATES WITHOUT EXPLICIT REQUEST**

The following template structures are PROTECTED and must NEVER be changed unless the user explicitly asks for template modifications:

### 🔒 Protected Template Files:
- `src/templates/crud.*.ts` - All CRUD operation templates
- `src/templates/custom.*.ts` - All custom API templates
- `src/templates/routes.templates.ts` - Route generation templates
- `src/templates/repository.templates.ts` - Repository templates
- `src/templates/*.tests.ts` - All test generation templates
- `src/templates/typed-*.ts` - All typed template files

### 🔒 Protected Template Patterns:
- **File naming conventions**: `operation.moduleName.ts` format
- **Directory structures**: Current folder organization in generated APIs
- **Test folder structure**: `tests/moduleName/operation/` pattern
- **Function parameter patterns**: Object destructuring `async({ params }: Type)`
- **Type definitions**: `typePayload`, `typeResult`, `typeResultData`, `typeResultError`
- **Import/export patterns**: Current module import/export structure

### 🚨 Template Modification Rules:
1. **NEVER** change template structure without explicit user request
2. **NEVER** modify existing template patterns or conventions
3. **NEVER** alter the generated file organization
4. **NEVER** change the established naming patterns
5. **ONLY** modify templates when user specifically asks: "change the template" or "modify the template structure"

### ✅ What IS Allowed:
- Bug fixes in template logic that don't change structure
- Adding new template options while preserving existing ones
- Improving template content quality without changing patterns
- Fixing TypeScript compilation errors in templates

### ❌ What is FORBIDDEN:
- Changing file naming patterns in templates
- Modifying directory structures in generated code
- Altering established function signatures in templates
- Changing import/export patterns without explicit request
- "Improving" or "optimizing" template structures unsolicited

## Development Tools

- **ESLint**: Code linting and quality enforcement
- **Prettier**: Code formatting and style consistency
- **TypeScript**: Strict type checking and compilation
- **Husky**: Git hooks for pre-commit quality checks
- **lint-staged**: Run linters on staged files only

## Before Writing Code

1. Analyze existing patterns in the codebase
2. Consider edge cases and error scenarios
3. Follow the TypeScript and linting rules strictly
4. Ensure proper error handling and validation
5. Use interfaces for all function parameters
6. Follow camelCase for files and kebab-case for directories

## Naming Conventions

### Generated File Naming Conventions

Generated files follow specific patterns that must be preserved:

- **Operation files**: `operation.moduleName.ts` (e.g., `create.user.ts`, `get.product.ts`)
- **Type files**: `operation.moduleName.ts` in `types/` directory
- **Validator files**: `operation.moduleName.ts` in `validators/` directory
- **Controller files**: `operation.moduleName.ts` in `controllers/` directory
- **Handler files**: `operation.moduleName.ts` in `handlers/` directory
- **Repository files**: `moduleName.repository.ts`
- **Route files**: `moduleName.routes.ts`

### Generated Directory Structure

```
src/apis/
└── {moduleName}/
    ├── controllers/
    ├── handlers/
    ├── repository/
    ├── types/
    ├── validators/
    └── {moduleName}.routes.ts

tests/
└── {moduleName}/
    ├── create/
    ├── get/
    ├── list/
    ├── update/
    ├── delete/
    └── shared/
```

## Generated Function Parameter Patterns

### Object Destructuring Parameters (Generated Pattern)

All generated functions use object destructuring for parameters:

```typescript
// ✅ Generated Pattern: Object destructuring in handlers
export default async function createUserHandler(
  payload: typePayload,
  requestId: string
): Promise<typeResult> {
  // Implementation
}

// ✅ Generated Pattern: Object destructuring in repository
export default async function create({
  name,
  email,
  password,
  role,
  is_active,
}: CreatePayload) {
  // Implementation
}

// ✅ Generated Pattern: Controllers with Express req/res
export default async function createUserController(req: Request, res: Response): Promise<void> {
  // Implementation
}
```

**Note**: See `folder_structure.md` for detailed interface patterns and comprehensive service examples.

### Benefits of Interface-Based Parameters

- **Readability**: Clear parameter names at call site
- **Maintainability**: Easy to add/remove parameters without breaking changes
- **Type Safety**: Better TypeScript inference and validation
- **Documentation**: Self-documenting function signatures

## Rules

### API Response Standards

- Always return consistent response structures
- Include appropriate HTTP status codes
- Provide meaningful error messages
- Use camelCase for JSON response fields
- Include request IDs for tracing when applicable

### Code Complexity and Quality

- Don't use consecutive spaces in regular expression literals.
- Don't use the `arguments` object.
- Don't use primitive type aliases or misleading types.
- Don't use the comma operator.
- Don't use empty type parameters in type aliases and interfaces.
- Don't write functions that exceed a given Cognitive Complexity score.
- Don't nest describe() blocks too deeply in test files.
- Don't use unnecessary boolean casts.
- Don't use unnecessary callbacks with flatMap.
- Use for...of statements instead of Array.forEach.
- Don't create classes that only have static members (like a static namespace).
- Don't use this and super in static contexts.
- Don't use unnecessary catch clauses.
- Don't use unnecessary constructors.
- Don't use unnecessary continue statements.
- Don't export empty modules that don't change anything.
- Don't use unnecessary escape sequences in regular expression literals.
- Don't use unnecessary fragments.
- Don't use unnecessary labels.
- Don't use unnecessary nested block statements.
- Don't rename imports, exports, and destructured assignments to the same name.
- Don't use unnecessary string or template literal concatenation.
- Don't use String.raw in template literals when there are no escape sequences.
- Don't use useless case statements in switch statements.
- Don't use ternary operators when simpler alternatives exist.
- Don't use useless `this` aliasing.
- Don't use any or unknown as type constraints.
- Don't initialize variables to undefined.
- Don't use the void operators (they're not familiar).
- Use arrow functions instead of function expressions.
- Use Date.now() to get milliseconds since the Unix Epoch.
- Use .flatMap() instead of map().flat() when possible.
- Use literal property access instead of computed property access.
- Don't use parseInt() or Number.parseInt() when binary, octal, or hexadecimal literals work.
- Use concise optional chaining instead of chained logical expressions.
- Use regular expression literals instead of the RegExp constructor when possible.
- Don't use number literal object member names that aren't base 10 or use underscore separators.
- Remove redundant terms from logical expressions.
- Use while loops instead of for loops when you don't need initializer and update expressions.
- Don't pass children as props.
- Don't reassign const variables.
- Don't use constant expressions in conditions.
- Don't use `Math.min` and `Math.max` to clamp values when the result is constant.
- Don't return a value from a constructor.
- Don't use empty character classes in regular expression literals.
- Don't use empty destructuring patterns.
- Don't call global object properties as functions.
- Don't declare functions and vars that are accessible outside their block.
- Make sure builtins are correctly instantiated.
- Don't use super() incorrectly inside classes. Also check that super() is called in classes that extend other constructors.
- Don't use variables and function parameters before they're declared.
- Don't use 8 and 9 escape sequences in string literals.
- Don't use literal numbers that lose precision.

### Backend Best Practices

- Always validate request input before processing
- Use middleware for cross-cutting concerns (auth, logging, etc.)
- Implement proper error boundaries with try-catch blocks
- Log errors with appropriate context for debugging
- Use database transactions for multi-step operations
- Implement idempotency for critical operations
- Use connection pooling for database connections
- Set appropriate timeouts for external API calls
- Implement circuit breakers for external dependencies
- Use rate limiting to prevent abuse
- Sanitize all user inputs to prevent injection attacks
- Never log sensitive information (passwords, tokens, etc.)
- Use environment variables for configuration
- Implement health check endpoints for monitoring

### Correctness and Safety

- Don't assign a value to itself.
- Don't return a value from a setter.
- Don't compare expressions that modify string case with non-compliant values.
- Don't use lexical declarations in switch clauses.
- Don't use variables that haven't been declared in the document.
- Don't write unreachable code.
- Make sure super() is called exactly once on every code path in a class constructor before this is accessed if the class has a superclass.
- Don't use control flow statements in finally blocks.
- Don't use optional chaining where undefined values aren't allowed.
- Don't have unused function parameters.
- Don't have unused imports.
- Don't have unused labels.
- Don't have unused private class members.
- Don't have unused variables.
- Make sure void (self-closing) elements don't have children.
- Don't return a value from a function with the return type 'void'
- Use isNaN() when checking for NaN.
- Make sure "for" loop update clauses move the counter in the right direction.
- Make sure typeof expressions are compared to valid values.
- Make sure generator functions contain yield.
- Don't use await inside loops.
- Don't use bitwise operators.
- Don't use expressions where the operation doesn't change the value.
- Make sure Promise-like statements are handled appropriately.
- Don't use **dirname and **filename in the global scope.
- Prevent import cycles.
- Don't use configured elements.
- Don't hardcode sensitive data like API keys and tokens.
- Don't let variable declarations shadow variables from outer scopes.
- Don't use the TypeScript directive @ts-ignore.
- Prevent duplicate polyfills from Polyfill.io.
- Don't use useless backreferences in regular expressions that always match empty strings.
- Don't use unnecessary escapes in string literals.
- Don't use useless undefined.
- Make sure getters and setters for the same property are next to each other in class and object definitions.
- Make sure object literals are declared consistently (defaults to explicit definitions).
- Use static Response methods instead of new Response() constructor when possible.
- Make sure switch-case statements are exhaustive.
- Make sure the `preconnect` attribute is used when using Google Fonts.
- Use `Array#{indexOf,lastIndexOf}()` instead of `Array#{findIndex,findLastIndex}()` when looking for the index of an item.
- Make sure iterable callbacks return consistent values.
- Use `with { type: "json" }` for JSON module imports.
- Use numeric separators in numeric literals.
- Use object spread instead of `Object.assign()` when constructing new objects.
- Always use the radix argument when using `parseInt()`.
- Make sure JSDoc comment lines start with a single asterisk, except for the first one.
- Include a description parameter for `Symbol()`.
- Don't use spread (`...`) syntax on accumulators.
- Don't use the `delete` operator.
- Don't access namespace imports dynamically.
- Don't use namespace imports.
- Declare regex literals at the top level.
- Don't use `target="_blank"` without `rel="noopener"`.

### TypeScript Best Practices

- Don't use TypeScript enums.
- Don't export imported variables.
- Don't add type annotations to variables, parameters, and class properties that are initialized with literal expressions.
- Don't use TypeScript namespaces.
- Don't use non-null assertions with the `!` postfix operator.
- Don't use parameter properties in class constructors.
- Don't use user-defined types.
- Use `as const` instead of literal types and type annotations.
- Use either `T[]` or `Array<T>` consistently.
- Initialize each enum member value explicitly.
- Use `export type` for types.
- Use `import type` for types.
- Make sure all enum members are literal values.
- Don't use TypeScript const enum.
- Don't declare empty interfaces.
- Don't let variables evolve into any type through reassignments.
- Don't use the any type.
- Don't misuse the non-null assertion operator (!) in TypeScript files.
- Don't use implicit any type on variable declarations.
- Don't merge interfaces and classes unsafely.
- Don't use overload signatures that aren't next to each other.
- Use the namespace keyword instead of the module keyword to declare TypeScript namespaces.

### Style and Consistency

- Don't use global `eval()`.
- Don't use callbacks in asynchronous tests and hooks.
- Don't use negation in `if` statements that have `else` clauses.
- Don't use nested ternary expressions.
- Don't reassign function parameters.
- This rule lets you specify global variable names you don't want to use in your application.
- Don't use specified modules when loaded by import or require.
- Don't use constants whose value is the upper-case version of their name.
- Use `String.slice()` instead of `String.substr()` and `String.substring()`.
- Don't use template literals if you don't need interpolation or special-character handling.
- Don't use `else` blocks when the `if` block breaks early.
- Don't use yoda expressions.
- Don't use Array constructors.
- Use `at()` instead of integer index access.
- Follow curly brace conventions.
- Use `else if` instead of nested `if` statements in `else` clauses.
- Use single `if` statements instead of nested `if` clauses.
- Use `new` for all builtins except `String`, `Number`, and `Boolean`.
- Use consistent accessibility modifiers on class properties and methods.
- Use `const` declarations for variables that are only assigned once.
- Put default function parameters and optional function parameters last.
- Include a `default` clause in switch statements.
- Use the `**` operator instead of `Math.pow`.
- Use `for-of` loops when you need the index to extract an item from the iterated array.
- Use `node:assert/strict` over `node:assert`.
- Use the `node:` protocol for Node.js builtin modules.
- Use Number properties instead of global ones.
- Use assignment operator shorthand where possible.
- Use function types instead of object types with call signatures.
- Use template literals over string concatenation.
- Use `new` when throwing an error.
- Don't throw non-Error values.
- Use `String.trimStart()` and `String.trimEnd()` over `String.trimLeft()` and `String.trimRight()`.
- Use standard constants instead of approximated literals.
- Don't assign values in expressions.
- Don't use async functions as Promise executors.
- Don't reassign exceptions in catch clauses.
- Don't reassign class members.
- Don't compare against -0.
- Don't use labeled statements that aren't loops.
- Don't use void type outside of generic or return types.
- Don't use console.
- Don't use control characters and escape sequences that match control characters in regular expression literals.
- Don't use debugger.
- Don't assign directly to document.cookie.
- Use `===` and `!==`.
- Don't use duplicate case labels.
- Don't use duplicate class members.
- Don't use duplicate conditions in if-else-if chains.
- Don't use two keys with the same name inside objects.
- Don't use duplicate function parameter names.
- Don't have duplicate hooks in describe blocks.
- Don't use empty block statements and static blocks.
- Don't let switch clauses fall through.
- Don't reassign function declarations.
- Don't allow assignments to native objects and read-only global variables.
- Use Number.isFinite instead of global isFinite.
- Use Number.isNaN instead of global isNaN.
- Don't assign to imported bindings.
- Don't use irregular whitespace characters.
- Don't use labels that share a name with a variable.
- Don't use characters made with multiple code points in character class syntax.
- Make sure to use new and constructor properly.
- Don't use shorthand assign when the variable appears on both sides.
- Don't use octal escape sequences in string literals.
- Don't use Object.prototype builtins directly.
- Don't redeclare variables, functions, classes, and types in the same scope.
- Don't have redundant "use strict".
- Don't compare things where both sides are exactly the same.
- Don't let identifiers shadow restricted names.
- Don't use sparse arrays (arrays with holes).
- Don't use template literal placeholder syntax in regular strings.
- Don't use the then property.
- Don't use unsafe negation.
- Don't use var.
- Don't use with statements in non-strict contexts.
- Make sure async functions actually use await.
- Make sure default clauses in switch statements come last.
- Make sure to pass a message value when creating a built-in error.
- Make sure get methods always return a value.
- Use a recommended display strategy with Google Fonts.
- Make sure for-in loops include an if statement.
- Use Array.isArray() instead of instanceof Array.
- Make sure to use the digits argument with Number#toFixed().
- Make sure to use the "use strict" directive in script files.

### Express.js Specific Rules

- Always use error-handling middleware as the last middleware
- Use async/await with proper error handling in route handlers
- Set appropriate CORS headers for API endpoints
- Use body-parser or express.json() for parsing request bodies
- Implement request validation middleware before route handlers
- Use router instances for modular route organization
- Set security headers using helmet middleware
- Implement request logging with appropriate middleware

### Testing Best Practices

- Don't use export or module.exports in test files.
- Don't use focused tests.
- Make sure the assertion function, like expect, is placed inside an it() function call.
- Don't use disabled tests.

## Common Tasks

- `npx ultracite init` - Initialize Ultracite in your project
- `npx ultracite format` - Format and fix code automatically
- `npx ultracite lint` - Check for issues without fixing

## Example: Error Handling

```typescript
// ✅ Good: Comprehensive error handling
try {
  const result = await fetchData();
  return { success: true, data: result };
} catch (error) {
  console.error('API call failed:', error);
  return { success: false, error: error.message };
}

// ❌ Bad: Swallowing errors
try {
  return await fetchData();
} catch (e) {
  console.log(e);
}
```
