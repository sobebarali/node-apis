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
| `-f, --force` | Regenerate the untouched code of an existing module from its type files |
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

The type files are the source of truth. Once they exist they are never overwritten, not even with `--force`.

`--force` only regenerates files you have not touched. node-apis keeps a fingerprint of every file it writes in `<module>/.node-apis.json` (commit it). A file you edited by hand is kept as it is and listed as "kept"; reformatting a file with Prettier or Biome does not count as an edit. To regenerate a kept file, delete it and run the command again. Modules generated before 4.1.0 have no fingerprints, so their existing files are all kept.

## The envelope

Every handler and service takes one object (the payload fields plus `requestId`) and returns the same shape:

```ts
export type typeResult = {
  data: null | typeResultData;
  error: null | typeResultError;
};
```

Handlers never throw. A failure comes back as `error` with a `code`, `message`, `statusCode` and the `requestId`.

| Repository throws an error named | Handler returns |
| --- | --- |
| `NotFoundError` | `NOT_FOUND` / 404 |
| `DuplicateError` | `DUPLICATE_ENTRY` / 409 |
| anything else | `INTERNAL_ERROR` / 500, with a fixed message |

A code is only mapped when the type file's `typeResultError` declares it. The real error of a 500 is logged once with `console.error` and never sent to the caller. `VALIDATION_ERROR` is for your router to return when `validatePayload` fails.

```ts
export default async function getUserHandler({
  id,
  requestId,
}: {
  id: string;
  requestId: string;
}): Promise<typeResult> {
  try {
    const data = await get({ id });
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

Repositories, services and `--no-repository` handlers are generated as stubs that throw `... is not implemented` until you write them, so made-up data can never reach a caller. Every repository takes one object:

```ts
export default async function get({ id }: { id: string }): Promise<typeResultData> {
  const user = await db.user.findUnique({ where: { id } });

  if (!user) {
    throw Object.assign(new Error('User not found'), { name: 'NotFoundError' });
  }

  return user;
}
```

Each validator ends with `satisfies z.ZodType<typePayload>`, so a validator that no longer matches its type file stops compiling.

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

The generated code is already formatted (single quotes, 2 spaces, 100 columns). If the target project has Prettier installed, the files are also formatted with its config.

## Limits

- Nested object fields in `typePayload` are validated as `z.any()` and typed as `object` in handlers. Tighten those by hand.
- `typePayload` must be declared inline in the type file; imported or aliased types are not followed.
- With `exactOptionalPropertyTypes` enabled, validators with optional fields do not compile (Zod's `.optional()` allows `undefined`).

## License

MIT
