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
| `--custom <names>` | Generate custom operations (names separated by commas or spaces). A dotted name is flattened: `file.list` becomes `fileList` |
| `--services <names>` | Generate service operations (names separated by commas or spaces) |
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
├── validators/    # Zod schema built from typePayload (none for a payload with no fields)
├── handlers/      # business logic, returns { data, error }
└── repository/    # data access (skipped with --no-repository)
```

Each operation gets one file per folder, named `operation.moduleName.ts` (for example `create.userProfile.ts`).

A CRUD module also gets `types/userProfile.ts`, the entity file. It holds the one type the operations share; see [Shared files](#shared-files).

A services module has two folders instead: `types/` and `services/`.

## Workflow

1. **Generate.** `node-apis --name user --crud` writes the type files and a first version of the code. New type files hold only the ID and pagination fields an operation needs; the rest is yours to add.
2. **Edit the types.** Open `types/*.ts` and describe the real payload and result:

   ```ts
   export type typePayload = {
     name: string;
     email: string;
     age?: number;
   };
   ```

   In a CRUD module, describe the entity once in `types/user.ts`; the create, get, update and list results build on it.

3. **Regenerate.** `node-apis --name user --crud --force` rebuilds validators, handlers and repositories from your types.

The type files are the source of truth. Once they exist they are never overwritten, not even with `--force`.

A folder you wrote by hand can become a module: node-apis generates into it and leaves the files it finds alone. Only a folder it generated into before (one with `types/` or `.node-apis.json`) asks for `--force`.

`--force` only regenerates files you have not touched. node-apis keeps a fingerprint of every file it writes in `<module>/.node-apis.json` (commit it). A file you edited by hand is kept as it is and listed as "kept"; reformatting a file with Prettier or Biome does not count as an edit. To regenerate a kept file, delete it and run the command again. Modules generated before 4.1.0 have no fingerprints, so their existing files are all kept.

## Shared files

A file named `operation.moduleName.ts` belongs to one operation. A file named after the module alone holds what the operations share.

**`types/post.ts`, the entity file.** Generated once with a new CRUD module, then yours:

```ts
export type typePost = {
  postId: string;
  title: string;
  status: 'draft' | 'published';
  createdAt: string;
};
```

The create, get, update and list type files import it, so a field added here reaches all four:

```ts
import type { typePost } from './post';

export type typeResultData = typePost;
```

An operation that returns something else declares its own `typeResultData` (`Pick<typePost, 'postId' | 'title'>`, or a new shape).

**`repository/post.ts`, shared data access.** Written by hand when two repositories need the same thing, usually the mapping from a database row to the entity:

```ts
import type { typePost } from '../types/post';

export const toPost = (row: PostRow): typePost => ({
  postId: row.id,
  title: row.title,
  status: row.status,
  createdAt: row.created_at.toISOString(),
});
```

node-apis never generates a `repository/post.ts`, and never overwrites either shared file. A module generated before 4.3.0 has no entity file and keeps working as it is; add one by hand whenever you like. Adding missing CRUD operations to such a module writes the entity file, because the new type files import it.

## The envelope

Every handler and service takes one object (the payload fields plus `requestId`, or [your own context](#handler-context)) and returns the same shape:

```ts
export type typeResult =
  | { data: typeResultData; error: null }
  | { data: null; error: typeResultError };
```

The result is a union, so after `if (error) return ...` TypeScript knows `data` is not `null`. Type files written before 4.4.0 keep their `{ data: null | ...; error: null | ... }` shape and still work.

Handlers never throw by default. A failure comes back as `error` with a `code`, `message`, `statusCode` and the `requestId`. The handler writes `statusCode` and `requestId` only when `typeResultError` declares them, so delete either field from the type if you do not want it.

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
}: typePayload & { requestId: string }): Promise<typeResult> {
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
export default async function get({ id }: Pick<typePayload, 'id'>): Promise<typeResultData> {
  const user = await db.user.findUnique({ where: { id } });

  if (!user) {
    throw Object.assign(new Error('User not found'), { name: 'NotFoundError' });
  }

  return user;
}
```

Handlers, services and repositories take their parameter type from the type file, and each validator ends with `satisfies z.ZodType<typePayload>`. Code that no longer matches its type file stops compiling.

Validators check shape, not limits. A string becomes `z.string()` (the empty string is a valid `string`; add `.min(1)` or `.trim()` where you need it), a number `z.number()`, and nested objects, arrays, unions and `Record<string, T>` become the matching Zod schema. The only rule read from a field name is the format of `email` / `...Email` and `url` / `...Url`. Add limits such as `.max(255)` by hand; an edited validator is kept on `--force` and still has to satisfy the type.

A payload the caller may leave out is written in the type file as `{ ... } | undefined`. The validator then ends with `.optional()`, and the handler and repository take `NonNullable<typePayload>`, so `handler({ ...input, context })` works whether or not input was sent.

```ts
export type typePayload = {
  q?: string;
} | undefined;
```

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

The same file holds four optional settings. Without them the output is as described above.

```json
{
  "version": "2.0.0",
  "paths": { "apisDir": "packages/api/src" },
  "handlers": {
    "context": { "type": "AppContext", "from": "./packages/api/src/context" },
    "errors": "throw",
    "errorsFile": "./packages/api/src/errors"
  },
  "validators": { "validatePayload": false }
}
```

### Handler context

`handlers.context` replaces `requestId` with one `context` value of your own type, for what every handler needs: the database, the session, a logger.

```ts
import type { AppContext } from '../../context';
import type { typePayload, typeResult } from '../types/create.user';

export default async function createUserHandler({
  name,
  email,
}: typePayload & { context: AppContext }): Promise<typeResult> {
```

- `type` is the exported type name. `from` is where it lives: a path starting with `./` or `../` is a file relative to the project root, and anything else (`@acme/api/context`) is used as the import path as written.
- The generated code does not read `context`. Add it to the destructuring when you use it, and pass what a repository needs as arguments.
- There is no `requestId` in this mode. New type files leave it out of `typeResultError`; remove it from older type files (the generator warns about each one).
- Services follow the same setting.

### Errors

`handlers.errors` decides what happens to an error the type file does not declare.

- `"catch"` (default): it is logged once and returned as `INTERNAL_ERROR` (500).
- `"throw"`: it is thrown, for routers that already turn unexpected errors into a 500 (oRPC, tRPC). New type files then hold no `INTERNAL_ERROR`.

In both modes a repository error with a known name is returned as an error, but only when the type file declares its code:

| Error name        | Code              | Status |
| ----------------- | ----------------- | ------ |
| `NotFoundError`   | `NOT_FOUND`       | 404    |
| `DuplicateError`  | `DUPLICATE_ENTRY` | 409    |
| `ConflictError`   | `CONFLICT`        | 409    |
| `ForbiddenError`  | `FORBIDDEN`       | 403    |
| `BadRequestError` | `BAD_REQUEST`     | 400    |

Add a code to `typeResultError` (and its status to `statusCode`), run `--force`, and the handler maps it.

### Shared errors and refusals

Without `handlers.errorsFile`, every type file spells out its own error object. With it, node-apis writes one errors file (once, never overwritten) and new type files import their errors from it:

```ts
import type { typeInternalError, typeNotFound } from '../../errors';

export type typeResultError = typeNotFound | typeInternalError;
```

The file is yours to edit. It starts with:

- `typeError<Code, StatusCode, Data>`: the shape of every error (`code`, `message`, `statusCode`, optional `data` for what the caller needs to explain it)
- One type per status: `typeBadRequest` (400), `typeForbidden` (403), `typeNotFound` (404), `typeConflict` and `typeDuplicateEntry` (409), `typeUnprocessable` (422), `typeValidationError`, `typeInternalError`. Each takes its own code and data: `typeForbidden<'NOT_A_MEMBER'>`, `typeUnprocessable<'LIMIT_REACHED', { limit: number }>`
- `Refusal`: the error to throw when the answer is "no". The handler returns its `error` as the result error

```ts
// repository/archive.post.ts
import { Refusal } from '../../errors';

throw new Refusal({ code: 'ALREADY_ARCHIVED', message: 'Post is archived', statusCode: 409 });
```

Throwing inside a database transaction rolls it back, and the handler still returns `{ data: null, error }`. Any other error follows `handlers.errors`.

- `refusable(work)`: the same catch for code you write by hand. It returns `{ data, error: null }`, or `{ data: null, error }` when `work` throws a `Refusal`, and rethrows anything else

`errorsFile` follows the same path rule as `context.from`: `./src/apis/errors` is a file from the project root and is written for you; anything else (`@acme/api/errors`) is used as the import path as written and must export `Refusal` and the types.

The handler cannot check that a thrown code is one the type file declares; keep `typeResultError` in step with what the repository throws. Existing type files keep their inline errors and keep working. The error-name table above still applies to them.

### validatePayload

Each validator exports `payloadSchema` and a `validatePayload` wrapper. A router that takes the schema itself has no use for the wrapper; `"validators": { "validatePayload": false }` leaves it out.

## Formatting

The generated code is already formatted (single quotes, 2 spaces, 100 columns). If the target project has Prettier installed, the files are also formatted with its config. A project with Biome and no Prettier is formatted with `biome format`.

## Limits

- Types the generator cannot read (named types, intersections, generics other than `Array` and `Record<string, T>`) are validated as `z.any()`. Tighten those by hand.
- `typePayload` must be declared inline in the type file; imported or aliased types are not followed.
- With `exactOptionalPropertyTypes` enabled, validators and handlers with optional fields do not compile (Zod's `.optional()` allows `undefined`, and handlers pass optional fields on as they are).
- Members of `typePayload` that are not a plain `name: type` field (quoted keys, index signatures, methods) are left out of the generated code, with a warning.
- Plurals follow the regular rules (`posts`, `categories`, `addresses`); irregular nouns are not known.

## License

MIT
