# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
