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

## Command Line Options

| Option | Alias | Description |
|--------|-------|-------------|
| `--name <name>` | `-n` | Module name (skips interactive prompt) |
| `--force` | `-f` | Overwrite existing directories |
| `--no-interactive` | | Disable interactive mode |
| `--version` | `-V` | Output version number |
| `--help` | `-h` | Display help information |

## Examples

### Create a "todo" API module
```bash
node-apis -n todo
```

### Create a "user" module with force overwrite
```bash
node-apis -n user --force
```

### Interactive mode (default)
```bash
node-apis
```

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
