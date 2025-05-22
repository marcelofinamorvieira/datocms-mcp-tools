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

### Creating a New Handler (With Debug Support)
```typescript
// 1. Import enhanced factory for automatic debug tracking
import { createRetrieveHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { domainSchemas } from "../schemas.js";

// 2. Use the enhanced factory - debug is automatic!
export const getResourceHandler = createRetrieveHandler({
  domain: "resources",
  schemaName: "get",
  schema: domainSchemas.get,
  entityName: "Resource",
  idParam: "resourceId",
  clientAction: async (client, args) => {
    // No need for manual debug tracking - it's automatic!
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

### Enhanced Factories (enhancedHandlerFactory.ts)
| Factory | Purpose | Key Parameters | Debug Features |
|---------|---------|----------------|----------------|
| `createCreateHandler` | Create new entities | `domain`, `schemaName`, `schema`, `entityName`, `clientAction` | ✅ Auto debug tracking |
| `createRetrieveHandler` | Get single entity | `domain`, `schemaName`, `schema`, `entityName`, `idParam`, `clientAction` | ✅ Auto debug tracking |
| `createListHandler` | List with pagination | `domain`, `schemaName`, `schema`, `entityName`, `listGetter`, `countGetter` | ✅ Auto debug tracking |
| `createUpdateHandler` | Update entity | `domain`, `schemaName`, `schema`, `entityName`, `idParam`, `clientAction` | ✅ Auto debug tracking |
| `createDeleteHandler` | Delete entity | `domain`, `schemaName`, `schema`, `entityName`, `idParam`, `clientAction` | ✅ Auto debug tracking |

**Note**: Use enhanced factories for new handlers to get automatic debug support!

## 🔍 Navigation Shortcuts

### Core Utilities
- **Client Manager**: `src/utils/unifiedClientManager.ts`
- **Error Handlers**: `src/utils/errorHandlers.ts`
- **Handler Factories**: `src/utils/enhancedHandlerFactory.ts`
- **Response Handlers**: `src/utils/responseHandlers.ts`
- **Standard Response**: `src/utils/standardResponse.ts`
- **Shared Schemas**: `src/utils/sharedSchemas.ts`
- **Debug Utils**: `src/utils/debugUtils.ts`
- **Debug Middleware**: `src/utils/debugMiddleware.ts`

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

## 🐛 Debugging in MCP Environment

Since console.log output isn't visible in the MCP environment, the project uses a comprehensive debug system that returns debug information in responses.

### Debug System Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Handler Call   │────▶│ Debug Middleware │────▶│ Enhanced Factory│
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                │                          │
                                ▼                          ▼
                        ┌──────────────────┐     ┌─────────────────┐
                        │  Debug Context   │     │ Debug Response  │
                        └──────────────────┘     └─────────────────┘
```

### Debug System Components

1. **Debug Utilities** (`src/utils/debugUtils.ts`):
   - `createDebugContext()` - Creates execution context
   - `createDebugData()` - Formats debug info for responses
   - `sanitizeSensitiveData()` - Redacts API tokens
   - `createTimer()` - Performance measurement
   - `addTrace()` - Adds execution trace entries

2. **Debug Middleware** (`src/utils/debugMiddleware.ts`):
   - `withDebugTracking()` - Wraps handlers with debug tracking
   - Automatic performance monitoring
   - Response enhancement with debug data

3. **Enhanced Factory Integration**:
   - All handlers using enhanced factories get automatic debug
   - No manual instrumentation needed

### Enabling Debug Mode

```bash
# .env file
DEBUG=true                 # Full debug mode
TRACK_PERFORMANCE=true     # Performance only
LOG_LEVEL=debug           # Log verbosity
```

### Debug Response Structure

When `DEBUG=true`, all responses include:

