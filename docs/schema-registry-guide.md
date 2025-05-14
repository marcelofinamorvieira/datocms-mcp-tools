# Schema Registry Guide

This guide explains how to use the schema registry to access and reuse common schema patterns throughout the DatoCMS MCP server.

## Overview

The schema registry provides a centralized collection of commonly used Zod schemas with several benefits:

1. **Lazy Loading**: Schemas are only initialized when first accessed
2. **Consistency**: Common patterns are defined once and reused
3. **Performance**: Reduced duplication and memory usage
4. **Type Safety**: Registry provides strong TypeScript type checking

## Using the Schema Registry

### Basic Registry Access

The schema registry can be accessed directly:

```typescript
import { schemaRegistry } from "../../utils/schemaRegistry.js";

// Use registry components
const mySchema = z.object({
  apiToken: schemaRegistry.apiToken,
  entityId: schemaRegistry.recordId,
  // ...other fields
});
```

### Domain-Specific Schemas

For common domain operations, pre-built schemas are available:

```typescript
import { domainSchemas } from "../../utils/schemaRegistry.js";

// Use a pre-built domain schema for item type deletion
const deleteItemTypeSchema = domainSchemas.schema.itemType.delete;

// Use the schema in a handler
export const deleteItemTypeHandler = async (args: z.infer<typeof deleteItemTypeSchema>) => {
  // Type-safe handling with proper validation
};
```

### Schema Factory

For building custom schemas with standard base fields:

```typescript
import { createSchema } from "../../utils/schemaRegistry.js";

// Create a custom schema with standard base (apiToken, environment)
const customSchema = createSchema({
  name: z.string().min(1),
  value: z.number().optional(),
  isActive: z.boolean()
});
```

## Available Schema Components

### Base Components

- `schemaRegistry.apiToken`: API token for authentication
- `schemaRegistry.environment`: Optional environment parameter
- `schemaRegistry.confirmation`: Boolean confirmation for destructive actions
- `schemaRegistry.pagination`: Standard pagination object

### Entity ID Components

- `schemaRegistry.recordId`: Record ID
- `schemaRegistry.itemTypeId`: Item type ID
- `schemaRegistry.fieldId`: Field ID
- `schemaRegistry.fieldsetId`: Fieldset ID
- `schemaRegistry.environmentId`: Environment ID
- `schemaRegistry.webhookId`: Webhook ID
- `schemaRegistry.buildTriggerId`: Build trigger ID
- `schemaRegistry.collaboratorId`: Collaborator ID
- `schemaRegistry.tokenId`: API token ID
- `schemaRegistry.uploadId`: Upload ID

### Domain-Specific Schemas

#### Records

- `domainSchemas.records.retrieve`: Retrieve a single record
- `domainSchemas.records.delete`: Delete a record with confirmation
- `domainSchemas.records.publish`: Publish a record
- `domainSchemas.records.unpublish`: Unpublish a record

#### Schema

- `domainSchemas.schema.itemType.retrieve`: Retrieve an item type
- `domainSchemas.schema.itemType.delete`: Delete an item type with confirmation
- `domainSchemas.schema.field.retrieve`: Retrieve a field
- `domainSchemas.schema.field.delete`: Delete a field with confirmation
- `domainSchemas.schema.fieldset.retrieve`: Retrieve a fieldset
- `domainSchemas.schema.fieldset.delete`: Delete a fieldset with confirmation

#### Environments

- `domainSchemas.environments.retrieve`: Retrieve an environment
- `domainSchemas.environments.delete`: Delete an environment with confirmation
- `domainSchemas.environments.promote`: Promote an environment

#### Webhooks & Build Triggers

- `domainSchemas.webhooks.retrieve`: Retrieve a webhook
- `domainSchemas.webhooks.delete`: Delete a webhook with confirmation
- `domainSchemas.buildTriggers.retrieve`: Retrieve a build trigger
- `domainSchemas.buildTriggers.delete`: Delete a build trigger with confirmation

#### Users & Access Control

- `domainSchemas.collaborators.retrieve`: Retrieve a collaborator
- `domainSchemas.collaborators.delete`: Delete a collaborator with confirmation
- `domainSchemas.tokens.retrieve`: Retrieve an API token
- `domainSchemas.tokens.delete`: Delete an API token with confirmation

#### Uploads

- `domainSchemas.uploads.retrieve`: Retrieve an upload
- `domainSchemas.uploads.delete`: Delete an upload with confirmation

## Combining with Handler Factories

The schema registry works well with handler factories:

```typescript
import { createDeleteHandler } from "../utils/handlerFactories.js";
import { domainSchemas } from "../utils/schemaRegistry.js";

export const deleteItemTypeHandler = createDeleteHandler({
  schema: domainSchemas.schema.itemType.delete,
  entityName: "Item Type",
  idParam: "itemTypeId",
  clientAction: async (client, params) => {
    return client.itemTypes.destroy(params.itemTypeId as string);
  }
});
```

## Benefits of Using the Schema Registry

1. **Reduced Duplication**: Define schemas once, use them everywhere
2. **Consistent Validation**: Same validation rules applied consistently
3. **Performance**: Lazy loading improves startup time and memory usage
4. **Better Type Safety**: TypeScript integration with inference
5. **Easier Maintenance**: Changes to common schemas are made in one place

## Best Practices

1. **Prefer Registry Over Direct Creation**: Use registry schemas when available
2. **Add New Common Patterns**: Add frequently used patterns to the registry
3. **Domain Organization**: Keep schemas organized by domain area
4. **Documentation**: Describe schemas for better developer experience
5. **Type Inference**: Use `z.infer<typeof schema>` for handler parameters