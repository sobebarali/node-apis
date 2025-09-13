# 🚀 Complete tRPC Blog Example

This example shows how to use the generated tRPC blog module in a real application.

## 📁 Generated Structure

```
src/apis/blog/
├── procedures/           # 🆕 tRPC procedures (instead of controllers)
│   ├── create.blog.ts
│   ├── get.blog.ts
│   ├── list.blog.ts
│   ├── update.blog.ts
│   └── delete.blog.ts
├── handlers/             # ✅ Business logic (framework-agnostic)
│   ├── create.blog.ts
│   ├── get.blog.ts
│   └── ...
├── repository/           # ✅ Data access (same as REST)
│   └── blog.repository.ts
├── types/               # ✅ TypeScript types (same as REST)
│   ├── create.blog.ts
│   └── ...
├── validators/          # ✅ Zod schemas (perfect for tRPC!)
│   ├── create.blog.ts
│   └── ...
└── blog.router.ts       # 🆕 tRPC router (instead of routes)
```

## 🔧 Required tRPC Setup

### 1. Install Dependencies

```bash
npm install @trpc/server @trpc/client @trpc/server @trpc/server-express zod
```

### 2. Create tRPC Setup (`src/trpc/index.ts`)

```typescript
import { initTRPC } from '@trpc/server';
import { z } from 'zod';

/**
 * Initialize tRPC
 */
const t = initTRPC.create();

/**
 * Export reusable router and procedure helpers
 */
export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Create the main app router
 */
import { blogRouter } from '../apis/blog/blog.router';

export const appRouter = router({
  blog: blogRouter,
  // Add more modules here:
  // user: userRouter,
  // auth: authRouter,
});

export type AppRouter = typeof appRouter;
```

### 3. Express Integration (`src/server.ts`)

```typescript
import express from 'express';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from './trpc';

const app = express();

/**
 * Add tRPC middleware
 */
app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext: () => ({}), // Add auth context here
  })
);

app.listen(3000, () => {
  console.log('🚀 Server running on http://localhost:3000');
  console.log('📡 tRPC endpoint: http://localhost:3000/trpc');
});
```

### 4. Request ID Utility (`src/shared/utils/request.utils.ts`)

```typescript
import { randomUUID } from 'crypto';

export function generateRequestId(): string {
  return randomUUID();
}
```

## 🎯 Generated tRPC Code Examples

### tRPC Procedure (`procedures/create.blog.ts`)

```typescript
import { publicProcedure } from '../../../trpc';
import { payloadSchema } from '../validators/create.blog';
import createBlogHandler from '../handlers/create.blog';
import { generateRequestId } from '../../../shared/utils/request.utils';

export const createBlogProcedure = publicProcedure
  .input(payloadSchema)
  .mutation(async ({ input }) => {
    const requestId = generateRequestId();
    
    return await createBlogHandler({
      ...input,
      requestId,
    });
  });
```

### tRPC Router (`blog.router.ts`)

```typescript
import { router } from '../../trpc';
import { createBlogProcedure } from './procedures/create.blog';
import { getBlogProcedure } from './procedures/get.blog';
import { listBlogsProcedure } from './procedures/list.blog';
import { updateBlogProcedure } from './procedures/update.blog';
import { deleteBlogProcedure } from './procedures/delete.blog';

export const blogRouter = router({
  create: createBlogProcedure,
  get: getBlogProcedure,
  list: listBlogsProcedure,
  update: updateBlogProcedure,
  delete: deleteBlogProcedure,
});

export type BlogRouter = typeof blogRouter;
```

### Handler with Object Destructuring (`handlers/create.blog.ts`)

