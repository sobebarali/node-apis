# node-apis Architecture

This is a Node.js/TypeScript CLI tool that generates framework-agnostic modules: types, Zod validators, handlers and repositories with one consistent `{ data, error }` shape.

## Project Overview

- **Type**: CLI Code Generator
- **Target**: TypeScript modules for any backend (oRPC, tRPC, Hono, Express, workers)
- **Frameworks**: None. Generated code never imports a web framework or router
- **Language**: TypeScript with strict type safety
- **Architecture**: Handlers → Repository, called from the user's own router
- **Validation**: Zod schemas generated from `typePayload`
- **Not in scope**: project scaffolding, routes, controllers, test generation

## Technology Stack

- **TypeScript**: Strict type safety
- **Node.js 16+**: Runtime environment
- **Commander.js**: CLI framework
- **Inquirer.js**: Interactive prompts
- **Zod**: Imported by the generated validators (provided by the target project)
- **Prettier / Biome**: Generated files are formatted with the target project's Prettier, or its Biome when it has no Prettier

## Available Scripts

- `npm run build` - Build the CLI tool
- `npm run start` - Run the CLI in interactive mode
- `npm run dev` - Run CLI with ts-node for development
- `npm run format` - Format code with Prettier

## CLI Usage

```bash
# Interactive mode
npm run start

# Generate CRUD operations
npm run start -- --name user --crud

# Generate custom operations
npm run start -- --name user --custom "sendEmail,resetPassword"

# Generate third-party service wrappers
npm run start -- --name payment --services "charge,refund"

# Handlers without a repository layer
npm run start -- --name user --crud --no-repository

# Regenerate code from the edited type files
npm run start -- --name user --crud --force
```

## Code Generator Architecture

### Core Components

1. **CLI Layer** (`src/cli/`): Command-line interface and user interaction
2. **Templates** (`src/templates/`): Code generation templates
3. **Services** (`src/services/`): Two-phase generation, type parsing, config, formatting
4. **Filesystem** (`src/filesystem/`): File and directory operations
5. **Types** (`src/types/`): TypeScript definitions for the generator itself

### Two-Phase Process

1. **Types**: write `types/operation.moduleName.ts` for each operation. A run that writes a new CRUD type file also writes the entity file `types/moduleName.ts`. Existing type files are never overwritten; they are hand-edited and are the source of truth.
2. **Code**: parse each `typePayload` and generate validators, handlers and repositories (or services) from it. `--force` regenerates only the files that were not edited by hand; fingerprints of generated files live in `<module>/.node-apis.json`.

### The Envelope

Every handler and service takes one object (payload fields plus `requestId`, or plus `context` when `handlers.context` is configured) and returns:

```typescript
export type typeResult =
  | { data: typeResultData; error: null }
  | { data: null; error: typeResultError };
```

A repository error with a known name maps to a returned error, only when the type file declares its code: `NotFoundError` → `NOT_FOUND` (404), `DuplicateError` → `DUPLICATE_ENTRY` (409), `ConflictError` → `CONFLICT` (409), `ForbiddenError` → `FORBIDDEN` (403), `BadRequestError` → `BAD_REQUEST` (400). Any other error is logged once and maps to `INTERNAL_ERROR` (500) with a fixed message, so handlers do not throw by default.

`statusCode` and `requestId` are written into an error only when `typeResultError` declares them.

### Generation Settings

Optional keys of `node-apis.config.json`, read by `getGenerationSettings` and passed to every template as `settings`. A template called without them produces the default output, which stays byte-identical between releases.

- `handlers.context: { type, from }`: handlers and services take `typePayload & { context: Type }` and have no `requestId`. `from` starting with `./` or `../` is a file path from the project root; anything else is the import path as written. Generated code never reads `context`, and repositories do not receive it
- `handlers.errors: 'throw'`: undeclared errors are thrown instead of mapped to `INTERNAL_ERROR`; new type files hold no `INTERNAL_ERROR`
- `handlers.errorsFile`: import path of the shared errors file (same path rule as `context.from`). A project path is written once from `errors.templates.ts` and never overwritten. New type files import their errors from it (`typeResultError = typeNotFound | typeInternalError`); handlers and services catch `Refusal` first and return its `error`; repository hints show `throw new Refusal(...)`. Existing inline type files keep the name mapping above
- `validators.validatePayload: false`: validators export only `payloadSchema`

### Shared Files

A file named after the module alone, with no operation, holds what the operations share.

- `types/moduleName.ts` is the entity file. It exports `type<Module>` (`types/post.ts` → `typePost`); the create, get and update results are that type and the list items are an array of it. It holds no `typePayload`, so the type parser skips it.
- `repository/moduleName.ts` is hand-written shared data access (a row mapper, a shared query). The generator never writes it.
- A module whose CRUD type files all exist is left without an entity file; the generator never rewrites type files to add the import.

### Generated Code Rules

- Repositories, services and `--no-repository` handlers are stubs that throw "not implemented"; they never return made-up data
- Every repository takes one object, never positional parameters
- Field names are camelCase (`createdAt`, `sortBy`, `pagination.totalCount`)
- Parameter types come from the type file (`typePayload & { requestId: string }`, `typePayload`, `Pick<typePayload, 'id'>`); fields are never re-declared
- An operation whose `typePayload` has no fields gets no validator; one is generated once the payload has fields
- Validators end with `satisfies z.ZodType<typePayload>` and are never cast
- A `typePayload` written as `{ ... } | undefined` is optional: the validator ends with `.optional()`, and handlers and repositories take `NonNullable<typePayload>`
- A dotted operation name is flattened before it is checked (`file.list` → `fileList`); keywords stay refused
- Validators check shape only: a string is `z.string()`, and no limits are guessed from field names, except the format of `email` and `url` fields
- New type files hold no placeholder fields, only the ID and pagination fields the operation needs
- Templates emit formatted code (single quotes, 2 spaces, 100 columns) without relying on a formatter
- A folder is an existing module only when it has `types/` or `.node-apis.json`; hand-written folders are generated into without `--force`
