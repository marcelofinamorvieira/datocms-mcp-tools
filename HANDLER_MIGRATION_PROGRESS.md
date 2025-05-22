# Handler Migration Progress

## Overview
This document tracks the migration of all handlers from custom implementations to the enhanced factory pattern.

## Migration Status

### ✅ Completed Domains
- **Project Domain** (2/2 handlers)
  - ✅ getProjectInfoHandler → createCustomHandler
  - ✅ updateSiteSettingsHandler → createCustomHandler

- **Environments Domain** (5/10 handlers)
  - ✅ getEnvironmentHandler → createRetrieveHandler  
  - ✅ listEnvironmentsHandler → createListHandler
  - ✅ standardizedListEnvironmentsHandler → createCustomHandler
  - ✅ renameEnvironmentHandler → createUpdateHandler
  - ✅ deleteEnvironmentHandler → createDeleteHandler
  - ⏳ forkEnvironmentHandler
  - ⏳ promoteEnvironmentHandler
  - ⏳ activateMaintenanceModeHandler
  - ⏳ deactivateMaintenanceModeHandler
  - ⏳ fetchMaintenanceModeHandler

- **Records Domain** (3/? handlers) - Partially migrated as examples
  - ✅ createRecordHandler → createCreateHandler
  - ✅ getRecordByIdHandler → createRetrieveHandler
  - ✅ enhancedQueryRecordsHandler → createListHandler
  - ⏳ Other handlers...

### ⏳ Pending Domains
- **Schema Domain** (0/19 handlers)
- **Uploads Domain** (0/? handlers)
- **UI Domain** (0/? handlers)
- **Collaborators Domain** (0/? handlers)
- **WebhookAndBuildTrigger Domain** (0/? handlers)

## Migration Patterns

### 1. Create Operations
```typescript
// Before
export const createHandler = async (args) => {
  // Manual implementation
};

// After
export const createHandler = createCreateHandler({
  domain: 'domain',
  schemaName: 'create',
  schema: domainSchemas.create,
  entityName: 'Entity',
  successMessage: 'Created successfully',
  clientAction: async (client, args) => {
    return await client.entities.create(args);
  }
});
```

### 2. Retrieve Operations
```typescript
// After
export const getHandler = createRetrieveHandler({
  domain: 'domain',
  schemaName: 'get',
  schema: domainSchemas.get,
  entityName: 'Entity',
  idParam: 'entityId',
  clientAction: async (client, args) => {
    return await client.entities.find(args.entityId);
  }
});
```

### 3. List Operations
```typescript
// After
export const listHandler = createListHandler({
  domain: 'domain',
  schemaName: 'list',
  schema: domainSchemas.list,
  entityName: 'Entity',
  clientAction: async (client, args) => {
    return await client.entities.list();
  }
});
```

### 4. Update Operations
```typescript
// After
export const updateHandler = createUpdateHandler({
  domain: 'domain',
  schemaName: 'update',
  schema: domainSchemas.update,
  entityName: 'Entity',
  idParam: 'entityId',
  successMessage: 'Updated successfully',
  clientAction: async (client, args) => {
    return await client.entities.update(args.entityId, args.data);
  }
});
```

### 5. Delete Operations
```typescript
// After
export const deleteHandler = createDeleteHandler({
  domain: 'domain',
  schemaName: 'delete',
  schema: domainSchemas.delete,
  entityName: 'Entity',
  idParam: 'entityId',
  clientAction: async (client, args) => {
    await client.entities.destroy(args.entityId);
  }
});
```

### 6. Custom Operations
```typescript
// After
export const customHandler = createCustomHandler({
  domain: 'domain',
  schemaName: 'custom',
  schema: domainSchemas.custom,
  errorContext: {
    operation: 'custom',
    resourceType: 'Entity',
    handlerName: 'customHandler'
  }
}, async (args) => {
  // Custom logic
  return createResponse(JSON.stringify(result));
});
```

## Benefits of Migration
1. **Automatic Debug Tracking**: All migrated handlers get debug support when DEBUG=true
2. **Standardized Error Handling**: Consistent error messages and handling
3. **Schema Validation**: Automatic validation using Zod schemas
4. **Performance Monitoring**: Built-in timing and metrics
5. **Less Boilerplate**: Reduced code duplication
6. **Type Safety**: Better TypeScript inference

## Notes
- The legacy `handlerFactories.ts` has been removed completely
- All new handlers should use the enhanced factory pattern
- Custom response types are supported via the router's response handling