# Type Migration Examples

This document provides concrete examples for migrating the most common `any` type patterns in the DatoCMS MCP Server.

## 🌟 Complete Handler Migration Example

### Before: createFieldHandler with extensive `any` casts

```typescript
// Many as any casts throughout
if ((validators as any).enum) { }
(appearance.parameters as any).heading = false;
const enumValues = (validators as any).enum.values;
```

### After: Fully typed with type guards

See `createFieldHandler_typed.ts` for the complete example. Key improvements:

1. **Import proper types and guards**
```typescript
import { Client } from "@datocms/cma-client-node";
import type { SimpleSchemaTypes } from "@datocms/cma-client-node";
import { hasEnumValidator, isObject, hasProperty } from "../../../../../types/guards.js";
```

2. **Create specific type guards for complex validators**
```typescript
function hasRichTextBlocksValidator(
  validators: unknown
): validators is { rich_text_blocks: { item_types: string[] } } {
  return (
    isObject(validators) &&
    'rich_text_blocks' in validators &&
    isObject(validators.rich_text_blocks) &&
    'item_types' in validators.rich_text_blocks &&
    Array.isArray((validators.rich_text_blocks as any).item_types)
  );
}
```

3. **Use type guards instead of casts**
```typescript
// Before
if (validators && (validators as any).enum) { }

// After  
if (hasEnumValidator(validators)) {
  // TypeScript knows validators.enum exists
}
```

4. **Type the client properly**
```typescript
const client = UnifiedClientManager.getDefaultClient(apiToken, environment) as Client;
```

5. **Use proper DatoCMS types for API calls**
```typescript
const fieldData: SimpleSchemaTypes.FieldCreateSchema = {
  ...restFieldData,
  field_type: field_type as SimpleSchemaTypes.FieldCreateSchema['field_type'],
  validators: validators || {},
  appearance: processedAppearance as SimpleSchemaTypes.FieldCreateSchema['appearance']
};
```

## 🔧 Pattern 1: Validator Type Assertions

### ❌ Current Pattern (Unsafe)
```typescript
// From createFieldHandler.ts
if (validators && (validators as any).enum) {
  const enumValues = (validators as any).enum.values;
  // ...
}
```

### ✅ Type-Safe Migration
```typescript
import { SimpleSchemaTypes } from '@datocms/cma-client-node';

// Define validator type interfaces
interface EnumValidator {
  enum: { values: string[] };
}

interface LengthValidator {
  length: { min?: number; max?: number };
}

interface RequiredValidator {
  required: Record<string, never>; // empty object
}

// Type guard functions
function hasEnumValidator(validators: unknown): validators is { enum: { values: string[] } } {
  return (
    validators !== null &&
    typeof validators === 'object' &&
    'enum' in validators &&
    typeof (validators as any).enum === 'object' &&
    Array.isArray((validators as any).enum.values)
  );
}

// Usage in handler
if (validators && hasEnumValidator(validators)) {
  const enumValues = validators.enum.values; // TypeScript knows this is string[]
  // ...
}
```

## 🔧 Pattern 2: Appearance Parameters

### ❌ Current Pattern (Unsafe)
```typescript
// From createFieldHandler.ts
if (!appearance.parameters) {
  appearance.parameters = { heading: false } as any;
} else if ((appearance.parameters as any).heading === undefined) {
  (appearance.parameters as any).heading = false;
}
```

### ✅ Type-Safe Migration
```typescript
// Define appearance types for different editors
interface SingleLineAppearance {
  editor: 'single_line';
  parameters: {
    heading?: boolean;
    placeholder?: string;
  };
  addons: Array<{
    id: string;
    parameters?: Record<string, unknown>;
  }>;
}

interface TextAreaAppearance {
  editor: 'textarea';
  parameters: {
    rows?: number;
  };
  addons: Array<{
    id: string;
    parameters?: Record<string, unknown>;
  }>;
}

// Type guard
function isSingleLineAppearance(appearance: any): appearance is SingleLineAppearance {
  return appearance.editor === 'single_line';
}

// Usage
if (isSingleLineAppearance(appearance)) {
  if (!appearance.parameters) {
    appearance.parameters = { heading: false };
  } else if (appearance.parameters.heading === undefined) {
    appearance.parameters.heading = false;
  }
}
```

## 🔧 Pattern 3: Client Method Calls

### ❌ Current Pattern (Unsafe)
```typescript
// From various handlers
const result = await client.items.list(params as any);
```

### ✅ Type-Safe Migration
```typescript
import { Client, SimpleSchemaTypes } from '@datocms/cma-client-node';

// Define typed parameters
interface ListItemsParams {
  filter?: {
    type?: string;
    query?: string;
  };
  page?: {
    offset?: number;
    limit?: number;
  };
}

// Type the client
const typedClient: Client = client;

// Use with proper types
const params: ListItemsParams = {
  filter: { type: itemType },
  page: { limit: 100 }
};

const result: SimpleSchemaTypes.Item[] = await typedClient.items.list(params);
```

## 🔧 Pattern 4: Enhanced Handler Factory

### ❌ Current Pattern (Unsafe)
```typescript
// From enhancedHandlerFactory.ts
export type DatoCMSClient = any;

export const createHandler = (config: {
  clientAction: (client: any, args: any) => Promise<any>
}) => {
  // ...
};
```

### ✅ Type-Safe Migration
```typescript
import { Client } from '@datocms/cma-client-node';
import { z } from 'zod';

export type DatoCMSClient = Client;

// Generic handler creation with type inference
export function createHandler<
  TSchema extends z.ZodType,
  TResponse
>(config: {
  schema: TSchema;
  schemaName: string;
  clientAction: (
    client: DatoCMSClient,
    args: z.infer<TSchema>,
    context: RequestContext
  ) => Promise<TResponse>;
}): Handler<z.infer<TSchema>, TResponse> {
  return async (args: z.infer<TSchema>): Promise<{
    content: TResponse;
    isError: boolean;
    debug?: DebugInfo;
  }> => {
    const client = new Client({ apiToken: args.api_token });
    const result = await config.clientAction(client, args, context);
    return { content: result, isError: false };
  };
}
```

## 🔧 Pattern 5: Complex Field Creation

### ❌ Current Pattern (Unsafe)
```typescript
// Combining multiple unsafe patterns
const fieldData: any = {
  label,
  field_type,
  api_key,
  validators: validators as any,
  appearance: appearance as any
};

if ((validators as any).enum) {
  // Special handling
}

const field = await client.fields.create(itemTypeId, fieldData as any);
```

### ✅ Type-Safe Migration
```typescript
import { SimpleSchemaTypes, Client } from '@datocms/cma-client-node';

// Use the official type
const fieldData: SimpleSchemaTypes.FieldCreateSchema = {
  label,
  field_type: field_type as SimpleSchemaTypes.FieldCreateSchema['field_type'],
  api_key,
  validators: validators || {},
  appearance: {
    editor: appearance.editor,
    parameters: appearance.parameters || {},
    addons: appearance.addons || []
  },
  localized: false,
  fieldset: null
};

// Type-safe validator check
if (validators && 'enum' in validators) {
  // TypeScript understands validators has enum property
  const validatorObj = validators as { enum: { values: string[] } };
  console.log('Enum values:', validatorObj.enum.values);
}

// Client is properly typed
const typedClient: Client = client;
const field: SimpleSchemaTypes.Field = await typedClient.fields.create(
  itemTypeId,
  fieldData
);
```

## 🔧 Pattern 6: Router Tool Type Safety

### ❌ Current Pattern (Unsafe)
```typescript
// From router tools
async execute(operation: string, params: any): Promise<any> {
  if (operation === 'create_field') {
    return await createFieldHandler(params);
  }
  // ...
}
```

### ✅ Type-Safe Migration
```typescript
// Define operation map
interface SchemaOperations {
  create_field: typeof createFieldHandler;
  update_field: typeof updateFieldHandler;
  delete_field: typeof deleteFieldHandler;
  // ...
}

class SchemaRouterTool {
  private operations: SchemaOperations = {
    create_field: createFieldHandler,
    update_field: updateFieldHandler,
    delete_field: deleteFieldHandler,
  };

  async execute<K extends keyof SchemaOperations>(
    operation: K,
    params: Parameters<SchemaOperations[K]>[0]
  ): Promise<ReturnType<SchemaOperations[K]>> {
    const handler = this.operations[operation];
    if (!handler) {
      throw new Error(`Unknown operation: ${operation}`);
    }
    return handler(params) as ReturnType<SchemaOperations[K]>;
  }
}
```

## 🔧 Pattern 7: Response Type Transformation

### ❌ Current Pattern (Unsafe)
```typescript
// Response handling without types
const response: any = await client.items.list();
return response.map((item: any) => ({
  id: item.id,
  title: item.title,
  // ...
}));
```

### ✅ Type-Safe Migration
```typescript
import { SimpleSchemaTypes } from '@datocms/cma-client-node';

// Define response transformation types
interface ItemSummary {
  id: string;
  title: string;
  created_at: string;
}

// Type-safe transformation
const items: SimpleSchemaTypes.Item[] = await client.items.list();
const summaries: ItemSummary[] = items.map((item) => ({
  id: item.id,
  title: item.title || 'Untitled',
  created_at: item.meta.created_at
}));
```

