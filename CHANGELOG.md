# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [4.5.0] - 2026-11-26

### Added

- `handlers.errorsFile`: one shared errors file, written once and never overwritten. It holds `typeError<Code, StatusCode, Data>` (with an optional `data` field), one type per status (400, 403, 404, 409, 422, 500), and `Refusal` with `refusable`. New type files import their errors from it instead of spelling them out. A repository throws `new Refusal({ code, message, statusCode })` and the handler returns it as the result error, also from inside a transaction
- An optional payload: write `typePayload` as `{ ... } | undefined` and the validator ends with `.optional()`; the handler and repository take `NonNullable<typePayload>`
- Dotted operation names for nested routers: `--custom file.list` generates `fileList`

### Changed

- An operation whose `typePayload` has no fields gets no validator: there is nothing to validate. The validator is generated once the payload has fields (run with `--force`). Validators that already exist are left alone
- `--custom` and `--services` take names separated by commas or spaces: `--custom "send receive"` and `--custom send receive` now mean two operations

### Fixed

- An operation name that is not letters and digits (`send-mail`, `send mail`) is refused before anything is written, instead of producing broken files or leaving empty folders behind
- A validator deleted from a no-payload operation no longer comes back on `--force`

Without `handlers.errorsFile`, handlers, services and repositories are generated exactly as in 4.4.0.

## [4.4.0] - 2026-11-25

### Added

- `handlers.context` in `node-apis.config.json`: handlers and services take `typePayload & { context: YourType }` instead of `requestId`. `from` is a file path from the project root (`./src/context`) or a package import path. Errors then carry no `requestId`
- `handlers.errors: "throw"`: errors the type file does not declare are thrown instead of being returned as `INTERNAL_ERROR`, for routers that already handle them
- `validators.validatePayload: false`: validators export only `payloadSchema`
- Three more repository error names are mapped when the type file declares their code: `ConflictError` → `CONFLICT` (409), `ForbiddenError` → `FORBIDDEN` (403), `BadRequestError` → `BAD_REQUEST` (400)
- Generated files are formatted with Biome when the project has Biome and no Prettier. New type files are formatted too

### Changed

- New type files declare `typeResult` as a union (`{ data; error: null } | { data: null; error }`), so checking `error` narrows `data`. Existing type files are not touched and keep working
- A string field is validated as `z.string()` instead of `z.string().min(1)`: the type says `string`, and the empty string is one. Regenerating with `--force` applies this to validators you have not edited; add `.min(1)` by hand where a field must not be empty
- A handler writes `statusCode` and `requestId` into an error only when `typeResultError` declares them, so either can be removed from the type
- A folder that holds no node-apis files (no `types/`, no `.node-apis.json`) is no longer refused: node-apis generates into it without `--force` and leaves the existing files alone

### Fixed

- A custom operation named after a JavaScript keyword (`delete`, `void`, `new`) is refused with a message instead of generating code that does not compile

Without the new settings, handlers, services and repositories are generated exactly as in 4.3.0.

## [4.3.0] - 2026-11-25

### Added

- A new CRUD module gets an entity file, `types/<module>.ts`, exporting one type (`types/post.ts` exports `typePost`). The create, get and update results are that type and the list items are an array of it, so the entity is described once instead of four times
- A convention for shared files, documented in the README: a file named after the module alone holds what the operations share. `types/<module>.ts` is the entity; `repository/<module>.ts` is hand-written shared data access such as a row mapper. Neither is ever overwritten

### Changed

- Only `operation.moduleName.ts` files in `types/` are read as operations. Other files you keep there are ignored

Existing modules are not changed: their type files stay as they are, and a module that already has all five CRUD type files gets no entity file. Adding the missing CRUD operations to an older module writes the entity file for the new type files to import.

## [4.2.0] - 2026-11-25

### Changed

