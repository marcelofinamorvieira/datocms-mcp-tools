# DatoCMS MCP Server Architecture

This document provides an overview of the DatoCMS MCP server architecture, explaining the core components, design patterns, and interactions between different parts of the system.

## Overview

The DatoCMS MCP (Model Context Protocol) server provides a standardized interface for Claude AI models to interact with DatoCMS. It acts as a bridge between language models and the DatoCMS Content Management API, allowing models to perform operations on content, schema, users, environments, and other DatoCMS resources.

## Core Components

### 1. MCP Server

The core of the system is built on the `@modelcontextprotocol/sdk` package, which provides the foundation for communication between Claude and DatoCMS. The server is initialized in `src/index.ts` and configured with all available tools.

```typescript
const server = new McpServer({
  name: "DatoCMSTools",
  version: "1.0.0",
  description: "MCP server providing DatoCMS query tools and utilities"
});
```

### 2. Router Tools

The system is organized around domain-specific router tools that group related functionality:

- **RecordsRouterTool** - Handles record operations (create, read, update, delete, publish)
- **SchemaRouterTool** - Manages schema operations (item types, fieldsets, fields)
- **EnvironmentRouterTool** - Controls environment operations (create, fork, promote)
- **UIRouterTool** - Manages UI customization (menu items, plugins)
- **CollaboratorsRolesAndAPITokensRouterTool** - Handles user management and permissions
- **WebhookAndBuildTriggerCallsAndDeploysRouterTool** - Manages delivery and webhook operations

Each router is responsible for validating inputs, routing to appropriate handlers, and formatting responses.

### 3. Handlers

Handlers implement the actual functionality for each operation. They follow a consistent pattern:

```typescript
export const someHandler = async (args: ValidatedArgs) => {
  try {
    // Client initialization
    const client = getClient(args.apiToken);
    
    try {
      // Main operation
      const result = await client.someOperation(args.params);
      
      // Format and return response
      return createStandardSuccessResponse(result);
    } catch (apiError) {
      // Handle API-specific errors
      handleApiErrors(apiError);
    }
  } catch (error) {
    // Handle general errors
    return createStandardErrorResponse(error);
  }
};
```

### 4. Clients

Domain-specific clients handle the interaction with the DatoCMS API:

- **Base Client** - Generic DatoCMS client from `@datocms/cma-client-node`
- **TypedRecordsClient** - Enhanced client for record operations with improved typing
- **CollaboratorsClient** - Specialized client for user management operations

### 5. Schemas

Zod schemas define the validation for all operation parameters:

```typescript
export const recordsSchemas = {
  query: createBaseSchema().extend({
    textSearch: z.string().optional(),
    modelId: z.string().optional(),
    // Additional fields...
  }),
  // Other operation schemas...
};
```

## Design Patterns

### 1. Router Pattern

Operations are organized by domain, with each domain having a dedicated router:

```typescript
server.tool(
  "datocms_records",
  {
    action: actionEnum,
    args: z.record(z.any()).optional()
  },
  {
    title: "DatoCMS Records",
    description: "Manage DatoCMS records - items (records) that are instances of item types (models)."
  },
  async (args) => {
    const { action, args: actionArgs = {} } = args;
    
    // Route to the appropriate handler based on the action
    switch (action) {
      case "query":
        return queryRecordsHandler(validatedArgs);
      // Other actions...
    }
  }
);
```

### 2. Handler Factory Pattern

Reusable handler factories for common operations:

```typescript
export const myHandler = createRetrieveHandler({
  schema: recordsSchemas.get,
  entityName: "Record",
  idParam: "itemId",
  clientAction: async (client, params) => {
    return client.items.find(params.itemId);
  }
});
```

### 3. Response Standardization

All handlers use a consistent response format:

```typescript
interface StandardResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: ResponseMetadata;
}
```

### 4. Error Handling with Context

Enhanced error handling with context information:

```typescript
const handler = withErrorHandling(
  async (args) => {
    // Handler implementation
  },
  {
    handlerName: "records.get",
    resourceType: "Record", 
    resourceId: args.itemId
  }
);
```

### 5. Schema Validation Middleware

Schema validation as a composable middleware:

```typescript
const handler = withSchemaValidation(
  "records",
  "get",
  async (validatedArgs) => {
    // Handler using validated args
  }
);
```

## Directory Structure

The codebase follows a standardized structure:

```
src/
├── tools/
│   ├── <Domain>/                                 # Domain name in PascalCase (e.g., Records)
│   │   ├── <Operation>/                          # Operation name in PascalCase (e.g., Create, Read)
│   │   │   ├── handlers/                         # All handlers for this operation
│   │   │   │   ├── <action><Entity>Handler.ts    # Handler files: verb + entity
│   │   │   │   ├── ...                           # Additional handlers
│   │   │   │   └── index.ts                      # Exports all handlers
│   │   │   └── index.ts                          # Operation exports
│   │   ├── <Domain>RouterTool.ts                 # Router for this domain
│   │   ├── <domain>Client.ts                     # Domain client (camelCase)
│   │   ├── <domain>Types.ts                      # Domain type definitions (camelCase)
│   │   ├── schemas.ts                            # All schemas for this domain
│   │   └── index.ts                              # Domain exports
│   └── index.ts                                  # Tools exports
└── utils/                                        # Shared utilities
    └── ...
```

## Domain Interactions

The following diagram illustrates the key interactions between domains:

```
Records  <---> Schema (Validates records against schema)
    ^           ^
    |           |
    v           v
   Uploads     UI (Menu Items, Filters)
    ^           ^
    |           |
    v           v
Environments <---> Collaborators (Permissions)
    |
    v
  Webhooks
```

### Key Interactions:

1. **Records → Schema**: Records are validated against schemas
2. **Records → Uploads**: Records reference uploads in media fields
3. **Records → Environments**: Records exist within environments
4. **Schema → UI**: Schema defines available UI components
5. **Collaborators → All**: Permissions affect access to all domains
6. **Environments → All**: Environments provide context for all operations
7. **Webhooks → Records**: Webhooks triggered by record changes

## Communication Flow

The communication flow from Claude to DatoCMS follows this pattern:

1. Claude sends a request to the MCP server
2. MCP server routes the request to the appropriate domain router
3. Router validates inputs and routes to the correct handler
4. Handler initializes client and performs operations
5. DatoCMS API responds with results
6. Handler formats results into standardized response
7. Response is returned to Claude through the MCP server

## Best Practices

When extending or modifying this codebase:

1. **Follow Existing Patterns**: Use the established directory structure and naming conventions
2. **Use Handler Factories**: Leverage existing factories for common operations
3. **Apply Middleware**: Use error handling and schema validation middleware
4. **Standardize Responses**: Use the standard response format
5. **Document Everything**: Add comprehensive JSDoc comments to all components
6. **Validate Inputs**: Use Zod schemas for all input validation
7. **Handle Errors Consistently**: Use the error handling utilities

## Example: Complete Handler Implementation

Here's a complete example of a handler implementation with all standardized patterns:

```typescript
/**
 * @file getRecordHandler.ts
 * @description Handler for retrieving a DatoCMS record by ID
 * @module tools/Records/Read
 */

import { createRetrieveHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { ClientType } from "../../../../utils/unifiedClientManager.js";
import { recordsSchemas } from "../../schemas.js";

/**
 * Handler for retrieving a record by ID
 * 
 * Fetches a specific record from DatoCMS using the provided ID
 * with error handling, schema validation, and standardized responses.
 */
export const getRecordHandler = createRetrieveHandler({
  // Schema information
  domain: "records",
  schemaName: "get",
  schema: recordsSchemas.get,
  
  // Entity information for error messages
  entityName: "Record",
  idParam: "itemId",
  
  // Client configuration
  clientType: ClientType.RECORDS,
  
  // Error context for better messages
  errorContext: {
    handlerName: "records.get",
    resourceType: "Record",
    additionalInfo: {
      description: "This handler retrieves a single record by ID."
    }
  },
  
  // The actual client operation
  clientAction: async (client, args) => {
    const { itemId, version = "published", nested = true } = args;
    
    // Execute the operation
    return await client.items.find(itemId, {
      version: version as "published" | "current",
      nested
    });
  }
});
```