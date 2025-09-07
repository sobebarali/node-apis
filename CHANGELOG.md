# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
