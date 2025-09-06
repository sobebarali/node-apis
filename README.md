# Node APIs Generator

🚀 **The most advanced TypeScript API generator for Node.js** - Create production-ready API modules with clean architecture, performance monitoring, and automatic code formatting.

## ✨ Why Choose Node APIs Generator?

- **🏗️ Clean Architecture** - Controller → Handler → Repository pattern
- **⚡ Performance Monitoring** - Built-in execution timing and request correlation
- **🔍 Request Tracing** - Complete payload logging for easy debugging
- **🎯 Type-Driven** - Intelligent code generation from TypeScript types
- **✨ Auto-Formatting** - Prettier integration for consistent code style
- **🔄 Two-Phase Generation** - Review types first, then generate code
- **🛡️ Production Ready** - Error handling, validation, and observability built-in
- **🚫 No Service Layer** - Direct handler-to-repository pattern for simplicity
- **📦 Zero Config** - Works out of the box with sensible defaults

## 🎯 What Makes This Different?

Unlike other generators that create static boilerplate, this tool:

1. **Parses your TypeScript types** and generates intelligent code
2. **Includes performance monitoring** and request correlation out of the box
3. **Follows modern clean architecture** patterns
4. **Generates working, formatted code** that's ready for production
5. **Supports iterative development** with smart type-driven regeneration

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

# Or specify directly
node-apis --name book --crud
```

**That's it!** You'll get a complete, production-ready API module with:
- ✅ Controllers with request logging
- ✅ Handlers with performance monitoring
- ✅ Repository with clean data access
- ✅ TypeScript types and validation
- ✅ Automatic code formatting

## 🏗️ Generated Architecture

Your APIs follow a clean, modern architecture:

```
src/apis/book/
├── controllers/        # HTTP routing with payload logging
│   ├── create.book.ts  # POST /api/books
│   ├── get.book.ts     # GET /api/books/:id
│   ├── list.book.ts    # GET /api/books
│   ├── update.book.ts  # PUT /api/books/:id
│   └── delete.book.ts  # DELETE /api/books/:id
├── handlers/           # Business logic with performance monitoring
│   ├── create.book.ts  # ✅ Execution timing
│   ├── get.book.ts     # ✅ Error handling
│   └── ...             # ✅ Request correlation
├── repository/         # Data access layer
│   └── book.repository.ts # ✅ Clean functions
├── types/              # TypeScript definitions
│   ├── create.book.ts  # ✅ Type-safe payloads
│   └── ...             # ✅ Result types
├── validators/         # Zod validation schemas
│   ├── create.book.ts  # ✅ Input validation
│   └── ...             # ✅ Error handling
└── book.routes.ts      # Express router
```

## 💡 Two-Phase Generation Process

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

## 🔥 Generated Code Examples

### Controller (HTTP Layer)
```typescript
export default async function createBookController(req: Request, res: Response): Promise<void> {
  const requestId = (req.headers['x-request-id'] as string) || generateRequestId();

  // Complete payload logging for debugging
  console.info(`${requestId} [CONTROLLER] - CREATE BOOK payload:`, JSON.stringify(req.body, null, 2));

  // Validation with detailed error responses
  const validation = validatePayload(req.body);
  if (!validation.success) {
    res.status(400).json({
      data: null,
      error: { code: 'VALIDATION_ERROR', message: validation.error.message, statusCode: 400 }
    });
    return;
  }

  // Call handler with request correlation
  const result = await createBookHandler(validation.data, requestId);
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
    throw new DatabaseError(`Failed to create book: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
```

## 🎯 Usage Examples

### Basic CRUD API
```bash
# Generate a complete book API
node-apis --name book --crud

# What you get:
# ✅ 5 endpoints: POST, GET, GET/:id, PUT/:id, DELETE/:id
# ✅ Complete TypeScript types
# ✅ Zod validation schemas
# ✅ Performance monitoring
# ✅ Request correlation
# ✅ Auto-formatted code
```

### Custom Operations
```bash
# Generate custom user operations
node-apis --name user --custom "login,logout,resetPassword"

# What you get:
# ✅ 3 custom endpoints with full implementation
# ✅ Type-safe request/response interfaces
# ✅ Validation schemas
# ✅ Error handling
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
```

### Type-Driven Development
```bash
# 1. Generate types first
node-apis --name product --crud

# 2. Edit the types (add your fields)
# Edit: src/apis/product/types/create.product.ts

# 3. Regenerate code based on your types
node regenerate-services.js

# 4. Your handlers now use your exact field structure!
```

## 📋 Command Line Options

| Option | Alias | Description |
|--------|-------|-------------|
| `--name <name>` | `-n` | Module name (skips interactive prompt) |
| `--crud` | | Generate CRUD operations (create, get, list, update, delete) |
| `--custom <names>` | | Generate custom operations (comma-separated) |
| `--force` | `-f` | Overwrite existing files |
| `--no-interactive` | | Skip interactive prompts |
| `--version` | `-V` | Show version number |
| `--help` | `-h` | Show help information |

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

### Automatic Code Formatting
- **Prettier integration** formats all generated code
- **Consistent style** across your entire codebase
- **No manual formatting** needed

### Clean Architecture
- **No service layer bloat** - direct handler-to-repository pattern
- **Single responsibility** - each layer has a clear purpose
- **Easy to test** - clean separation of concerns

### Developer Experience
- **Interactive CLI** that guides you through the process
- **Smart defaults** that work out of the box
- **Incremental development** - add operations to existing modules
- **Type safety** throughout the entire stack

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

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🎉 Why Developers Love This Tool

> *"Finally, a code generator that creates code I actually want to use in production!"*

> *"The performance monitoring and request tracing saved me hours of debugging."*

> *"Clean architecture out of the box - no more service layer spaghetti!"*

> *"The type-driven approach is genius - my handlers always match my data structure."*

---

**Ready to generate amazing APIs?** 🚀

```bash
npm install -g node-apis
node-apis --name book --crud
```

**Happy coding!** ✨
