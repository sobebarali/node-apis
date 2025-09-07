# Node APIs Generator

🚀 **The most advanced TypeScript API generator for Node.js** - Create production-ready API modules with clean architecture, comprehensive testing, and automatic code formatting.

## ✨ Why Choose Node APIs Generator?

- **🏗️ Clean Architecture** - Controller → Handler → Repository pattern
- **🌐 Multi-Framework** - Support for Express.js and Hono frameworks
- **🎨 Smart Naming** - Accepts any naming format, generates consistent professional code
- **⚡ Performance Monitoring** - Built-in execution timing and request correlation
- **🔍 Request Tracing** - Complete payload logging for easy debugging
- **🎯 Type-Driven** - Intelligent code generation from TypeScript types
- **✨ Auto-Formatting** - Prettier integration for consistent code style
- **🔄 Two-Phase Generation** - Review types first, then generate code
- **🧪 Comprehensive Testing** - Complete integration test suite generated automatically
- **🛡️ Production Ready** - Error handling, validation, and observability built-in
- **🚫 No Service Layer** - Direct handler-to-repository pattern for simplicity
- **📦 Zero Config** - Works out of the box with sensible defaults

## 🎯 What Makes This Different?

Unlike other generators that create static boilerplate, this tool:

1. **Parses your TypeScript types** and generates intelligent code
2. **Includes performance monitoring** and request correlation out of the box
3. **Follows modern clean architecture** patterns
4. **Generates working, formatted code** that's ready for production
5. **Creates comprehensive test suites** with integration tests
6. **Supports iterative development** with smart type-driven regeneration

## 🎨 Smart Naming System

The generator accepts **any naming format** and automatically converts it to professional, consistent naming conventions:

| Input Format | Directory | Files | Classes | Variables | Constants |
|--------------|-----------|-------|---------|-----------|-----------|
| `user-profile` | `user-profile/` | `create.userProfile.ts` | `CreateUserProfile` | `userProfile` | `USER_PROFILE` |
| `blog_post` | `blog-post/` | `create.blogPost.ts` | `CreateBlogPost` | `blogPost` | `BLOG_POST` |
| `productCategory` | `product-category/` | `create.productCategory.ts` | `CreateProductCategory` | `productCategory` | `PRODUCT_CATEGORY` |
| `OrderHistory` | `order-history/` | `create.orderHistory.ts` | `CreateOrderHistory` | `orderHistory` | `ORDER_HISTORY` |

**Benefits:**
- ✅ **Flexible Input** - Use any naming style you prefer
- ✅ **Valid JavaScript** - All generated identifiers are syntactically correct
- ✅ **Professional Output** - Follows industry-standard naming conventions
- ✅ **Import Safety** - No path mismatches or file not found errors

## 🚀 Quick Start

### Installation

```bash
# Global installation (recommended)
npm install -g node-apis

# Or use npx (no installation required)
npx node-apis
```

### Generate Your First API

```bash
# Interactive mode - just run the command!
node-apis

# Or specify directly - any naming format works!
node-apis --name user-profile --crud
node-apis --name blog_post --crud
node-apis --name productCategory --crud

# Choose your framework
node-apis --name book --crud --framework express  # Default
node-apis --name book --crud --framework hono     # Lightweight alternative
```

**That's it!** You'll get a complete, production-ready API module with:

- ✅ Controllers with request logging
- ✅ Handlers with performance monitoring
- ✅ Repository with clean data access
- ✅ TypeScript types and validation
- ✅ Comprehensive integration test suite
- ✅ Test configuration (Vitest + Supertest)
- ✅ Automatic code formatting

## 🏗️ Generated Architecture

Your APIs follow a clean, modern architecture with smart naming and comprehensive testing:

```
src/apis/user-profile/          # kebab-case directories
├── controllers/                # HTTP routing with payload logging
│   ├── create.userProfile.ts   # camelCase files → POST /api/user-profiles
│   ├── get.userProfile.ts      # GET /api/user-profiles/:id
│   ├── list.userProfile.ts     # GET /api/user-profiles
│   ├── update.userProfile.ts   # PUT /api/user-profiles/:id
│   └── delete.userProfile.ts   # DELETE /api/user-profiles/:id
├── handlers/                   # Business logic with performance monitoring
│   ├── create.userProfile.ts   # ✅ Execution timing
│   ├── get.userProfile.ts      # ✅ Error handling
│   └── ...                     # ✅ Request correlation
├── repository/                 # Data access layer
│   └── user-profile.repository.ts # ✅ Clean functions
├── types/                      # TypeScript definitions
│   ├── create.userProfile.ts   # ✅ Type-safe payloads
│   └── ...                     # ✅ Result types
├── validators/                 # Zod validation schemas
│   ├── create.userProfile.ts   # ✅ Input validation
│   └── ...                     # ✅ Error handling
└── user-profile.routes.ts      # Express/Hono router

tests/user-profile/             # Comprehensive test suite
├── create/
│   ├── validation.test.ts      # Input validation tests
│   ├── success.test.ts         # Happy path integration tests
│   └── errors.test.ts          # Error handling tests
├── get/
│   └── ... (same pattern for all operations)
└── shared/
    └── helpers.ts              # Test utilities
```

## 💡 Three-Phase Generation Process

**Phase 1: Types First**

```bash
node-apis --name book --crud
# Generates type files and asks for confirmation
```

**Phase 2: Code Generation**

```bash
# After you review and confirm types (type 'yes')
# Generates controllers, handlers, repositories, validators
# All code is automatically formatted with Prettier
```

**Phase 3: Test Generation**

```bash
# Automatically generates comprehensive test suite
# ✅ Integration tests for all endpoints
# ✅ Validation tests for all inputs
# ✅ Error handling tests
# ✅ Test configuration (Vitest + Supertest)
```

## 🔥 Generated Code Examples

### Controller (HTTP Layer) - Smart Naming in Action

```typescript
// Input: --name user-profile
// Generated: src/apis/user-profile/controllers/create.userProfile.ts

import { validatePayload } from '../validators/create.userProfile';
import createUserProfileHandler from '../handlers/create.userProfile';

export default async function createUserProfileController(req: Request, res: Response): Promise<void> {
  const requestId = (req.headers['x-request-id'] as string) || generateRequestId();

  // Professional naming: USER_PROFILE (CONSTANT_CASE)
  console.info(
    `${requestId} [CONTROLLER] - CREATE USER_PROFILE payload:`,
    JSON.stringify(req.body, null, 2)
  );

  // Validation with detailed error responses
  const validation = validatePayload(req.body);
  if (!validation.success) {
    res.status(400).json({
      data: null,
      error: { code: 'VALIDATION_ERROR', message: validation.error.message, statusCode: 400 },
    });
    return;
  }

  // Call handler with request correlation - PascalCase function names
  const result = await createUserProfileHandler(validation.data, requestId);
  const statusCode = result.error ? result.error.statusCode : 201;
  res.status(statusCode).json(result);
}
```

### Handler (Business Logic)

```typescript
export default async function createBookHandler(
  payload: typePayload,
  requestId: string
): Promise<typeResult> {
  let data: typeResultData | null = null;
  let error: typeResultError | null = null;

  try {
    const startTime = Date.now();
    console.info(`${requestId} [BOOK] - CREATE handler started`);

    // Direct repository call (no service layer)
    const book = await create(payload);
    data = book;

    const duration = Date.now() - startTime;
    console.info(`${requestId} [BOOK] - CREATE handler completed successfully in ${duration}ms`);
  } catch (err) {
    const customError = err as any;
    console.error(`${requestId} [BOOK] - CREATE handler error: ${customError.message}`);
    error = {
      code: customError.errorCode ?? 'INTERNAL_ERROR',
      message: customError.message ?? 'An unexpected error occurred',
      statusCode: customError.statusCode ?? 500,
    };
  }

  return { data, error };
}
```

### Repository (Data Access)

```typescript
export default async function create(payload: CreatePayload) {
  try {
    // Your database implementation here
    const book = {
      id: `book-${Date.now()}`,
      ...payload,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return book;
  } catch (error) {
    throw new DatabaseError(
      `Failed to create book: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
```

## 🧪 **Generated Test Suite**

### **Integration Tests (Focus on Real API Testing)**

```typescript
// tests/book/create-book/success.test.ts
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../../src/app';
import { typePayload } from '../../../src/apis/book/types/create.book';