- Handlers, services and repositories take their parameter type from the type file (`typePayload & { requestId: string }`, `typePayload`, `Pick<typePayload, 'id'>`) instead of repeating every field, so generated code cannot drift from its type
- Handlers pass optional fields to the repository as they are (`create({ title, tags })`) instead of `...(tags !== undefined && { tags })`
- Validators no longer guess limits from field names. A string is `z.string().min(1)`, a number is `z.number()`, an array has no maximum. Only fields named `email` / `...Email` and `url` / `...Url` add a format check. Add your own limits by hand
- Nested object types, arrays of objects, `Array<T>` and `Record<string, T>` in `typePayload` become real Zod schemas instead of `z.any()`
- New CRUD and custom type files start without placeholder fields (`name`, `description`, `status`): only the ID and pagination fields the operation needs
- Service type files use the handler envelope: a code union and `null | typeResultData`
- The list handler is named with a real plural (`listCategoriesHandler`, `listAddressesHandler`). A name that already ends in a single `s` is left alone (`listSettingsHandler`). Regenerating an existing module can rename its list handler, so update the import in your router
- A `typePayload` member the generator cannot read (a quoted key, an index signature, a method) is now reported with a warning instead of being left out silently

### Fixed

- A one-line nested object (`meta: { key: string };`) no longer hides the fields declared after it
- A union inside an object or array type is no longer split as if it were the field's own union
- `//` or a brace inside a string literal type no longer breaks the parsing of `typePayload`
- An empty payload (`Record<string, never>`) no longer drops the `NOT_FOUND` / `DUPLICATE_ENTRY` mapping on `--force`

## [4.1.0] - 2026-11-25

### Changed

- `--force` no longer overwrites files edited by hand. Fingerprints of generated files are stored in `<module>/.node-apis.json`; edited files are kept and reported, and reformatting does not count as an edit. Modules generated with 4.0.0 have no fingerprints, so their existing files are kept: delete a file to regenerate it
- Repositories, services and `--no-repository` handlers are stubs that throw "not implemented" instead of returning mock data
- Repositories take one object (`get({ id })`, `update({ id, name })`) instead of positional parameters
- Type templates use camelCase everywhere: `createdAt`, `updatedAt`, `deletedAt`, `sortBy`, `sortOrder`, and `pagination` (`totalCount`, `totalPages`, `hasNext`, `hasPrev`) instead of `_metadata`
- A repository error named `DuplicateError` maps to `DUPLICATE_ENTRY` / 409, next to `NotFoundError` → `NOT_FOUND` / 404. A code is mapped only when the type file declares it
- `INTERNAL_ERROR` responses carry a fixed message; the real error is logged once and no longer sent to the caller
- Validators follow the type exactly (update no longer makes every field optional) and end with `satisfies z.ZodType<typePayload>`, so a validator that drifts from its type stops compiling
- Generated code is formatted without Prettier: single quotes, multi-line payloads, lines within 100 columns

### Removed

- `as unknown as typeResultData` and `as typePayload` casts
- `console.info` logging in handlers and services
- `UNAUTHORIZED` / 401 from the type templates (authentication belongs to the router)
- Redundant validator rules such as `.positive().min(1)` and array `.min(0)`
- Repository `try/catch` blocks that rethrew a new error and lost the original stack

## [4.0.0] - 2026-11-25

### Breaking: framework-agnostic module generator

node-apis now only generates modules. It no longer knows about any web framework.

#### Removed

- `--framework` and `--api-style` options, and the `framework` / `trpcStyle` config keys (old config files still load; unknown keys are ignored)
- Express, Hono, tRPC, T3 and TanStack output: controllers, routes and procedures
- Test generation and the test configuration files

#### Changed

- A module is `types/`, `validators/`, `handlers/` and `repository/` (services: `types/` and `services/`)
- Handlers and services take the payload fields plus `requestId` and return `{ data, error }`
- Existing type files are never overwritten; `--force` regenerates only the code derived from them
- Non-interactive runs must pass `--crud`, `--custom` or `--services`
- Generated files are formatted only when the target project has Prettier installed
- `--version` reads the version from `package.json`
- Without a configured modules directory, generation stops when the project has no `src/` folder instead of creating a stray `src/apis`
- `--target-dir` is used for the config file and for existing-module detection too
- `--set-apis-dir` rejects blank, absolute and `..` paths and never replaces a config file it cannot read
- A field ending in `Id` is no longer guessed to be the record ID; only `<module>Id` or `id` is

