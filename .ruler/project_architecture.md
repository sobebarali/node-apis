# Node.js API Generator Architecture

This is a Node.js/TypeScript CLI tool for generating production-ready API modules with clean architecture, comprehensive testing, and automatic formatting.

## Project Overview

- **Type**: CLI Code Generator
- **Target**: Node.js API modules
- **Frameworks**: Express.js and Hono support
- **Language**: TypeScript with strict type safety
- **Architecture**: Clean Architecture (Controllers → Handlers → Repository)
- **Testing**: Vitest with comprehensive test generation
- **Validation**: Zod schemas for type-safe validation

## Technology Stack

### Core Technologies

- **TypeScript**: Strict type safety and modern JavaScript features
- **Node.js 16+**: Runtime environment
- **Commander.js**: CLI framework for command-line interface
- **Inquirer.js**: Interactive command-line prompts

### Generated Code Stack

- **Express.js**: Default web framework for generated APIs
- **Hono**: Alternative lightweight web framework support
- **Zod**: Schema validation for type-safe input validation
- **Vitest**: Modern testing framework with TypeScript support

### Code Generation

- **Template Engine**: Custom template system for code generation
- **Type Parser**: Analyzes TypeScript types for intelligent code generation
- **File System Operations**: Safe file creation and modification
- **Prettier Integration**: Automatic code formatting

### Development Tools

- **ESLint + Prettier**: Code linting and formatting
- **Vitest**: Testing framework for generated code
- **TypeScript Compiler**: Strict type checking
- **ts-node**: TypeScript execution for development

## Available Scripts

- `npm run build` - Build the CLI tool
- `npm run start` - Run the CLI in interactive mode
- `npm run dev` - Run CLI with ts-node for development
- `npm run format` - Format code with Prettier
- `npm run test:run` - Run generated tests with Vitest
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

## CLI Usage

```bash
# Interactive mode
npm run start

# Generate CRUD operations
npm run start -- --name user --crud

# Generate custom operations
npm run start -- --name user --custom "sendEmail,resetPassword"

# Specify framework
npm run start -- --name user --crud --framework hono

# Force overwrite existing files
npm run start -- --name user --crud --force
```

## Code Generator Architecture

### Core Components

1. **CLI Layer** (`src/cli/`): Command-line interface and user interaction
2. **Templates** (`src/templates/`): Code generation templates for different patterns
3. **Services** (`src/services/`): Business logic for file generation and formatting
4. **Core** (`src/core/`): Framework adapters and pipeline management
5. **Types** (`src/types/`): TypeScript definitions for the generator itself

### Template System

- **Template Engine**: Custom template system for generating consistent code
- **Framework Adapters**: Support for Express.js and Hono frameworks
- **Type-Driven Generation**: Uses TypeScript types to generate intelligent code
- **Two-Phase Process**: Type definition → Code generation
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier