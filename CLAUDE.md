# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository. It contains critical information for understanding the codebase architecture, common patterns, and best practices for efficient development.

## 🚀 Quick Start Guide

### Essential Commands
```bash
npm run build        # Build TypeScript
npm run start        # Start MCP server
npm run dev          # Watch mode for development
npm run validate     # Validate directory structure
```

### Architecture Overview
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Claude (MCP)   │────▶│  Router Tools    │────▶│    Handlers     │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                │                          │
                                ▼                          ▼
                        ┌──────────────────┐     ┌─────────────────┐
                        │  Zod Schemas     │     │  DatoCMS API    │
                        └──────────────────┘     └─────────────────┘
```

## 📚 Essential References

### DatoCMS Documentation
- **CMA API Docs**: `node_modules/@datocms/cma-client-node` - The official client library
- **API Reference**: https://www.datocms.com/docs/content-management-api
- **Field Types**: See `FieldTypeDocs.md` for comprehensive field type documentation
- **Field Creation Guide**: `docs/FIELD_CREATION_GUIDE.md` for detailed examples

### Project Documentation
- **Architecture**: `docs/ARCHITECTURE.md`
- **Patterns**: `docs/PATTERNS.md`
- **Contributing**: `docs/CONTRIBUTING.md`
- **Response Standards**: `RESPONSE_FORMAT_STANDARDS.md`

## 🛠️ Common Task Patterns

### Creating a New Handler
```typescript
// 1. Import required utilities
import { z } from "zod";
import { UnifiedClientManager } from "../../../../utils/unifiedClientManager.js";
import { createRetrieveHandler } from "../../../../utils/handlerFactories.js";
import { domainSchemas } from "../schemas.js";

// 2. Use the appropriate factory
export const getResourceHandler = createRetrieveHandler({
  domain: "resources",
  schemaName: "get",
  schema: domainSchemas.get,
  entityName: "Resource",
  idParam: "resourceId",
  clientAction: async (client, args) => {
    return await client.resources.find(args.resourceId);
  }
});
```

### Adding a New Domain
1. Create directory structure:
   ```
   src/tools/NewDomain/
   ├── Create/
   │   ├── handlers/
   │   └── index.ts
   ├── Read/
   │   ├── handlers/
   │   └── index.ts
   ├── Update/
   │   ├── handlers/
   │   └── index.ts
   ├── Delete/
   │   ├── handlers/
   │   └── index.ts
   ├── NewDomainRouterTool.ts
   ├── schemas.ts
   └── index.ts
   ```

2. Define schemas in `schemas.ts`
3. Create handlers using factories
4. Build router tool
5. Register in `src/index.ts`

### Schema Definition Pattern
```typescript
// schemas.ts
import { z } from "zod";
import { apiTokenSchema, environmentSchema } from "../../utils/sharedSchemas.js";

export const domainSchemas = {
  create: z.object({
    api_token: apiTokenSchema,
    environment: environmentSchema.optional(),
    name: z.string().min(1),
    // ... other fields
  }),
  
  get: z.object({
    api_token: apiTokenSchema,
    environment: environmentSchema.optional(),
    resourceId: z.string().uuid()
  }),
  
  // ... other operations
};
```

## 🎯 Handler Factory Quick Reference

| Factory | Purpose | Key Parameters |
|---------|---------|----------------|
| `createCreateHandler` | Create new entities | `clientAction`, `successMessage` |
| `createRetrieveHandler` | Get single entity | `idParam`, `clientAction` |
| `createListHandler` | List with pagination | `listGetter`, `countGetter` |
| `createUpdateHandler` | Update entity | `idParam`, `clientAction` |
| `createDeleteHandler` | Delete entity | `idParam`, `clientAction` |

## 🔍 Navigation Shortcuts

### Core Utilities
- **Client Manager**: `src/utils/unifiedClientManager.ts`
- **Error Handlers**: `src/utils/errorHandlers.ts`
- **Handler Factories**: `src/utils/handlerFactories.ts`
- **Response Handlers**: `src/utils/responseHandlers.ts`
- **Shared Schemas**: `src/utils/sharedSchemas.ts`

### Domain Routers
- **Records**: `src/tools/Records/RecordsRouterTool.ts`
- **Schema**: `src/tools/Schema/SchemaRouterTool.ts`
- **Uploads**: `src/tools/Uploads/UploadsRouterTool.ts`
- **Environments**: `src/tools/Environments/EnvironmentRouterTool.ts`
- **Project**: `src/tools/Project/ProjectRouterTool.ts`

## ⚡ Performance Best Practices

### Client Caching
```typescript
// ✅ DO: Reuse clients via UnifiedClientManager
const client = UnifiedClientManager.getDefaultClient(apiToken, environment);

// ❌ DON'T: Create new clients directly
const client = new CmaClient({ apiToken });
```

### Pagination
- Default limit: 100 items
- Maximum limit: 500 items
- Always return total count for paginated responses

### Error Handling
```typescript
// Use specific error checkers
if (isAuthorizationError(error)) {
  return createStandardErrorResponse("Unauthorized", 401);
}

