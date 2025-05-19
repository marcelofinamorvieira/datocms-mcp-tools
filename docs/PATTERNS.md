# DatoCMS MCP Server Design Patterns

This document outlines the key design patterns used in the DatoCMS MCP server and provides examples of how to use them effectively.

## 1. Handler Factory Pattern

The handler factory pattern provides a consistent way to create handlers for common operations.

### Basic Usage

```typescript
// Create a handler for retrieving an entity
export const getItemTypeHandler = createRetrieveHandler({
  domain: "schema",
  schemaName: "getItemType",
  schema: schemaSchemas.getItemType,
  entityName: "Item Type",
  idParam: "itemTypeId",
  clientAction: async (client, args) => {
    return await client.itemTypes.find(args.itemTypeId);
  }
});

// Create a handler for listing entities
export const listItemTypesHandler = createListHandler({
  domain: "schema",
  schemaName: "listItemTypes",
  schema: schemaSchemas.listItemTypes,
  entityName: "Item Type",
  clientAction: async (client, args) => {
    return await client.itemTypes.list();
  }
});

// Create a handler for creating entities
export const createItemTypeHandler = createCreateHandler({
  domain: "schema",
  schemaName: "createItemType",
  schema: schemaSchemas.createItemType,
  successMessage: (result) => `Item Type ${result.name} was successfully created.`,
  clientAction: async (client, args) => {
    return await client.itemTypes.create(args.data);
  }
});

// Create a handler for updating entities
export const updateItemTypeHandler = createUpdateHandler({
  domain: "schema",
  schemaName: "updateItemType",
  schema: schemaSchemas.updateItemType,
  entityName: "Item Type",
  idParam: "itemTypeId",
  clientAction: async (client, args) => {
    return await client.itemTypes.update(args.itemTypeId, args.data);
  }
});

// Create a handler for deleting entities
export const deleteItemTypeHandler = createDeleteHandler({
  domain: "schema",
  schemaName: "deleteItemType",
  schema: schemaSchemas.deleteItemType,
  entityName: "Item Type",
  idParam: "itemTypeId",
  clientAction: async (client, args) => {
    await client.itemTypes.destroy(args.itemTypeId);
  }
});
```

## 2. Middleware Composition Pattern

The middleware composition pattern allows you to layer functionality onto handlers.

### Basic Usage

```typescript
// Define a base handler
const baseHandler = async (args) => {
  // Implementation...
  return result;
};

// Apply middleware layers
const enhancedHandler = composeMiddleware(baseHandler, [
  // Schema validation middleware
  (handler) => withSchemaValidation("domain", "action", handler),
  
  // Error handling middleware
  (handler) => withErrorHandling(handler, {
    handlerName: "domain.action",
    resourceType: "Resource"
  }),
  
  // Logging middleware
  (handler) => withLogging(handler, "domain.action")
]);
```

### Creating Custom Middleware

```typescript
// Define a middleware function
export function withLogging<T, R>(
  handler: (args: T) => Promise<R>,
  operationName: string
): (args: T) => Promise<R> {
  return async function(args: T): Promise<R> {
    try {
      const result = await handler(args);
      return result;
    } catch (error) {
      throw error;
    }
  };
}
```

## 3. Standardized Response Pattern

The standardized response pattern ensures consistent response formats across all handlers.

### Basic Usage

```typescript
// Success response
const successResponse = createStandardSuccessResponse(
  { id: '123', name: 'Example Resource' },
  'Resource created successfully'
);

// Error response
const errorResponse = createStandardErrorResponse(
  'Resource not found',
  { error_code: 'NOT_FOUND' }
);

// Paginated response
const paginatedResponse = createStandardPaginatedResponse(
  items,
  {
    limit: 10,
    offset: 0,
    total: 42,
    has_more: true
  },
  'Found 42 item(s) matching your query'
);

// Convert to MCP response
return createStandardMcpResponse(response);
```

### Handler with Standardized Responses