#### Added

- `--no-repository` to generate handlers without a repository layer

## [3.6.1] - 2025-01-13

### 🛡️ Enhanced Error Handling & Type Safety

This release strengthens the generated code with consistent error handling patterns and improved type safety across all API entry points.

#### 🔧 tRPC Procedures Improvements

- **✅ Consistent Error Handling**: Added try-catch blocks to all tRPC procedure templates
  - Create, Get, List, Update, Delete, and Generic procedures now handle errors consistently
  - All procedures return standardized error format: `{ data: null, error: { code, message, statusCode, requestId } }`
  - Error handling now matches the pattern used in Express/Hono controllers

- **🎯 Enhanced Type Safety**: Improved `typePayload` usage in tRPC procedures
  - All procedures now explicitly type the input parameter: `async ({ input }: { input: typePayload })`
  - Better TypeScript intellisense and compile-time error checking
  - Consistent type imports across all procedure templates

#### 🏗️ Defense in Depth Error Handling

**Complete Error Handling Coverage:**
- **Controllers** ✅ - Handle validation and framework-level errors
- **tRPC Procedures** ✅ - Handle procedure-level errors (NEW)
- **Handlers** ✅ - Handle business logic errors
- **Repository** ✅ - Handle data access errors

#### 🎯 Benefits

- **🔄 Consistency**: All API entry points return the same `{ data, error }` format
- **🔍 Traceability**: Request IDs included in all error responses
- **🛡️ Reliability**: Prevents unhandled promise rejections from crashing the app
- **🎯 Framework Agnostic**: Same error handling regardless of Express/tRPC
- **📊 Monitoring**: Consistent error format for logging and monitoring systems

#### 📋 Updated Error Patterns

```typescript
// tRPC Procedure with Enhanced Error Handling
export const createUserProcedure = publicProcedure
  .input(payloadSchema)
  .mutation(async ({ input }: { input: typePayload }) => {
    const requestId = randomBytes(16).toString('hex');
    
    try {
      return await createUserHandler({
        ...input,
        requestId,
      });
    } catch (error) {
      return {
        data: null,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Something went wrong',
          statusCode: 500,
          requestId
        }
      };
    }
  });
```

### 🔄 Breaking Changes

None - this is a backward-compatible enhancement to existing templates.

### 📚 Documentation

- Updated README with error handling strategy discussion
- Added comprehensive error handling examples
- Documented the defense-in-depth approach

---

## [3.6.0] - 2025-01-13

### 🎨 Major Interactive CLI Enhancement - API Style Selection

This release introduces a **fundamental improvement** to the CLI workflow with the addition of **API Style Selection**, giving developers clear choice between REST and tRPC paradigms while maintaining full backward compatibility.

#### 🚀 New API Style Selection

- **🎨 Clear API Style Choice**: New interactive step to choose between REST and tRPC
  ```
  🚀 Which API style would you like to generate?
    🌐 REST APIs (traditional HTTP endpoints)
    🚀 tRPC (type-safe RPC procedures)
  ```
- **🧩 Separate Framework Choice**: Framework selection (Express/Hono) is now independent of API style
- **⚙️ Enhanced Configuration**: Save both API style and framework preferences independently

#### 🛠️ New CLI Commands

- **Primary Commands**:
  - `--api-style <style>` - Choose between `rest` or `trpc` (NEW)
  - `--set-api-style <style>` - Save API style preference to config (NEW)
  
- **Enhanced Interactive Flow**:
  1. Module name → API type → **API style** → Framework → Generation
  2. Smart prompting only when no preferences are saved
  3. Independent preference management for style and framework

#### 📋 Command Examples

```bash
# New syntax (recommended)
node-apis --name user --crud --api-style trpc --framework express
node-apis --name blog --crud --api-style rest --framework hono

# Configuration management
node-apis --set-api-style trpc
node-apis --set-framework express

# Interactive mode with enhanced flow
node-apis  # Now includes API style selection step
```

#### 🔄 Backward Compatibility

