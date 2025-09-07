# Folder Structure Guidelines

This document defines the comprehensive folder structure and organization patterns for the Node.js API Generator project, ensuring scalability, maintainability, and clear separation of concerns.

## Core Architecture Principles

- **Clean Architecture**: Clear separation between controllers, handlers, and repository layers
- **Generated Structure**: Consistent organization for all generated API modules
- **Type-First Development**: TypeScript types drive code generation
- **Template-Based**: All code follows established template patterns
- **Framework Agnostic**: Business logic independent of web framework

## Project Root Structure

```
nodejs-api/
├── src/                           # Source code
│   ├── apis/                      # Generated API modules
│   ├── cli/                       # CLI commands and prompts
│   ├── core/                      # Core framework adapters
│   ├── filesystem/                # File system operations
│   ├── services/                  # Code generation services
│   ├── shared/                    # Shared utilities and errors
│   ├── templates/                 # Code generation templates
│   ├── types/                     # TypeScript type definitions
│   ├── validators/                # Input validation utilities
│   └── index.ts                   # CLI entry point
├── tests/                         # Generated test files
├── dist/                          # Compiled JavaScript output
├── bin/                           # CLI executable
├── .ruler/                        # Project documentation & guidelines
├── .augment/                      # Augment AI configuration
├── package.json                   # Dependencies and scripts
├── tsconfig.json                  # TypeScript configuration
├── vitest.config.ts              # Testing configuration
└── README.md                      # Project documentation
```

## Code Generator Structure (`src/`)

### Core Generator Components

```
src/
├── cli/                           # Command-line interface
│   ├── commands/                  # CLI command implementations
│   │   └── generate.command.ts    # Main generation command
│   ├── output/                    # Output formatting utilities
│   │   └── formatter.ts           # Console output formatting
│   └── prompts/                   # Interactive prompts
│       ├── interactive.prompts.ts # Main interactive flow
│       └── type-review.prompts.ts # Type review prompts
├── core/                          # Core framework adapters
│   ├── cli/                       # CLI core functionality
│   ├── errors/                    # Error handling
│   ├── frameworks/                # Framework adapters (Express, Hono)
│   ├── pipeline/                  # Generation pipeline
│   ├── services/                  # Core services
│   ├── templates/                 # Template base classes
│   ├── types/                     # Core type definitions
│   └── validators/                # Core validation
├── filesystem/                    # File system operations
│   ├── directory.operations.ts    # Directory management
│   ├── file.operations.ts         # File read/write operations
│   └── path.utils.ts              # Path utilities
├── services/                      # Business logic services
│   ├── file-generator.service.ts  # File generation orchestration
│   ├── formatter.service.ts       # Code formatting service
│   ├── module-detection.service.ts # Module detection logic
│   ├── module-generator.service.ts # Module generation logic
│   ├── test-config-generator.service.ts # Test configuration
│   ├── two-phase-generator.service.ts # Two-phase generation
│   └── type-parser.service.ts     # TypeScript type parsing
├── shared/                        # Shared utilities
│   ├── errors/                    # Error classes
│   │   └── index.ts               # Custom error definitions
│   └── middleware/                # Shared middleware
│       └── errorHandler.ts        # Error handling middleware
├── templates/                     # Code generation templates
│   ├── crud.*.ts                  # CRUD operation templates
│   ├── custom.*.ts                # Custom API templates
│   ├── routes.templates.ts        # Route generation
│   ├── repository.templates.ts    # Repository templates
│   ├── typed-*.ts                 # Typed template variants
│   └── test.config.ts             # Test configuration template
├── types/                         # Generator type definitions
│   ├── cli.types.ts               # CLI-specific types
│   ├── common.types.ts            # Common type definitions
│   └── generation.types.ts        # Generation-specific types
├── validators/                    # Input validation
│   ├── location.validator.ts      # Path validation
│   └── module-name.validator.ts   # Module name validation
└── index.ts                       # CLI entry point
```