```typescript
export const getResourceHandler = async (args) => {
  try {
    const client = getClient(args.apiToken);
    
    try {
      const resource = await client.resources.find(args.resourceId);
      
      if (!resource) {
        const response = createStandardErrorResponse(
          `Resource with ID '${args.resourceId}' not found`,
          { error_code: 'NOT_FOUND' }
        );
        return createStandardMcpResponse(response);
      }
      
      const response = createStandardSuccessResponse(
        resource,
        `Successfully retrieved resource ${args.resourceId}`
      );
      return createStandardMcpResponse(response);
      
    } catch (apiError) {
      if (isAuthorizationError(apiError)) {
        const response = createStandardErrorResponse(
          'Invalid API token',
          { error_code: 'UNAUTHORIZED' }
        );
        return createStandardMcpResponse(response);
      }
      
      throw apiError;
    }
  } catch (error) {
    const response = createStandardErrorResponse(error);
    return createStandardMcpResponse(response);
  }
};
```

### Using the withStandardResponse Helper

```typescript
export const getResourceHandler = withStandardResponse(
  async (args) => {
    const client = getClient(args.apiToken);
    const resource = await client.resources.find(args.resourceId);
    
    if (!resource) {
      throw new Error(`Resource with ID '${args.resourceId}' not found`);
    }
    
    return resource;
  }
);
```

## 4. Schema Validation Pattern

The schema validation pattern ensures all inputs are properly validated.

### Basic Usage

```typescript
// Define schemas
export const resourceSchemas = {
  get: z.object({
    apiToken: z.string().min(1).describe("DatoCMS API token"),
    resourceId: z.string().min(1).describe("ID of the resource to retrieve")
  }),
  
  list: z.object({
    apiToken: z.string().min(1).describe("DatoCMS API token"),
    filter: z.record(z.unknown()).optional().describe("Optional filter criteria")
  })
};

// Register schemas
SchemaRegistry.registerBulk("resources", resourceSchemas);

// Create handler with validation
export const getResourceHandler = withSchemaValidation(
  "resources",
  "get",
  async (validatedArgs) => {
    // Implementation using validated args
  }
);
```

### Domain Handler Registry

```typescript
// Register all handlers for a domain with validation
export const handlers = createDomainHandlerRegistry(
  "resources",
  resourceSchemas,
  {
    get: getResourceHandler,
    list: listResourcesHandler,
    create: createResourceHandler
  },
  {
    errorContext: {
      resourceType: "Resource"
    },
    clientType: ClientType.DEFAULT
  }
);
```

## 5. Client Management Pattern

The client management pattern ensures consistent client initialization and reuse.

### Basic Usage

```typescript
// Get a default client
const client = UnifiedClientManager.getDefaultClient(apiToken, environment);

// Get a typed records client
const recordsClient = UnifiedClientManager.getRecordsClient(apiToken, environment);

// Get a collaborators client
const collaboratorsClient = UnifiedClientManager.getCollaboratorsClient(apiToken, environment);
```

### Custom Client Creation

```typescript
// Create a custom client type
export enum ClientType {
  DEFAULT = 'default',
  RECORDS = 'records',
  COLLABORATORS = 'collaborators',
  CUSTOM = 'custom'
}

// Add a custom client creator to the manager
UnifiedClientManager.registerClientCreator(
  ClientType.CUSTOM,
  (apiToken, environment) => {
    const baseClient = buildClient({ apiToken, environment });
    return new CustomClient(baseClient);
  }
);

// Get the custom client
const customClient = UnifiedClientManager.getClient({
  apiToken,
  environment,
  clientType: ClientType.CUSTOM
});
```

## 6. Error Handling Pattern

The error handling pattern provides consistent error handling across all handlers.

### Basic Usage

```typescript
// Wrap a handler with error handling
export const getResourceHandler = withErrorHandling(
  async (args) => {
    // Implementation
  },
  {
    handlerName: "resources.get",
    resourceType: "Resource"
  }
);
```

### Error Handling with Result