```json
{
  "success": true,
  "data": { /* your data */ },
  "meta": {
    "debug": {
      "context": {
        "operation": "create",              // CRUD operation type
        "handler": "createRecordHandler",   // Handler name
        "domain": "records",                // Domain/module
        "timestamp": 1234567890,            // Start timestamp
        "parameters": {                     // Sanitized params
          "api_token": "f9a6...63db",      // Automatically redacted
          "itemType": "blog_post"
        },
        "performance": {
          "startTime": 1234567890,
          "endTime": 1234567900,
          "duration": 10,                   // Total time in ms
          "apiCallDuration": 7,             // DatoCMS API time
          "stages": {
            "validation": 2,                // Schema validation time
            "handler": 8                    // Handler execution time
          }
        },
        "trace": [                          // Execution steps
          "[+0ms] Starting createRecordHandler",
          "[+2ms] Validating input with create schema",
          "[+2ms] Validation completed in 2ms",
          "[+2ms] Initializing DatoCMS client",
          "[+3ms] Creating Record",
          "[+10ms] Handler completed in 8ms"
        ]
      },
      "response": {
        "dataSize": 1024,                   // Response size in bytes
        "dataType": "object"                // Data type returned
      },
      "api": {
        "endpoint": "/items",               // DatoCMS endpoint
        "method": "POST",                   // HTTP method
        "duration": 7                       // API call duration
      },
      "error": {                            // Only on errors
        "type": "ValidationError",
        "message": "Invalid field value",
        "stack": "...",                     // Full stack in debug mode
        "details": { /* API error */ }
      }
    }
  }
}
```

### Using Debug in New Handlers

#### Option 1: Enhanced Factory (Recommended)
```typescript
import { createCreateHandler } from "../../../../utils/enhancedHandlerFactory.js";

export const myHandler = createCreateHandler({
  domain: 'myDomain',
  schemaName: 'create',
  schema: mySchema,
  entityName: 'MyEntity',
  clientAction: async (client, args) => {
    // Your implementation - debug is automatic
    return result;
  }
});
```

#### Option 2: Manual Debug Context (Advanced)
```typescript
import { createDebugContext, addTrace, trackApiCall } from "./debugUtils.js";

export const myHandler = async (args) => {
  const context = createDebugContext({
    operation: 'custom',
    handler: 'myHandler',
    domain: 'myDomain',
    parameters: args
  });

  addTrace(context, 'Starting custom operation');
  
  const timer = createTimer();
  const result = await someApiCall();
  
  trackApiCall(context, {
    endpoint: '/custom',
    method: 'GET',
    duration: timer.stop()
  });
  
  // Create debug data for response
  const debugData = createDebugData(context);
};
```

### Debug Best Practices

1. **Development Only**: Never use `DEBUG=true` in production
2. **Sensitive Data**: Trust the sanitizer, but verify
3. **Performance Impact**: Debug adds ~5-10ms overhead
4. **Trace Granularity**: Add traces for key operations only
5. **Error Context**: Include relevant IDs and parameters

### Testing Debug Output

```bash
# Run debug test script
npm run test:debug

# Output shows:
# - Handler execution with invalid token
# - Debug data in response
# - Performance metrics
# - Sanitized parameters
```

### Troubleshooting Debug Issues

1. **No debug data in response**:
   - Check `DEBUG=true` in `.env`
   - Verify handler uses enhanced factory
   - Ensure response uses standard format

2. **Missing performance data**:
   - Check `TRACK_PERFORMANCE=true`
   - Verify timer usage in handler

3. **Sensitive data visible**:
   - Check sanitization patterns in `debugUtils.ts`
   - Add new patterns if needed

### Debug Utilities Reference

```typescript
// Create debug context
const context = createDebugContext({
  operation: 'create',
  handler: 'myHandler',
  domain: 'records'
});

// Add execution trace
addTrace(context, 'Processing step X');

// Track API calls
trackApiCall(context, {
  endpoint: '/items/123',
  method: 'GET',
  duration: 45
});

// Create timer
const timer = createTimer();
// ... do work ...
const duration = timer.stop();

// Format bytes
formatBytes(1024); // "1 KB"

// Get data size
getDataSize(myObject); // bytes

// Create debug logger
const logger = createDebugLogger(context);
logger.info('Operation started');
logger.error('Operation failed', error);
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