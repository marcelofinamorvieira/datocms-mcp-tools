# CLAUDE.md

## 📚 Essential Documentation

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

## 🛠️ Quick Handler Creation

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

## 🐛 Debugging (console.log doesn't work!)

Since console.log output isn't visible in MCP, use the debug system:

### Enable Debug Mode
```bash
# .env file
DEBUG=true
```

### Enhanced factories provide automatic debug tracking
When `DEBUG=true`, responses include detailed debug info:
- Performance metrics
- Execution traces
- API call durations
- Sanitized parameters

### Manual Debug (Advanced)
```typescript
import { createDebugContext, addTrace } from "./debugUtils.js";

const context = createDebugContext({
  operation: 'custom',
  handler: 'myHandler',
  domain: 'myDomain'
});

addTrace(context, 'Processing step');
```

## 🔧 Essential Commands
```bash
npm run build        # Build TypeScript
npm run start        # Start MCP server
npm run dev          # Watch mode
npm run test:debug   # Test debug output
```

## 📋 Understanding MCP Tools

This is an **MCP (Model Context Protocol) server** that exposes DatoCMS operations as tools. Each tool has:

- **Tool Name**: Short identifier (e.g., `datocms_create_record`)
- **Description**: What the tool does
- **Parameters**: Zod schema defining inputs

### Zod Schemas Are Documentation
The **Zod schemas and their `.describe()` methods** are the primary way Claude understands:
- What parameters are available
- What each parameter does
- Which fields are required vs optional
- Valid input formats and constraints

Example:
```typescript
const schema = z.object({
  api_token: apiTokenSchema.describe("DatoCMS API token for authentication"),
  itemType: z.string().describe("The API key of the item type to create"),
  title: z.string().describe("The title of the blog post")
});
```

## 🚨 Critical Rules
1. **NEVER use console.log** - Use debug system instead
2. **ALWAYS use enhanced factories** - Get automatic debug tracking
3. **Use `.js` extensions** in imports - TypeScript requirement
4. **Validate with Zod schemas** - Input sanitization is automatic
5. **Write detailed Zod descriptions** - They're Claude's primary documentation