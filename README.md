# Node APIs

A simple, fast CLI tool to generate boilerplate folder structures for Node.js API modules. Built with TypeScript and functional programming principles.

## Features

- 🚀 **Interactive CLI** - Prompts for module name with validation
- 📁 **Consistent Structure** - Creates standardized folder layout
- ✅ **Input Validation** - Ensures valid module names
- 🛡️ **Error Handling** - Graceful handling of edge cases
- 🎨 **Colored Output** - Beautiful terminal interface
- ⚡ **Fast & Lightweight** - Minimal dependencies
- 🔧 **TypeScript** - Built with TypeScript for type safety
- 🎯 **Functional Programming** - Clean, functional code style
- 📄 **File Generation** - Generates TypeScript type definitions
- 🔄 **CRUD Support** - Built-in CRUD operation templates
- 🎨 **Custom APIs** - Support for custom API operation names
- 🔧 **Smart Append** - Add operations to existing modules without overwriting
- 🧠 **Intelligent Detection** - Automatically detects existing modules

## Installation

### Global Installation (Recommended)

```bash
npm install -g node-apis
```

### Using npx (No Installation Required)

```bash
npx node-apis
```

## Usage

### Interactive Mode

```bash
node-apis
```

The CLI will prompt you for the module name and create the structure.

### Command Line Mode

```bash
# Create a module named "todo"
node-apis -n todo

# Create with CRUD operations
node-apis -n todo --crud

# Create with custom API operations
node-apis -n user --custom "login,logout,resetPassword"

# Create with force overwrite
node-apis -n user --force

# Non-interactive mode
node-apis -n product --no-interactive
```

### Short Alias

You can also use the short alias `napis`:

```bash
napis -n todo
```

## Generated Structure

The tool creates the following folder structure in `src/apis/{module-name}/`:

```
src/apis/{module-name}/
├── controllers/     # Route controllers
├── handlers/        # Business logic handlers
├── schema/          # Data schemas and models
├── types/           # TypeScript type definitions
├── repository/      # Data access layer
└── validators/      # Input validation logic
```

## Generated TypeScript Files

When you specify `--crud` or `--custom`, the tool generates TypeScript type definition files in the `types/` directory:

### CRUD Operations
```bash
node-apis -n todo --crud
```
Generates:
- `create.todo.ts` - Create operation types
- `get.todo.ts` - Get operation types
- `list.todo.ts` - List operation types
- `delete.todo.ts` - Delete operation types
- `update.todo.ts` - Update operation types

### Custom Operations
```bash
node-apis -n user --custom "login,logout,resetPassword"
```
Generates:
- `login.user.ts` - Login operation types
- `logout.user.ts` - Logout operation types
- `resetPassword.user.ts` - Reset password operation types

Each generated file contains:
- Request interface
- Response interface
- Parameters interface
- Usage examples

## Enhanced Interactive Workflow

### Adding Operations to Existing Modules

When you run `node-apis` and have existing modules, you'll see:

```
🔍 Found existing modules:
   • todo
   • user
   • product

? What would you like to do?
❯ ➕ Create a new module
  🔧 Add operations to existing module
```

Select "Add operations to existing module" and it will:
1. Show you all existing modules
2. Let you pick which one to extend
3. Display current files in that module
4. Add new operations **without overwriting** existing ones

### Example: Adding Custom Operations to Todo Module

```bash
# Just run the simple command
node-apis

# Interactive flow:
# 1. Choose "Add operations to existing module"
# 2. Select "todo"
# 3. See existing files: create.todo.ts, get.todo.ts, etc.
# 4. Choose "Custom API operations"
# 5. Enter: markComplete,archive,duplicate,share
# 6. Confirm and done!
```

**Result:** Your existing CRUD files remain untouched, and you get new files:
- `markComplete.todo.ts`
- `archive.todo.ts`
- `duplicate.todo.ts`
- `share.todo.ts`

## Command Line Options

| Option | Alias | Description |
|--------|-------|-------------|
| `--name <name>` | `-n` | Module name (skips interactive prompt) |
| `--crud` | | Generate CRUD operations (create, get, list, delete, update) |
| `--custom <names>` | | Generate custom API operations (comma-separated names) |
| `--force` | `-f` | Overwrite existing directories |
| `--no-interactive` | | Disable interactive mode |
| `--version` | `-V` | Output version number |
| `--help` | `-h` | Display help information |

## Examples

### Create a "todo" API module with CRUD operations
```bash
node-apis -n todo --crud
```

### Create a "user" module with custom operations
```bash
node-apis -n user --custom "login,logout,resetPassword"
```

### Create a "product" module with force overwrite
```bash
node-apis -n product --force
```

### Interactive mode (default) - Developer Friendly!
```bash
node-apis
```

The interactive mode is now super developer-friendly! It will:
1. **Detect existing modules** and show them to you
2. **Ask if you want to create new or add to existing**
3. **Show existing files** when adding to existing modules
4. **Append new operations** without overwriting existing files
5. **Guide you through the process** step by step

No more long command lines needed! 🎉

## Validation Rules

Module names must:
- Not be empty
- Start with a letter or underscore
- Contain only letters, numbers, hyphens, and underscores
- Be valid directory names

## Requirements

- Node.js >= 16.0.0

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Changelog

### v1.0.0
- Initial release
- Interactive CLI with module name prompts
- Folder structure generation
- Input validation and error handling
- Command line options support
