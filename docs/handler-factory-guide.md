# Handler Factory Functions Guide

This guide explains how to use the handler factory functions to create type-safe, consistent handlers for DatoCMS operations.

## Overview

The handler factory functions in `handlerFactories.ts` provide a convenient way to create handlers for common operations while handling type assertions and error cases automatically. These factories help reduce duplication and ensure consistent error handling.

## Available Factory Functions

### 1. `createCreateHandler`

Creates a handler for entity creation operations.

```typescript
const createEntityHandler = createCreateHandler({
  schema: schemas.create_entity,
  successMessage: "Entity created successfully!",
  clientAction: async (client, params) => {
    return client.entities.create(params);
  }
});
```

### 2. `createRetrieveHandler`

Creates a handler for single entity retrieval operations.

```typescript
const getEntityHandler = createRetrieveHandler({
  schema: schemas.get_entity,
  entityName: "Entity",
  idParam: "entityId",
  clientAction: async (client, params) => {
    return client.entities.find(params.entityId as string);
  }
});
```

### 3. `createUpdateHandler`

Creates a handler for entity update operations.

```typescript
const updateEntityHandler = createUpdateHandler({
  schema: schemas.update_entity,
  entityName: "Entity",
  idParam: "entityId",
  clientAction: async (client, params) => {
    return client.entities.update(params.entityId as string, params);
  }
});
```

### 4. `createDeleteHandler`

Creates a handler for entity deletion operations with confirmation support.

```typescript
const deleteEntityHandler = createDeleteHandler({
  schema: schemas.delete_entity,
  entityName: "Entity",
  idParam: "entityId",
  clientAction: async (client, params) => {
    return client.entities.destroy(params.entityId as string);
  }
});
```

### 5. `createListHandler`

Creates a handler for listing multiple entities with pagination support.

```typescript
const listEntitiesHandler = createListHandler({
  schema: schemas.list_entities,
  entityName: "Entity",
  clientAction: async (client, params) => {
    return client.entities.list(params.page);
  },
  formatResult: (results) => ({
    data: results,
    count: results.length
  })
});
```

## Benefits

1. **Type Safety**: Factory functions handle type assertions automatically
2. **Consistent Error Handling**: All error cases are handled in a consistent way
3. **Reduced Duplication**: Common handler patterns are abstracted away
4. **Better Testability**: Factory-created handlers are easier to test

## Before and After Comparison

### Before (manual handler implementation)

```typescript
export const deleteEntityHandler = async (args: z.infer<typeof schemas.delete_entity>) => {
  const { apiToken, entityId, confirmation, environment } = args;
  
  // Check for explicit confirmation
  if (confirmation !== true) {
    return createErrorResponse("Error: You must provide explicit confirmation to delete.");
  }
  
  try {
    // Initialize DatoCMS client with type assertions
    const client = getClient(apiToken as string, environment as string);
    
    try {
      // Delete the entity with type assertion
      await client.entities.destroy(entityId as string);
      
      // Return success response
      return createResponse(JSON.stringify({
        success: true,
        message: `Entity ${entityId} was successfully deleted.`
      }, null, 2));
      
    } catch (apiError: unknown) {
      if (isAuthorizationError(apiError)) {
        return createErrorResponse("Error: Please provide a valid DatoCMS API token.");
      }
      
      if (isNotFoundError(apiError)) {
        return createErrorResponse(`Error: Entity with ID '${entityId}' was not found.`);
      }
      
      throw apiError;
    }
  } catch (error: unknown) {
    return createErrorResponse(`Error deleting entity: ${extractDetailedErrorInfo(error)}`);
  }
};
```

### After (factory-based implementation)

```typescript
export const deleteEntityHandler = createDeleteHandler({
  schema: schemas.delete_entity,
  entityName: "Entity",
  idParam: "entityId",
  clientAction: async (client, params) => {
    return client.entities.destroy(params.entityId as string);
  }
});
```

## Testing Factory-Created Handlers

When testing handlers created with factory functions, focus on testing the client action behavior:

```typescript
describe('deleteEntityHandler', () => {
  it('should call the client destroy method with the right ID', async () => {
    // Mock the client and destroy method
    const mockDestroy = jest.fn().mockResolvedValue(undefined);
    const mockClient = { entities: { destroy: mockDestroy } };
    getClient.mockReturnValue(mockClient);
    
    // Call handler
    await deleteEntityHandler({
      apiToken: 'test-token',
      entityId: '123',
      confirmation: true
    });
    
    // Verify client was called correctly
    expect(mockDestroy).toHaveBeenCalledWith('123');
  });
});
```

## Best Practices

1. **Keep Client Actions Focused**: The client action function should do one thing well
2. **Proper Error Handling**: Handle specific error cases within the client action when needed
3. **Clear Entity Names**: Use descriptive entity names for better error messages
4. **Custom Response Formatting**: Use formatResult functions to customize response format when needed
5. **Explicit ID Parameters**: Always specify which parameter contains the entity ID

## Migrating Existing Handlers

To migrate existing handlers to use the factory pattern:

1. Identify which factory type matches your operation (Create, Retrieve, Update, Delete, List)
2. Extract client interaction logic into a clientAction function
3. Replace the handler implementation with the appropriate factory call
4. Update imports to include the factory function
5. Remove manual type assertions and error handling (handled by factory)

## Advanced Usage

For more complex handlers that need custom logic before or after the client action, you can combine factories with custom functions:

```typescript
export const complexEntityHandler = async (args: z.infer<typeof schemas.complex_operation>) => {
  // Custom pre-processing logic
  const processedArgs = preProcess(args);
  
  // Use the factory-created handler
  const baseHandler = createUpdateHandler({
    schema: schemas.complex_operation,
    entityName: "Complex Entity",
    idParam: "entityId",
    clientAction: async (client, params) => {
      return client.entities.complexUpdate(params);
    }
  });
  
  // Call the base handler
  const result = await baseHandler(processedArgs);
  
  // Custom post-processing
  return postProcess(result);
};
```