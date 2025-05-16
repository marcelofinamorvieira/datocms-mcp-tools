# Contributing to DatoCMS MCP Server

This document provides guidelines and standards for contributing to the DatoCMS MCP server codebase.

## Code Standards

### 1. Directory Structure

All code should follow the standardized directory structure:

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

See [DIRECTORY_STRUCTURE_STANDARDS.md](../DIRECTORY_STRUCTURE_STANDARDS.md) for details.

### 2. Response Format

All handlers should return responses in the standardized format:

```typescript
interface StandardResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: ResponseMetadata;
}
```

Use the utilities in `src/utils/standardResponse.ts` to create consistent responses:

```typescript
// Success response
return createStandardMcpResponse(
  createStandardSuccessResponse(data, message)
);

// Error response
return createStandardMcpResponse(
  createStandardErrorResponse(error)
);
```

See [RESPONSE_FORMAT_STANDARDS.md](../RESPONSE_FORMAT_STANDARDS.md) for details.

### 3. Documentation

All code must be documented using JSDoc:

```typescript
/**
 * @file filename.ts
 * @description Brief description of the file's purpose
 * @module domain/subdomain
 */

/**
 * Brief description of function
 * 
 * Detailed description of function behavior
 * 
 * @param paramName - Description of parameter
 * @returns Description of return value
 * @throws Description of errors that might be thrown
 * @example
 * // Example usage
 * const result = someFunction('param');
 */
```

See [DOCUMENTATION_STANDARDS.md](../DOCUMENTATION_STANDARDS.md) for details.

## Design Patterns

### 1. Handler Factory Pattern

Use the handler factory functions to create handlers for common operations:

```typescript
export const getResourceHandler = createRetrieveHandler({
  domain: "resources",
  schemaName: "get",
  schema: resourceSchemas.get,
  entityName: "Resource",
  idParam: "resourceId",
  clientAction: async (client, args) => {
    return await client.resources.find(args.resourceId);
  }
});
```

### 2. Middleware Composition Pattern

Use middleware composition for layered functionality:

```typescript
const handler = composeMiddleware(baseHandler, [
  (h) => withSchemaValidation(domain, schemaName, h),
  (h) => withErrorHandling(h, errorContext)
]);
```

### 3. Client Management Pattern

Use the unified client manager for consistent client initialization:

```typescript
const client = UnifiedClientManager.getDefaultClient(apiToken, environment);
```

See [PATTERNS.md](./PATTERNS.md) for detailed examples of all patterns.

## Pull Request Process

1. Ensure your code follows all standards and patterns
2. Run tests to verify functionality: `npm test`
3. Verify build works correctly: `npm run build`
4. Update documentation if necessary
5. Create a pull request with a clear description of changes

## Code Review Checklist

Reviewers should verify that code:

- [ ] Follows directory structure standards
- [ ] Uses standardized response formats
- [ ] Has comprehensive JSDoc documentation
- [ ] Uses appropriate design patterns
- [ ] Passes all tests
- [ ] Builds without errors or warnings

## Creating New Components

### New Handler

To create a new handler:

1. Place it in the appropriate domain/operation directory
2. Use handler factory functions when possible
3. Follow naming conventions: `<action><Entity>Handler.ts`
4. Add comprehensive JSDoc documentation
5. Export it from the appropriate index.ts file

Example:

```typescript
/**
 * @file createResourceHandler.ts
 * @description Handler for creating a new resource
 * @module tools/Resources/Create
 */

export const createResourceHandler = createCreateHandler({
  // Configuration...
});
```

### New Domain

To create a new domain:

1. Create the appropriate directory structure
2. Create the schema.ts file with Zod schemas
3. Create the types.ts file with TypeScript types
4. Create the router tool file
5. Create handlers for operations
6. Register the router in src/index.ts

### New Operation

To create a new operation:

1. Create the appropriate directory structure
2. Create handlers in the handlers directory
3. Create an index.ts file to export handlers
4. Add the schema in the domain's schema.ts file
5. Add the handler to the domain's router tool

## Architecture Overview

For a comprehensive overview of the system architecture, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## Development Workflow

1. Checkout a new branch for your feature
2. Implement changes following all standards
3. Run tests to verify functionality
4. Build the project to check for errors
5. Create a pull request

## Common Patterns and Utilities

Use existing utilities where possible:

- `standardResponse.ts` - For consistent response formats
- `enhancedHandlerFactory.ts` - For creating handlers with middleware
- `unifiedClientManager.ts` - For client initialization and caching
- `schemaRegistry.ts` - For schema registration and validation
- `errorHandlerWrapper.ts` - For consistent error handling

## Testing

Write tests for all new functionality:

```typescript
describe('getResourceHandler', () => {
  it('should return a resource when found', async () => {
    // Setup...
    const result = await getResourceHandler(args);
    expect(result).toEqual(expectedResponse);
  });
  
  it('should return an error when not found', async () => {
    // Setup...
    const result = await getResourceHandler(args);
    expect(result).toEqual(expectedErrorResponse);
  });
});
```

## Documentation

Update documentation when:

- Adding new features
- Changing existing functionality
- Fixing bugs that affect behavior
- Adding new domains or operations

## Questions and Help

If you have questions or need help, please:

1. Check existing documentation
2. Look for similar examples in the codebase
3. Reach out to the maintainers

Thank you for contributing to the DatoCMS MCP server!