describe('Create Book - Success Tests', () => {
  it('should create book successfully', async () => {
    const payload: typePayload = {
      title: 'Test Book',
      author: 'Test Author',
      metadata: { publisher: 'Test Publisher' },
    };

    const response = await request(app).post('/api/books').send(payload).expect(201);

    expect(response.body.data).toBeDefined();
    expect(response.body.error).toBeNull();
  });
});
```

### **Error Handling Tests**

```typescript
// tests/book/create-book/errors.test.ts
describe('Create Book - Error Tests', () => {
  it('should return 400 for invalid payload', async () => {
    const invalidPayload = { invalidField: 'invalid-value' };

    const response = await request(app).post('/api/books').send(invalidPayload).expect(400);

    expect(response.body.data).toBeNull();
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
```

### **Validation Tests**

```typescript
// tests/book/create-book/validation.test.ts
describe('Create Book - Validation Tests', () => {
  it('should validate required fields', () => {
    const payload: typePayload = {
      title: 'Valid Book',
      author: 'Valid Author',
      metadata: { publisher: 'Valid Publisher' },
    };

    const result = validatePayload(payload);
    expect(result.success).toBe(true);
  });
});
```

## 🎯 Usage Examples

### Basic CRUD API with Smart Naming

```bash
# Any naming format works - the generator handles it intelligently!
node-apis --name user-profile --crud      # kebab-case
node-apis --name blog_post --crud         # snake_case
node-apis --name productCategory --crud   # camelCase
node-apis --name OrderHistory --crud      # PascalCase

# All generate professional, consistent code:
# ✅ 5 endpoints: POST, GET, GET/:id, PUT/:id, DELETE/:id
# ✅ Complete TypeScript types with proper naming
# ✅ Zod validation schemas
# ✅ 15 integration tests (3 per operation)
# ✅ Test configuration (Vitest + Supertest)
# ✅ Performance monitoring
# ✅ Request correlation
# ✅ Auto-formatted code
```

### Multi-Framework Support

```bash
# Express.js (default)
node-apis --name user-profile --crud --framework express

# Hono (lightweight alternative)
node-apis --name blog_post --crud --framework hono

# Both generate framework-specific code with consistent naming!
```

### Custom Operations with Tests

```bash
# Generate custom user operations
node-apis --name user --custom "login,logout,resetPassword"

# What you get:
# ✅ 3 custom endpoints with full implementation
# ✅ Type-safe request/response interfaces
# ✅ Validation schemas
# ✅ 9 integration tests (3 per operation)
# ✅ Error handling tests
# ✅ Validation tests
```

### Interactive Mode (Recommended)

```bash
# Just run the command - it's smart!
node-apis

# The CLI will:
# 1. 🔍 Detect existing modules
# 2. 🤔 Ask what you want to do
# 3. 📝 Guide you through the process
# 4. ✨ Generate beautiful, working code
# 5. 🧪 Create comprehensive test suite
```

### Type-Driven Development with Smart Naming

```bash
# 1. Generate types first (any naming format!)
node-apis --name product_category --crud

# 2. Edit the types (add your fields)
# Edit: src/apis/product-category/types/create.productCategory.ts

# 3. Code and tests automatically use your exact types!
# All generated code is type-safe and uses consistent naming:
# - Directory: product-category/ (kebab-case)
# - Files: create.productCategory.ts (camelCase)
# - Classes: CreateProductCategoryController (PascalCase)
# - Variables: productCategory (camelCase)
# - Constants: PRODUCT_CATEGORY (CONSTANT_CASE)
```

### Run Your Tests

```bash
# Run all tests
npm test

# Run tests for specific module
npm run test:module -- product

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

## 📋 Command Line Options

| Option                  | Alias | Description                                                  |
| ----------------------- | ----- | ------------------------------------------------------------ |
| `--name <name>`         | `-n`  | Module name (skips interactive prompt)                       |
| `--crud`                |       | Generate CRUD operations (create, get, list, update, delete) |
| `--custom <names>`      |       | Generate custom operations (comma-separated)                 |
| `--framework <framework>` |     | Web framework to use (express\|hono), defaults to express    |
| `--force`               | `-f`  | Overwrite existing files                                     |
| `--no-interactive`      |       | Skip interactive prompts                                     |
| `--version`             | `-V`  | Show version number                                          |
| `--help`                | `-h`  | Show help information                                        |

## 🎨 What Makes the Generated Code Special?

### ✅ Performance Monitoring Built-In

```bash
req-1703123456789-abc123 [BOOK] - CREATE handler started
req-1703123456789-abc123 [BOOK] - CREATE handler completed successfully in 45ms
```

### ✅ Complete Request Tracing

```bash
req-1703123456789-abc123 [CONTROLLER] - CREATE BOOK payload: {
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald"
}
```

### ✅ Production-Ready Error Handling

```typescript
{
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required",
    "statusCode": 400
  }
}
```

### ✅ Type-Safe Throughout

- Controllers know exact request/response types
- Handlers use your custom field definitions
- Repositories match your data structure
- Validators enforce your business rules

## 🚀 Advanced Features

### Smart Type-Driven Generation

- **Parses your TypeScript types** and generates matching code
- **Regenerates handlers** when you update type definitions
- **Maintains consistency** between types and implementation
- **Tests automatically use your exact types** for complete type safety

### Comprehensive Testing

- **Integration tests only** - focus on real API behavior
- **No complex mocking** - tests actual endpoints with supertest
- **Type-safe tests** - all tests use your TypeScript types
- **Complete coverage** - validation, success, and error scenarios
- **Ready-to-run** - includes Vitest configuration and scripts

### Automatic Code Formatting

- **Prettier integration** formats all generated code
- **Consistent style** across your entire codebase
- **No manual formatting** needed

### Clean Architecture

- **No service layer bloat** - direct handler-to-repository pattern
- **Single responsibility** - each layer has a clear purpose
- **Easy to test** - clean separation of concerns
- **Performance monitoring** built into every handler

### Developer Experience

- **Interactive CLI** that guides you through the process
- **Smart defaults** that work out of the box
- **Incremental development** - add operations to existing modules
- **Type safety** throughout the entire stack
- **Test-driven development** ready out of the box

## 📦 Requirements

- **Node.js >= 16.0.0**
- **TypeScript project** (the generator creates TypeScript files)

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork** the repository
2. **Create** your feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

## 📋 Changelog

### v3.1.3 - Smart Naming System 🎨

**🎉 Major Enhancement: Smart Naming Transformation**
- ✅ **Flexible Input**: Accept any naming format (`kebab-case`, `snake_case`, `camelCase`, `PascalCase`)
- ✅ **Professional Output**: Generate consistent, industry-standard naming conventions
- ✅ **Import Safety**: Eliminate path mismatches and file not found errors
- ✅ **Framework Consistency**: Works seamlessly with both Express and Hono

**🔧 Technical Improvements:**
- ✅ **Template System**: Updated all templates for consistent naming
- ✅ **Path Resolution**: Fixed CLI path generation bugs
- ✅ **Code Quality**: Professional naming throughout generated code
- ✅ **Error Prevention**: No more invalid JavaScript identifiers

**📝 Examples:**
```bash
# All of these work perfectly now!
node-apis --name user-profile --crud      # → user-profile/ directory
node-apis --name blog_post --crud         # → blog-post/ directory
node-apis --name productCategory --crud   # → product-category/ directory
```

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🎉 Why Developers Love This Tool

> _"Finally, a code generator that creates code I actually want to use in production!"_

> _"The smart naming system is incredible - I can use any naming style and get perfect output!"_

> _"The comprehensive test suite saved me days of writing tests manually."_

> _"The performance monitoring and request tracing saved me hours of debugging."_

> _"Clean architecture out of the box - no more service layer spaghetti!"_

> _"The type-driven approach is genius - my handlers always match my data structure."_

> _"Integration tests that actually test the real API - brilliant!"_

> _"No more worrying about naming conventions - the generator handles it all professionally!"_

## 📊 **What You Get**

### **For CRUD APIs:**

- 🏗️ **22 files generated** (5 operations × 4 files + routes + repository)
- 🧪 **15 integration tests** (3 per operation)
- ⚡ **Production-ready** with monitoring and error handling
- 🎯 **Type-safe** throughout the entire stack

### **For Custom APIs:**

- 🏗️ **N×4 files generated** (N operations × 4 files + routes + repository)
- 🧪 **N×3 integration tests** (3 per operation)
- ⚡ **Production-ready** with monitoring and error handling
- 🎯 **Type-safe** throughout the entire stack

---

**Ready to generate amazing APIs with comprehensive tests?** 🚀

```bash
npm install -g node-apis
node-apis --name book --crud
npm test  # Run your generated tests!
```

**Happy coding and testing!** ✨
