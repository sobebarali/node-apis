# node-apis

A framework-agnostic TypeScript module generator. You describe an operation's input as a `typePayload`, and node-apis writes the validators, handlers and repositories around it, all in one consistent shape.

It does not scaffold a project, start a server or pick a router. It only writes modules, so every module in your codebase reads the same way, whether a person or an AI wrote the rest.

## Install

```bash
npm install -g node-apis
# or run it without installing
npx node-apis --name user --crud
```

The generated validators import `zod`, so your project needs it (`zod` 3 and 4 both work).

## Usage

```bash
# Interactive
node-apis

# CRUD module: create, get, list, update, delete
node-apis --name user --crud

# Custom operations
node-apis --name order --custom "cancel,sendReceipt"

# Third-party service wrappers
node-apis --name payment --services "charge,refund"

# Handlers without a repository layer
node-apis --name user --crud --no-repository
```

`napis` is a shorter alias for `node-apis`.

### Options

| Option | What it does |
| --- | --- |
| `-n, --name <name>` | Module name. Any casing works: `user-profile`, `userProfile`, `user_profile` |
| `--crud` | Generate create, get, list, update and delete |
| `--custom <names>` | Generate custom operations (comma-separated) |
| `--services <names>` | Generate service operations (comma-separated) |
| `--no-repository` | Skip the repository layer; handlers hold the logic |
| `-f, --force` | Regenerate the code of an existing module from its type files |
| `--no-interactive` | Never prompt (for scripts and AI agents) |
| `--target-dir <dir>` | Project root to generate into and read the config from (default: current directory) |
| `--init-config` | Create `node-apis.config.json` |
| `--set-apis-dir <dir>` | Save the modules directory in the config |

## What gets generated

```
src/apis/user-profile/
├── types/         # typePayload, typeResultData, typeResultError, typeResult
├── validators/    # Zod schema built from typePayload
├── handlers/      # business logic, returns { data, error }
└── repository/    # data access (skipped with --no-repository)
```

Each operation gets one file per folder, named `operation.moduleName.ts` (for example `create.userProfile.ts`).

A services module has two folders instead: `types/` and `services/`.

## Workflow

1. **Generate.** `node-apis --name user --crud` writes the type files and a first version of the code.
2. **Edit the types.** Open `types/*.ts` and describe the real payload and result:

   ```ts
   export type typePayload = {
     name: string;
     email: string;
     age?: number;
   };
   ```

3. **Regenerate.** `node-apis --name user --crud --force` rebuilds validators, handlers and repositories from your types.

The type files are the source of truth. Once they exist they are never overwritten, not even with `--force`. Everything else in the module is rewritten by `--force`, so regenerate before you fill in the real logic, not after.

## The envelope

Every handler and service takes one object (the payload fields plus `requestId`) and returns the same shape:

```ts
export type typeResult = {
  data: null | typeResultData;
  error: null | typeResultError;
};
```

Handlers never throw. A failure comes back as `error` with a `code`, `message`, `statusCode` and the `requestId`. A repository that throws an error named `NotFoundError` becomes `NOT_FOUND` / 404; anything else becomes `INTERNAL_ERROR` / 500.

```ts
export default async function getUserHandler({
  id,
  requestId,
}: {
  id: string;
  requestId: string;
}): Promise<typeResult> {
  try {
    const data = await get(id);
    return { data, error: null };
  } catch (error) {
    // mapped to { data: null, error: { code, message, statusCode, requestId } }
  }
}
```

## Wiring into your router

node-apis stops at the handler. Call it from whatever you use (oRPC, tRPC, Hono, Express, a queue worker):

```ts
import { validatePayload } from './apis/user/validators/create.user';
import createUserHandler from './apis/user/handlers/create.user';

const parsed = validatePayload(input);
if (!parsed.success) {
  // return a 400 with parsed.error
}

const { data, error } = await createUserHandler({ ...parsed.data, requestId });
```

The repositories are generated with a mock implementation and a `TODO`. Replace it with your database calls.

## Configuration

Modules go to `src/apis` by default. If the project has no `src/` folder (a monorepo root, for example), node-apis stops and asks you to choose the directory first:

```bash
node-apis --set-apis-dir packages/api/src/modules
```

This writes `node-apis.config.json` in the project root:

```json
{
  "version": "2.0.0",
  "paths": { "apisDir": "packages/api/src/modules" }
}
```

## Formatting

If the target project has Prettier installed, the generated files are formatted with it. Otherwise they are left as written, so run your own formatter (Biome, for example) over the module.

## Limits

- Nested object fields in `typePayload` are validated as `z.any()` and typed as `object` in handlers. Tighten those by hand.
- `typePayload` must be declared inline in the type file; imported or aliased types are not followed.

## License

MIT