- **⚠️ Deprecated but Working**: `--trpc-style` flag still works with deprecation warnings
- **🔧 Automatic Migration**: Old configs with `trpcStyle: true` automatically convert to `apiStyle: 'trpc'`
- **📋 Graceful Transition**: All existing commands continue to work without breaking changes

#### 🎯 User Experience Improvements

- **🧠 Better Mental Model**: Clear separation between "what kind of API" (REST/tRPC) and "what framework" (Express/Hono)
- **💾 Smart Configuration**: Only prompts for missing preferences, saves choices independently
- **🔍 Enhanced Discoverability**: tRPC is prominently featured as an equal option to REST

#### 🏗️ Technical Implementation

- **📦 Type System Updates**: New `SupportedApiStyle` type alongside existing `SupportedFramework`
- **🔧 Service Functions**: New `getEffectiveApiStyle()`, `setApiStyle()`, and related prompt functions
- **✅ Validation Enhancement**: Config validation now includes API style checking
- **🔄 Template Integration**: Seamless integration with existing template system

### 🐛 Bug Fixes

- **🏢 Monorepo Support**: Enhanced `--target-dir` handling with better TypeScript strict mode compatibility
- **⚙️ Config Management**: Improved error handling and validation for configuration files

### 📚 Documentation

- **📖 Updated README**: Comprehensive documentation of new API style feature
- **🎯 Enhanced Examples**: Updated all examples to showcase new CLI syntax
- **📋 Command Reference**: Complete CLI options table with new commands and deprecation notices

---

## [3.5.0] - 2025-01-03

### 🎉 Major Code Generation Revolution

This release represents a massive leap forward in code quality, type safety, and developer experience. We've completely redesigned the code generation system with intelligent templates, automatic validation, and modern TypeScript patterns.

#### 🚀 Revolutionary Handler System

- **Object Destructuring Parameters**: All handlers now use clean object destructuring instead of positional parameters
  ```typescript
  // Before: createHandler(payload, requestId)
  // After: createHandler({ name, description, status, requestId })
  ```
- **Type-Safe Parameter Handling**: Full TypeScript inference with proper field-level destructuring
- **Consistent API Patterns**: Unified parameter patterns across all handlers and repositories

#### 🧠 Intelligent Validation System

- **Automatic Zod Schema Generation**: Smart conversion from TypeScript types to validation schemas
- **Pattern Recognition**: Automatic email, URL, phone, and UUID validation based on field names
- **Field-Specific Validation**:
  - `userEmail` → `z.string().email().optional()`
  - `userId` → `z.string().uuid()`
  - `phoneNumber` → `z.string().min(10)`
  - `profileUrl` → `z.string().url()`

#### 📋 Production-Ready Default Fields

- **Named Field Templates**: No more empty placeholders - every module generates with realistic fields
  ```typescript
  export type typePayload = {
    name: string;
    description?: string;
    status?: string;
    // Add more fields here
  };
  ```
- **Module-Specific IDs**: Smart ID naming (`todoId`, `userId`, `productId`) instead of generic `id`
- **Consistent Field Patterns**: Same meaningful fields across CREATE, GET, UPDATE, LIST operations

#### 🎯 Enhanced Type System

- **Smart ID Field Detection**: Automatically detects `todoId`, `userId`, etc. with fallback to generic `id`
- **Optional Field Handling**: Proper optional/required field management in UPDATE operations
- **Type-Driven Code Generation**: All code generated based on actual TypeScript type definitions

#### 🔧 Framework Integration Improvements

- **Express.js Support**: Enhanced Express controller generation with proper type imports
- **Hono Framework Support**: Full Hono integration with context-based parameter handling
- **Unified API Patterns**: Consistent code generation regardless of framework choice

#### ⚡ Developer Experience Enhancements

- **Immediate Usability**: Generated code works out-of-the-box with realistic examples
- **Copy-Paste Ready**: Perfect starting point for real-world development
- **Learning Tool**: Demonstrates TypeScript and API design best practices
- **Smart Comments**: Helpful guidance for customization and extension

#### 🏗️ Architecture Improvements