// Extract detailed error info
const errorInfo = extractDetailedErrorInfo(error);
```

## 🔒 Security Guidelines

1. **API Token Validation**: Always validate on every request
2. **Input Sanitization**: Zod schemas handle this automatically
3. **Error Messages**: Never expose sensitive data
4. **Environment Access**: Respect environment-based permissions

## 🐛 Debugging Without console.log

```typescript
// Include debug info in responses
return createStandardSuccessResponse({
  message: "Operation completed",
  data: result,
  debug: process.env.DEBUG ? {
    params: args,
    query: query,
    timing: Date.now() - startTime
  } : undefined
});
```

## 🧪 Testing Patterns

```typescript
// Example from testEnhancedHandler.ts
import { testCreateHandler } from "./utils/testEnhancedHandler.js";

const mockSchema = z.object({
  name: z.string(),
  api_token: z.string()
});

const handler = testCreateHandler({
  domain: "test",
  schemaName: "create",
  schema: mockSchema,
  entityName: "TestEntity",
  clientAction: async (client, args) => {
    return { id: "123", ...args };
  }
});
```

## ⚠️ Known Limitations & Workarounds

### Record Operations
- **Issue**: Complex field types (structured text, blocks) may fail
- **Workaround**: Use simplified field structures or handle incrementally

### Role Operations
- **Issue**: Complex parameter sets cause failures
- **Workaround**: Create roles with minimal parameters first, then update

### Field Creation Gotchas
1. Always include `addons: []` in appearances
2. Location fields: use `"editor": "map"`
3. String fields with radio/select: match enum validators
4. Rich text: requires `rich_text_blocks` validator
5. Structured text: needs both `structured_text_blocks` and `structured_text_links`
6. No `required` validator on: gallery, links, rich_text fields

## 📝 Code Style Conventions

### Import Order
1. External packages (`zod`, `@datocms/cma-client-node`)
2. Utility imports (relative paths with `.js` extension)
3. Local types and schemas
4. Handler imports

### Naming Conventions
- Handlers: `<action><Entity>Handler` (e.g., `createFieldHandler`)
- Schemas: `<domain>Schemas` (e.g., `recordSchemas`)
- Router tools: `<Domain>RouterTool` (e.g., `RecordsRouterTool`)

### File Extensions
- Always use `.js` extension in imports (TypeScript requirement)
- Example: `import { something } from "./file.js"`

## 🚨 Critical Rules

1. **NEVER use console.log** - Use response objects for debugging
2. **ALWAYS validate inputs** - Use Zod schemas
3. **HANDLE all errors** - No unhandled promises
4. **FOLLOW directory structure** - Consistency is key
5. **TEST complex operations** - Especially field creation
6. **DOCUMENT edge cases** - In code comments

## 📊 Common DatoCMS API Patterns

### Filtering Records
```typescript
const records = await client.items.list({
  filter: {
    type: itemTypeId,
    fields: {
      title: { matches: { pattern: "test" } }
    }
  }
});
```

### Including Related Data
```typescript
const record = await client.items.find(recordId, {
  nested: true,  // Include nested blocks
  version: "current"  // or "published"
});
```

### Batch Operations
```typescript
const results = await client.items.bulkPublish({
  items: recordIds.map(id => ({ id, type: "item" }))
});
```

## 🔄 Environment Management

```typescript
// Always check environment parameter
const targetEnvironment = args.environment || "main";

// Fork an environment
const fork = await client.environments.fork(sourceEnv, {
  id: newEnvId,
  fast: true  // Skip content copy
});
```

## 📤 Upload Handling

```typescript
// Create upload from URL
const upload = await client.uploads.createFromUrl({
  url: imageUrl,
  default_field_metadata: {
    en: {
      alt: "Description",
      title: "Title"
    }
  }
});
```

## 🔗 Webhook Patterns

```typescript
// Create webhook with headers
const webhook = await client.webhooks.create({
  name: "Deploy Hook",
  url: "https://api.example.com/webhook",
  custom_payload: JSON.stringify({ key: "value" }),
  headers: {
    "Authorization": "Bearer token"
  },
  events: [
    { entity_type: "item", event_types: ["publish", "unpublish"] }
  ]
});
```

## 💡 Pro Tips

1. **Use TypeScript strict mode** - Catches many issues early
2. **Leverage schema inference** - `z.infer<typeof schema>`
3. **Check response meta** - Contains pagination info
4. **Use field templates** - See `fieldTemplates/` directory
5. **Test with different locales** - DatoCMS is locale-aware
6. **Monitor rate limits** - Check response headers
7. **Use transactions** - For atomic operations when available

## 🆘 When Stuck

1. Check the `@datocms/cma-client-node` package in node_modules
2. Review similar handlers in the codebase
3. Look for patterns in `src/utils/`
4. Check error details with `extractDetailedErrorInfo()`
5. Add temporary debug info to responses
6. Validate against DatoCMS API docs
7. Test with minimal parameters first