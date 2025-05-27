# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🏗️ Architecture Overview

This is a **Model Context Protocol (MCP) server** that enables Claude AI to interact with DatoCMS. The codebase follows a domain-driven structure where:

1. **Router Tools** handle action dispatch and parameter discovery
2. **Domain Handlers** execute specific operations using the enhanced factory pattern
3. **Two-step execution**: Parameter discovery → Action execution
4. **Middleware layers**: Debug → Error handling → Validation → Execution

### Directory Structure
```
src/tools/[Domain]/
├── [Action]/handlers/     # CRUD operation handlers
├── [Domain]RouterTool.ts  # Central router for the domain
├── schemas.ts             # Zod validation schemas
└── index.ts              # Domain exports
```

## 🛠️ Essential Commands

```bash
# Development
npm run build         # TypeScript compilation + structure validation
npm run dev          # Watch mode for development
npm run start        # Start MCP server (stdio transport)
npm run start:http   # Start with HTTP transport

# Type Checking
npm run type-check              # Basic type checking
npm run type-check:handlers     # Check all handler types
npm run type-check:strict       # Strict mode with all checks

# Testing & Validation
npm run test:debug   # Test debug functionality
npm run validate     # Validate directory structure
```

## 🐛 Debug System (Critical: console.log doesn't work!)

Since MCP runs in stdio mode, console.log output is not visible. Use the built-in debug system:

### Per-Request Debug
```typescript
// Users can enable debug for any request
{
  api_token: "...",
  debug: true,  // Adds debug info to response
  // ... other parameters
}
```

### Global Debug Mode
```bash
# Enable for all requests via environment
DEBUG=true npm run start
```

### What Debug Provides
- Performance metrics and timings
- Execution traces with timestamps
- API call durations
- Sanitized parameters (tokens redacted)
- Error stack traces

## 🏭 Handler Creation Pattern

Always use the enhanced factory pattern for automatic error handling, validation, and debug tracking:

```typescript
import { createRetrieveHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { domainSchemas } from "../schemas.js";

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

Available factories:
- `createListHandler` - For listing resources
- `createRetrieveHandler` - For getting single resources
- `createWriteHandler` - For create/update/delete operations
- `createActionHandler` - For custom operations

## 📋 Understanding MCP Tools

Each MCP tool consists of:
- **Tool Name**: Short identifier (e.g., `datocms_create_record`)
- **Description**: What the tool does (shown to users)
- **Parameters**: Zod schema defining inputs

### Zod Schemas Are Documentation
The Zod schemas and their `.describe()` methods are how Claude understands the API:

```typescript
const schema = z.object({
  api_token: apiTokenSchema.describe("DatoCMS API token for authentication"),
  environment: z.string().optional().describe("Target environment (defaults to primary)"),
  itemType: z.string().describe("The model's API key identifier"),
  data: recordDataSchema.describe("Record data with field values")
});
```

## 🚨 Critical Rules

1. **NEVER use console.log** - Use the debug system instead
2. **ALWAYS use enhanced factories** - Get automatic error handling and debug
3. **Use `.js` extensions in imports** - Required for ESM modules
4. **ALWAYS use official DatoCMS types** from `@datocms/cma-client-node`:
   - `SimpleSchemaTypes.Item` (not custom Record type)
   - `SimpleSchemaTypes.ItemType` (not custom Model type)
   - `SimpleSchemaTypes.Field` (not custom Field type)
   - `SimpleSchemaTypes.Role` (not custom Role type)
5. **Validate with Zod schemas** - All inputs are automatically validated
6. **Follow directory structure** - Tools must follow the standard layout

## 📚 Key Documentation

### Internal Docs
- `docs/ARCHITECTURE.md` - System architecture details
- `docs/PATTERNS.md` - Code patterns and conventions
- `docs/FIELD_CREATION_GUIDE.md` - Comprehensive field creation examples
- `FieldTypeDocs.md` - All DatoCMS field types documentation
- `RESPONSE_FORMAT_STANDARDS.md` - Response format specifications

### External Resources
- **DatoCMS API**: https://www.datocms.com/docs/content-management-api
- **MCP Protocol**: https://modelcontextprotocol.io/

## 🔧 Development Workflow

1. **Continuously build** while developing to catch TypeScript errors early
2. **Check handler return types** match the enhanced factory expectations
3. **Use debug mode** when testing to see execution traces
4. **Validate structure** after adding new tools or domains
5. **Follow existing patterns** - consistency is key in this codebase