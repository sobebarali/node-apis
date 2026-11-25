# Folder Structure Guidelines

This document defines the folder structure of the node-apis module generator and of the modules it generates.

## Core Architecture Principles

- **Framework Agnostic**: Generated code never imports a web framework; handlers are plain async functions
- **Generated Structure**: Consistent organization for all generated modules
- **Type-First Development**: The `typePayload` in each type file drives code generation
- **Template-Based**: All code follows established template patterns
- **One Envelope**: Every handler and service returns `{ data, error }`

## Project Root Structure

```
node-apis/
├── src/                           # Generator source code
├── dist/                          # Compiled JavaScript output
├── bin/                           # CLI executable
├── .ruler/                        # Project documentation & guidelines
├── node-apis.config.json          # Generator configuration (paths.apisDir)
├── package.json                   # Dependencies and scripts
├── tsconfig.json                  # TypeScript configuration
└── README.md                      # Project documentation
```

## Code Generator Structure (`src/`)

```
src/
├── cli/                           # Command-line interface
│   ├── commands/
│   │   └── generate.command.ts    # Main generation command
│   ├── output/
│   │   └── formatter.ts           # Console output formatting
│   └── prompts/
│       ├── interactive.prompts.ts # Main interactive flow
│       └── type-review.prompts.ts # Type review prompts
├── filesystem/                    # File system operations
│   ├── directory.operations.ts    # Directory management
│   ├── file.operations.ts         # File read/write operations
│   └── path.utils.ts              # Module path resolution
├── services/                      # Generation logic
│   ├── config.service.ts          # node-apis.config.json handling
│   ├── formatter.service.ts       # Optional Prettier formatting
│   ├── module-detection.service.ts # Existing module detection
│   ├── module-generator.service.ts # Module directory creation
│   ├── two-phase-generator.service.ts # Types first, then code
│   └── type-parser.service.ts     # typePayload parsing
├── shared/
│   └── utils/
│       └── naming.utils.ts        # Module name casing
├── templates/                     # Code generation templates
│   ├── crud.templates.ts          # CRUD type files
│   ├── custom.templates.ts        # Custom operation type files
│   ├── services.templates.ts      # Service type files and services
│   ├── typed-crud.handlers.ts     # CRUD handlers
│   ├── typed-crud.validators.ts   # CRUD validators
│   ├── typed-custom.handlers.ts   # Custom handlers
│   ├── typed-custom.validators.ts # Custom validators
│   └── typed-repository.templates.ts # Repositories
├── types/                         # Generator type definitions
│   ├── cli.types.ts
│   ├── common.types.ts
│   ├── config.types.ts
│   └── generation.types.ts
├── validators/                    # Input validation
│   ├── location.validator.ts      # Path validation
│   └── module-name.validator.ts   # Module name validation
└── index.ts                       # CLI entry point
```

## Generated Module Structure

```
<apisDir>/                         # default: src/apis
└── {module-name}/
    ├── types/                     # operation.moduleName.ts, plus moduleName.ts (the entity, CRUD only)
    ├── validators/                # operation.moduleName.ts
    ├── handlers/                  # operation.moduleName.ts
    └── repository/                # operation.moduleName.ts (skipped with --no-repository);
                                   # moduleName.ts is hand-written shared data access
```

A services module contains `types/` and `services/` only.