```typescript
// Use error handling with result for internal functions
export async function performOperation() {
  const result = await withErrorHandlingResult(
    async () => {
      // Operation that might fail
      return await someOperation();
    },
    {
      handlerName: "internal.operation",
      additionalInfo: { importance: "high" }
    }
  );
  
  if (result.status === 'error') {
    // Handle error
    return null;
  }
  
  // Process successful result
  return result.data;
}
```

## 7. Documentation Pattern

The documentation pattern ensures comprehensive and consistent documentation.

### File Header

```typescript
/**
 * @file enhancedHandlerFactory.ts
 * @description Factory functions for creating handlers with middleware composition
 * @module utils
 * 
 * This file provides a set of factory functions for creating standardized
 * handler functions with middleware composition. It combines error handling,
 * schema validation, and client management in a unified pattern.
 */
```

### Function Documentation

```typescript
/**
 * Creates a handler for listing resources with pagination
 * 
 * @param options - Configuration options
 * @param options.domain - The domain area (e.g., 'records', 'schema')
 * @param options.schemaName - The schema name for validation
 * @param options.schema - Zod schema for input validation
 * @param options.entityName - Name of the entity for error messages
 * @param options.clientAction - Function to execute with the client
 * @param options.formatResult - Optional function to format the results
 * @returns A handler function with middleware composition
 * 
 * @example
 * const listUsersHandler = createListHandler({
 *   domain: 'users',
 *   schemaName: 'list',
 *   schema: userSchemas.list,
 *   entityName: 'User',
 *   clientAction: async (client, args) => {
 *     return await client.users.list(args);
 *   }
 * });
 */
export function createListHandler<T, R>(options: ListHandlerOptions<T, R>): Handler<unknown, Response> {
  // Implementation...
}
```

### Interface Documentation

```typescript
/**
 * Configuration for record query operations
 * 
 * This interface defines all possible parameters for querying records
 * from the DatoCMS API, including filtering, pagination, and version selection.
 * 
 * @interface
 * @property {string} [textSearch] - Optional text to search for across all fields
 * @property {string} [modelId] - Optional model ID to filter by
 * @property {string} [modelName] - Optional model name to filter by
 * @property {PaginationParams} [page] - Optional pagination parameters
 * @property {'published' | 'current'} [version] - Which version to return
 */
export interface RecordQueryParams {
  textSearch?: string;
  modelId?: string;
  modelName?: string;
  page?: PaginationParams;
  version?: 'published' | 'current';
}
```

## Example: Combining All Patterns

Here's a complete example that combines all the patterns:

```typescript
/**
 * @file getResourceHandler.ts
 * @description Handler for retrieving a resource by ID
 * @module tools/Resources/Read
 */

import { createRetrieveHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { ClientType } from "../../../../utils/unifiedClientManager.js";
import { resourceSchemas } from "../../schemas.js";

/**
 * Handler for retrieving a resource by ID
 * 
 * Fetches a specific resource using the provided ID with proper
 * error handling, schema validation, and standardized responses.
 * 
 * @example
 * // Get a resource with ID '123'
 * const result = await getResourceHandler({
 *   apiToken: 'your-api-token',
 *   resourceId: '123'
 * });
 */
export const getResourceHandler = createRetrieveHandler({
  // Schema information
  domain: "resources",
  schemaName: "get",
  schema: resourceSchemas.get,
  
  // Entity information for error messages
  entityName: "Resource",
  idParam: "resourceId",
  
  // Client configuration
  clientType: ClientType.DEFAULT,
  
  // Error context for better messages
  errorContext: {
    handlerName: "resources.get",
    resourceType: "Resource",
    additionalInfo: {
      description: "This handler retrieves a single resource by ID."
    }
  },
  
  // The actual client operation
  clientAction: async (client, args) => {
    const { resourceId } = args;
    
    // Execute the operation
    const resource = await client.resources.find(resourceId);
    
    if (!resource) {
      throw new Error(`Resource with ID '${resourceId}' not found`);
    }
    
    return resource;
  }
});
```