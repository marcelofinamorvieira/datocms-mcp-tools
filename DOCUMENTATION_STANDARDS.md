# Documentation Standards

This document outlines the documentation standards for the DatoCMS MCP server codebase to ensure consistency and completeness across all components.

## Core Principles

1. **Completeness** - All code components should be adequately documented
2. **Consistency** - Documentation should follow the same format across the codebase
3. **Clarity** - Documentation should be clear and understandable
4. **Utility** - Documentation should be useful for both new and experienced developers

## File-Level Documentation

Every file must include a JSDoc comment at the top with:

```typescript
/**
 * @file filename.ts
 * @description Brief description of the file's purpose and responsibility
 * @module domain/subdomain
 * 
 * Detailed description of what this file does, its role in the system,
 * and any important information developers should know.
 */
```

Example:

```typescript
/**
 * @file recordsClient.ts
 * @description Client for interacting with DatoCMS records API
 * @module tools/Records
 * 
 * This file provides a typed client for working with DatoCMS records.
 * It handles record creation, retrieval, updates, and deletion with
 * proper type safety and validation.
 */
```

## Function Documentation

All functions must include JSDoc comments with:

```typescript
/**
 * Brief description of what the function does
 * 
 * Detailed description of the function's purpose, behavior,
 * and any important information developers should know.
 * 
 * @param paramName - Description of the parameter
 * @param anotherParam - Description of another parameter
 * @returns Description of the return value
 * @throws Description of any errors that might be thrown
 * @example
 * // Example usage
 * const result = someFunction('param');
 */
```

Example:

```typescript
/**
 * Retrieves a record by its ID with optional version
 * 
 * Fetches a specific record from DatoCMS using the provided ID.
 * By default, it returns the published version, but can be configured
 * to return the current (draft) version instead.
 * 
 * @param args - Query parameters
 * @param args.apiToken - DatoCMS API token
 * @param args.itemId - ID of the record to retrieve
 * @param args.version - Version to retrieve ('published' or 'current')
 * @param args.environment - Optional environment name
 * @returns The retrieved record or an error response
 * @throws Will throw if the API token is invalid or the record doesn't exist
 * @example
 * // Get published version of a record
 * const record = await getRecordById({
 *   apiToken: 'your-api-token',
 *   itemId: 'record-id',
 *   version: 'published'
 * });
 */
```

## Interface and Type Documentation

All interfaces and types must include JSDoc comments:

```typescript
/**
 * Brief description of what the interface/type represents
 * 
 * Detailed description of the interface/type's purpose and usage.
 * 
 * @interface
 * @property propertyName - Description of the property
 * @property anotherProperty - Description of another property
 */
```

Example:

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
 * @property {string} [modelName] - Optional model name to filter by (alternative to modelId)
 * @property {PaginationParams} [page] - Optional pagination parameters
 * @property {'published' | 'current'} [version] - Which version to return (defaults to 'published')
 */
export interface RecordQueryParams {
  textSearch?: string;
  modelId?: string;
  modelName?: string;
  page?: PaginationParams;
  version?: 'published' | 'current';
}
```

## Class Documentation

All classes must include JSDoc comments:

```typescript
/**
 * Brief description of what the class does
 * 
 * Detailed description of the class's purpose, behavior,
 * and any important information developers should know.
 * 
 * @class
 * @implements Interface that this class implements (if any)
 * @extends Class that this class extends (if any)
 */
```

Example:

```typescript
/**
 * Client for managing DatoCMS records with enhanced type safety
 * 
 * This client extends the base DatoCMS client with additional
 * type safety for record operations. It includes methods for
 * creating, reading, updating, and deleting records with proper
 * typing for both parameters and return values.
 * 
 * @class
 * @extends BaseClient
 */
export class TypedRecordsClient extends BaseClient {
  // Class implementation
}
```

## Router Tool Documentation

All router tools must include comprehensive documentation:

```typescript
/**
 * @file DomainRouterTool.ts
 * @description Router for Domain-related operations
 * @module tools/Domain
 * 
 * This router tool handles all Domain-related operations by routing
 * requests to the appropriate handlers. It supports the following operations:
 * 
 * - **Create**: Creating new Domain resources
 * - **Read**: Retrieving existing Domain resources
 * - **Update**: Updating existing Domain resources
 * - **Delete**: Deleting Domain resources
 * 
 * ## Usage Example
 * 
 * ```typescript
 * // Example usage of this router
 * const response = await server.handle({
 *   tool: "datocms_domain",
 *   action: "action_name",
 *   args: {
 *     // Arguments
 *   }
 * });
 * ```
 */
```

## Schema Documentation

All schemas must include descriptions for both the schema itself and each field:

```typescript
/**
 * Schema for Domain operation parameters
 */
export const domainOperationSchema = z.object({
  /**
   * DatoCMS API token for authentication
   */
  apiToken: z.string().min(1).describe("DatoCMS API token for authentication"),
  
  /**
   * ID of the resource to operate on
   */
  resourceId: z.string().min(1).describe("ID of the resource to operate on"),
  
  // Other fields...
});
```

## Domain Boundary Documentation

Create explicit documentation for cross-domain interactions:

```typescript
/**
 * @file domainBoundaries.md
 * @description Documentation of cross-domain interactions
 * 
 * # Domain Boundaries and Interactions
 * 
 * This document describes the interactions between different domains
 * in the DatoCMS MCP server.
 * 
 * ## Records → Schema
 * 
 * The Records domain depends on the Schema domain for:
 * - Validating record structure against item types
 * - Resolving field references
 * - ...
 * 
 * ## Schema → Records
 * 
 * The Schema domain depends on the Records domain for:
 * - Checking record existence before field deletion
 * - ...
 */
```

## Implementation Steps

1. Create JSDoc templates for each file type
2. Start with high-impact/frequently used files
3. Gradually document remaining files
4. Add documentation validation to CI/CD pipeline

## Documentation Validation

A validation script will be created to verify documentation meets these standards:

```bash
# Validate all documentation against standards
npm run validate-docs
```

The script will check:
- Presence of file-level JSDoc comments
- Presence of function JSDoc comments
- Presence of interface and type JSDoc comments
- Presence of class JSDoc comments
- Presence of property descriptions in interfaces and classes

## Examples of Good Documentation

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
 * 
 * These factories improve upon the basic handlerFactories.ts by adding:
 * - Composable middleware pattern
 * - Built-in error handling with context
 * - Automatic schema validation
 * - Standardized response formatting
 */
```

### Function Documentation

```typescript
/**
 * Creates a handler for listing resources with pagination and filtering
 * 
 * This factory function creates a standardized list handler with built-in
 * error handling, schema validation, client management, and response formatting.
 * The handler supports pagination and filtering based on the provided options.
 * 
 * @param options - Configuration options for the list handler
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
 *   },
 *   formatResult: (results) => ({
 *     message: `Found ${results.length} users`,
 *     users: results
 *   })
 * });
 */
export function createListHandler<T, R>(options: ListHandlerOptions<T, R>): Handler<unknown, Response> {
  // Implementation...
}
```

## Documentation Review Process

1. All pull requests must include appropriate documentation
2. Documentation quality will be part of the code review process
3. Documentation issues should be treated with the same priority as code issues