- **Two-Phase Generation**: Types first, then intelligent code generation based on parsed types
- **Template Consistency**: All templates follow the same modern patterns
- **Error Prevention**: Better type safety prevents common runtime errors
- **Maintainable Code**: Generated code follows clean architecture principles

### 📊 Performance & Quality

- **Faster Generation**: Optimized template system for quicker code generation
- **Better IntelliSense**: Enhanced TypeScript support with proper type inference
- **Cleaner Output**: More readable and maintainable generated code
- **Consistent Formatting**: All code properly formatted with Prettier integration

### 🔄 Breaking Changes

- **Handler Signatures**: Updated to use object destructuring (automatic migration)
- **ID Field Names**: Now uses module-specific IDs like `todoId` instead of generic `id`
- **Validator Templates**: Now generate actual validation schemas instead of placeholders

### 🛠️ Migration Guide

Existing projects can regenerate modules with `--force` flag to get the new improvements. The enhanced templates are backward compatible but provide significantly better developer experience.

## [3.4.0] - 2024-12-19

### 🎉 Major Interactive Mode Improvements

#### ✅ Fixed Critical Issues

- **Fixed API Type Selection Navigation**: Replaced broken arrow key navigation with reliable numbered selection (1-3)
- **Fixed Services Interactive Mode**: Users can now properly select and generate service operations interactively
- **Fixed Custom Operations Interactive Mode**: Custom API operations now work correctly in interactive mode

#### 🚀 New Interactive Features

- **Interactive Force Override**: Smart handling of existing modules with three options:
  - 🔄 Overwrite existing module (replace all files)
  - ➕ Add operations to existing module (append mode)
  - ❌ Cancel generation
- **Enhanced Operation Name Validation**: Comprehensive validation for custom and service operation names:
  - Validates camelCase format (e.g., `sendEmail`, `getUserProfile`)
  - Checks for reserved words and invalid characters
  - Provides helpful error messages and examples
  - Enforces length limits (2-50 characters)
- **Improved User Experience**:
  - Added emojis and better visual formatting
  - Clear examples and helpful tips for operation naming
  - Better error messages and validation feedback

#### 🔧 Technical Improvements

- **Numbered Selection System**: Reliable terminal-compatible selection for all environments
- **Enhanced Type Safety**: Improved TypeScript interfaces for all prompt responses
- **Better Error Handling**: Graceful fallbacks and comprehensive error recovery
- **Interactive Config Management**: Foundation for future config management features

#### 📊 Feature Parity Achieved

- **CLI vs Interactive**: All CLI functionality now available in interactive mode
- **Services Support**: Full interactive support for service operations
- **Custom Operations**: Complete interactive support for custom API operations
- **CRUD Operations**: Existing CRUD interactive support maintained

### 🧪 Testing & Validation

- Comprehensive testing across different terminal environments
- Validated all three API types (CRUD, Custom, Services) in interactive mode
- Confirmed proper folder structure generation for each API type
- Verified two-phase generation workflow for all operation types

## [3.3.1] - 2024-01-07

### Fixed

- **🏗️ Service Folder Structure**: Services now create only necessary folders (`services/` and `types/`) instead of all API folders
  - **Before**: Services created unnecessary `controllers/`, `handlers/`, `validators/`, `repository/` folders
  - **After**: Services create only `services/` and `types/` folders for cleaner architecture
  - **Impact**: Cleaner project structure for internal service operations

- **⚡ Two-Phase Generation Flow**: Fixed generation workflow to properly separate type creation from code generation
  - **Phase 1**: Now creates only main directory + `types/` subdirectory, generates type files
  - **User Review**: Prompts user to review and confirm generated types before proceeding
  - **Phase 2**: After confirmation, creates remaining directories and generates all other files
  - **Impact**: Better user experience with type customization before full code generation

- **🔧 CLI Integration**: Fixed interactive mode to respect API types provided via command line flags
  - **Before**: Always prompted for API type even when provided via `--crud`, `--custom`, or `--services`
  - **After**: Only prompts for missing information, respects CLI-provided API types
  - **Impact**: Smoother CLI experience with fewer redundant prompts