## 📝 Migration Checklist for Each Handler

When migrating a handler, follow this checklist:

1. **Import proper types**
   ```typescript
   import { Client, SimpleSchemaTypes, SchemaTypes } from '@datocms/cma-client-node';
   ```

2. **Replace `any` in function signature**
   ```typescript
   // Before
   async (client: any, args: any) => { }
   
   // After
   async (client: Client, args: z.infer<typeof schema>) => { }
   ```

3. **Add return type annotation**
   ```typescript
   async (...): Promise<SimpleSchemaTypes.Field> => { }
   ```

4. **Create type guards for dynamic checks**
   ```typescript
   function isEnumValidator(v: unknown): v is { enum: { values: string[] } } {
     // Implementation
   }
   ```

5. **Type all intermediate variables**
   ```typescript
   const createData: SimpleSchemaTypes.FieldCreateSchema = { };
   ```

6. **Test with TypeScript strict mode**
   ```bash
   npx tsc --strict --noEmit path/to/handler.ts
   ```

## 🚨 Common Pitfalls

1. **Don't cast to `any` as intermediate step**
   ```typescript
   // Bad
   const typed = (untyped as any) as SpecificType;
   
   // Good
   const typed = untyped as SpecificType;
   ```

2. **Don't ignore optional properties**
   ```typescript
   // Bad
   item.title // Could be undefined
   
   // Good
   item.title || 'Default Title'
   ```

3. **Don't assume array results**
   ```typescript
   // Bad
   const items = await client.items.list();
   items.forEach(...) // Could fail
   
   // Good
   const items = await client.items.list();
   if (Array.isArray(items)) {
     items.forEach(...)
   }
   ```

Remember: The goal is not just to remove `any` types, but to improve type safety and developer experience!

## 📝 Handler Migration Examples

### List Handler Migration

**Before:**
```typescript
export const listItemTypesHandler = createListHandler({
  domain: "schema",
  schemaName: "list_item_types",
  schema: schemaSchemas.list_item_types,
  entityName: "ItemType",
  clientAction: async (client) => {
    return await client.itemTypes.list();
  }
});
```

**After:**
```typescript
import { Client } from "@datocms/cma-client-node";
import type { SimpleSchemaTypes } from "@datocms/cma-client-node";

type ListItemTypesParams = z.infer<typeof schemaSchemas.list_item_types>;

export const listItemTypesHandler = createListHandler<
  ListItemTypesParams,
  SimpleSchemaTypes.ItemType[]
>({
  domain: "schema",
  schemaName: "list_item_types",
  schema: schemaSchemas.list_item_types,
  entityName: "ItemType",
  clientAction: async (
    client: DatoCMSClient, 
    params: ListItemTypesParams,
    context: RequestContext
  ): Promise<SimpleSchemaTypes.ItemType[]> => {
    const typedClient = client as Client;
    return await typedClient.itemTypes.list();
  }
});
```

### Create Handler Migration

**Before:**
```typescript
successMessage: (itemType: any) => `Item type '${itemType.name}' created...`,
clientAction: async (client, args) => {
  // No type safety
}
```

**After:**
```typescript
successMessage: (itemType: SimpleSchemaTypes.ItemType) => 
  `Item type '${itemType.name}' created...`,
clientAction: async (
  client: DatoCMSClient, 
  args: CreateItemTypeParams,
  context: RequestContext
): Promise<SimpleSchemaTypes.ItemType> => {
  const typedClient = client as Client;
  
  const itemTypeData: SimpleSchemaTypes.ItemTypeCreateSchema = {
    name: args.name,
    api_key: args.apiKey,
    // ... properly typed fields
  };
  
  return await typedClient.itemTypes.create(itemTypeData);
}
```

## 🔑 Key Patterns for Handler Migration

1. **Always add explicit type parameters to factory functions**
   ```typescript
   createListHandler<TParams, TResponse>({ ... })
   ```

2. **Import and use DatoCMS types**
   ```typescript
   import type { SimpleSchemaTypes } from "@datocms/cma-client-node";
   ```

3. **Cast the client to the specific type needed**
   ```typescript
   const typedClient = client as Client; // For standard operations
   const collaboratorsClient = client as CollaboratorsClient; // For collaborators
   ```

4. **Add RequestContext parameter even if not used**
   ```typescript
   clientAction: async (client, params, context) => { ... }
   ```

5. **Use proper return type annotations**
   ```typescript
   ): Promise<SimpleSchemaTypes.ItemType> => {
   ```