```typescript
export default async function createBlogHandler({
  name,
  description,
  status,
  requestId,
}: {
  name: string;
  description: string;
  status: string;
  requestId: string;
}): Promise<typeResult> {
  try {
    const startTime = Date.now();
    console.info(`${requestId} [BLOG] - CREATE handler started`);

    // Business logic here - direct repository call
    const blog = await create({ name, description, status });

    const duration = Date.now() - startTime;
    console.info(`${requestId} [BLOG] - CREATE completed in ${duration}ms`);
    
    return { data: blog, error: null };
  } catch (err) {
    console.error(`${requestId} [BLOG] - CREATE error:`, err);
    return { 
      data: null, 
      error: { 
        code: 'INTERNAL_ERROR', 
        message: 'Failed to create blog',
        statusCode: 500 
      } 
    };
  }
}
```

### Smart Zod Validation (`validators/create.blog.ts`)

```typescript
import { z } from 'zod';

export const payloadSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  status: z.string().optional(),
});
```

## 🔥 Client Usage Examples

### Next.js Client Setup

```typescript
// utils/trpc.ts
import { createTRPCNext } from '@trpc/next';
import type { AppRouter } from '../server/trpc';

export const trpc = createTRPCNext<AppRouter>({
  config() {
    return {
      url: '/api/trpc',
    };
  },
});
```

### Using the Generated Blog API

```typescript
// In a React component
import { trpc } from '../utils/trpc';

function BlogManager() {
  // Create blog post
  const createBlog = trpc.blog.create.useMutation();
  
  // Get blog posts
  const { data: blogs } = trpc.blog.list.useQuery({
    page: 1,
    limit: 10,
  });

  const handleCreate = async () => {
    const result = await createBlog.mutateAsync({
      name: 'My First Blog Post',
      description: 'This is a great blog post!',
      status: 'published',
    });
    
    if (result.data) {
      console.log('Blog created:', result.data);
    }
  };

  return (
    <div>
      <button onClick={handleCreate}>
        Create Blog Post
      </button>
      
      {blogs?.data?.items.map(blog => (
        <div key={blog.blogId}>
          <h3>{blog.name}</h3>
          <p>{blog.description}</p>
        </div>
      ))}
    </div>
  );
}
```

## 🎯 Key Benefits

### ✅ **Type Safety End-to-End**
```typescript
// Full TypeScript inference
const blog = await trpc.blog.create.mutate({
  name: "Post Title",     // ✅ Type-safe
  description: "Content", // ✅ Optional field
  // status: 123          // ❌ TypeScript error!
});

// Automatic return type inference
blog.data?.blogId;        // ✅ string
blog.data?.created_at;    // ✅ string
```

### ✅ **Smart Validation**
```typescript
// Automatic Zod validation
trpc.blog.create.mutate({
  name: "",               // ❌ Validation error
  description: null,      // ❌ Type error
});
```

### ✅ **Same Business Logic**
The handlers, repository, and types are identical to REST - only the transport changes!

### ✅ **Performance Monitoring**
```
req-1703123456789-abc123 [BLOG] - CREATE handler started
req-1703123456789-abc123 [BLOG] - CREATE completed in 45ms
```

### ✅ **Production Ready**
- Error handling with proper types
- Request correlation with IDs
- Performance timing
- Comprehensive validation
- Clean architecture

## 🚀 Commands Used

```bash
# Generate the blog module with tRPC style
node-apis --name blog --crud --trpc-style --framework express

# Or with configuration
node-apis --set-trpc-style true
node-apis --name blog --crud

# Generate other modules
node-apis --name user --crud --trpc-style
node-apis --name auth --custom "login,logout" --trpc-style
```

## 📋 What You Get

- ✅ **5 tRPC procedures** (create, get, list, update, delete)
- ✅ **Type-safe validation** with Zod schemas
- ✅ **Business logic handlers** with object destructuring  
- ✅ **Repository functions** for data access
- ✅ **TypeScript types** for requests/responses
- ✅ **Complete test suite** for all operations
- ✅ **Request correlation** and performance monitoring
- ✅ **Production-ready code** with error handling

This is a **complete, production-ready tRPC API** generated in seconds! 🎉