### Technical Improvements

- Enhanced `getModuleSubdirectories()` to accept API type parameter for conditional directory creation
- Added `generateModuleStructurePhase1()` and `generateModuleStructurePhase2()` functions
- Updated interactive flow to handle pre-provided API types correctly
- Improved type safety with exact optional property types

### Examples

```bash
# Services now create clean structure
node-apis --name stripe --services "createPayment,refund"
# Creates: src/apis/stripe/services/ and src/apis/stripe/types/ only

# Two-phase flow for all API types
node-apis --name user --crud
# Phase 1: Creates types/ and prompts for review
# Phase 2: Creates all remaining folders after confirmation
```

## [3.3.0] - 2024-01-07

### Added

- **New API Type**: Internal Service Operations (`--services`)
  - Generate third-party API integrations for internal use
  - Pure service functions without HTTP layer (no controllers, validators, routes)
  - Consistent type patterns with existing CRUD/Custom APIs
  - Comprehensive test generation (validation, success, error cases)
  - Template code with TODO comments for easy implementation
  - Perfect for payment processing, email services, cloud APIs

### Features

- **CLI Support**: Added `--services <names>` flag for service generation
- **Interactive Mode**: Added "Internal service operations" option in prompts
- **Service Templates**: Complete template system for service generation
- **Test Generation**: Full test suite generation for service modules
- **Type Consistency**: Uses same `typePayload`/`typeResult` pattern as CRUD/Custom
- **Documentation**: Updated README with service examples and three API types explanation

### Technical Implementation

- Added service templates (`services.templates.ts`, `services.tests.ts`)
- Updated CLI commands and prompts to support services
- Enhanced two-phase generator for service module generation
- Added 'services' directory to module subdirectories
- Updated type definitions for service operations

### Examples

```bash
# Generate payment service
node-apis --name stripe --services "createPayment,refund,getPaymentStatus"

# Generate email service
node-apis --name sendgrid --services "sendEmail,sendBulkEmail"
```

## [3.2.1] - 2024-01-07

### Fixed

- **Critical Bug**: Fixed Hono framework controller generation
  - All CRUD controllers (get, list, update, delete) were incorrectly generating Express.js code when Hono framework was selected
  - Only the create controller was properly using Hono framework
  - Custom controllers were also affected by the same issue
  - All controllers now correctly generate framework-specific code (Hono vs Express)
  - Custom routes now properly use Hono app instead of Express router when Hono is selected

### Technical Details

- Fixed `generateGetControllerContent`, `generateListControllerContent`, `generateUpdateControllerContent`, and `generateDeleteControllerContent` functions to respect framework parameter
- Fixed `generateCustomControllerContent` and `generateGenericCustomControllerContent` to support Hono framework
- Fixed `generateCustomRouteContent` and `generateGenericRouteContent` to use correct framework imports and syntax
- Updated two-phase generator to pass framework parameter to custom controller generation

## [3.2.0] - 2024-01-07

### Added

- **Configuration System**: New `node-apis.config.json` configuration file support
  - Set default framework preference to avoid repetitive prompts
  - Extensible configuration structure for future features (database ORM, etc.)
  - CLI commands: `--init-config` and `--set-framework <framework>`
  - Interactive framework selection with option to save preferences
  - CLI framework override still works when config exists

### Enhanced

- **Developer Experience**: Eliminates framework selection prompts in interactive mode when configured
- **CLI Options**: Added `--init-config` and `--set-framework` commands
- **Documentation**: Updated README with configuration examples and options

### Technical Details

- New config service with TypeScript strict type safety
- Config validation and error handling
- Merge functionality for updating existing configurations
- Framework precedence: CLI option > Config file > Default (express)

## [3.1.6] - Previous Release

### Features

- Clean Architecture (Controller → Handler → Repository)
- Multi-framework support (Express.js and Hono)
- Smart naming conventions
- Performance monitoring and request tracing
- Type-driven code generation
- Comprehensive integration testing
- Two-phase generation process
- Auto-formatting with Prettier
- Zero external dependencies in generated code
