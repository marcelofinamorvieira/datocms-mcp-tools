# Debug System Migration Guide

## Overview

The DatoCMS MCP Server now includes a comprehensive debug system that provides:
- Performance tracking
- Request/response logging
- Execution traces
- Error context enrichment
- Sensitive data sanitization

## Enabling Debug Mode

Set the following environment variables in your `.env` file:

```bash
# Enable debug mode (includes all debug information in responses)
DEBUG=true

# Enable performance tracking only
TRACK_PERFORMANCE=true

# Set log level (error, warn, info, debug)
LOG_LEVEL=debug
```

## Migration Strategy

### Current State
- **Old Pattern**: Handlers using `withErrorHandling` wrapper
- **New Pattern**: Handlers using enhanced factory functions with built-in debug

### Migration Steps

#### 1. Identify Handler Type
Determine which factory function to use based on the operation:
- `createCreateHandler` - For create operations
- `createRetrieveHandler` - For get/retrieve operations
- `createUpdateHandler` - For update operations
- `createDeleteHandler` - For delete operations
- `createListHandler` - For list operations with pagination

#### 2. Convert Handler

**Old Pattern Example:**
```typescript
export const createRecordHandler = withErrorHandling(
  async (args: CreateRecordParams) => {
    const client = UnifiedClientManager.getRecordsClient(args.apiToken, args.environment);
    // ... implementation
    return createResponse(JSON.stringify(responseData));
  },
  { handlerName: 'createRecordHandler', resourceType: 'record' }
);
```

**New Pattern Example:**
```typescript
export const createRecordHandler = createCreateHandler({
  domain: 'records',
  schemaName: 'create',
  schema: recordSchemas.create,
  entityName: 'Record',
  successMessage: (result) => `Record ${result.id} created successfully`,
  clientAction: async (client, args) => {
    // ... implementation (return raw data, not Response)
    return result;
  }
});
```

### Key Differences

1. **Response Handling**: 
   - Old: Manually create Response objects
   - New: Return raw data; factory handles response creation

2. **Client Management**:
   - Old: Manually get client via UnifiedClientManager
   - New: Client is provided to clientAction function

3. **Error Handling**:
   - Old: Basic error wrapping
   - New: Rich error context with operation type, domain, and debug info

4. **Schema Validation**:
   - Old: Manual validation or none
   - New: Automatic validation via middleware

## Debug Output Example

When `DEBUG=true`, responses include:

```json
{
  "success": true,
  "data": { /* response data */ },
  "meta": {
    "debug": {
      "context": {
        "operation": "create",
        "handler": "createRecordHandler",
        "domain": "records",
        "timestamp": 1234567890,
        "parameters": { /* sanitized params */ },
        "performance": {
          "startTime": 1234567890,
          "endTime": 1234567900,
          "duration": 10,
          "stages": {
            "validation": 2,
            "handler": 8
          }
        },
        "trace": [
          "[+0ms] Starting validation with create schema",
          "[+2ms] Validation completed in 2ms",
          "[+2ms] Initializing DatoCMS client",
          "[+3ms] Creating Record",
          "[+10ms] Handler completed in 8ms"
        ]
      },
      "response": {
        "dataSize": 1024,
        "dataType": "object"
      },
      "api": {
        "endpoint": "/records",
        "method": "POST",
        "duration": 7
      }
    }
  }
}
```

## Benefits of Migration

1. **Automatic Debug Tracking**: No manual instrumentation needed
2. **Consistent Error Handling**: Standardized error responses
3. **Performance Insights**: Built-in timing for all operations
4. **Better Debugging**: Detailed execution traces
5. **Security**: Automatic sanitization of sensitive data
6. **Maintainability**: Less boilerplate code

## Testing Debug Mode

1. Set `DEBUG=true` in `.env`
2. Make any API call through the MCP server
3. Check the response `meta.debug` field for debug information
4. Use trace information to diagnose issues
5. Monitor performance metrics to identify bottlenecks

## Best Practices

1. **Development Only**: Never enable DEBUG in production
2. **Performance Impact**: Debug mode adds overhead; disable for performance testing
3. **Sensitive Data**: Always verify sanitization is working correctly
4. **Error Context**: Provide meaningful entity names and messages
5. **Custom Debug Data**: Use the DebugContext parameter in clientAction for custom tracking