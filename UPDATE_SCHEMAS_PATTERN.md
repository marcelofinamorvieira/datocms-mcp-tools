# Schema Update Pattern for Debug Support

To enable the `debug` parameter on all tools, schemas need to be updated to extend `baseToolSchema`.

## Pattern

### Before:
```typescript
schemaName: z
  .object({
    apiToken: apiToken(),
    otherField: z.string(),
    environment: z.string().optional(),
  })
  .strict(),
```

### After:
```typescript
schemaName: baseToolSchema.extend({
  otherField: z.string(),
  // Note: apiToken and environment are already in baseToolSchema
}),
```

## Important Notes:

1. **Remove `.strict()`** - baseToolSchema is not strict to allow the debug parameter
2. **Remove `apiToken: apiToken()`** - it's already in baseToolSchema  
3. **Remove `environment: z.string().optional()`** - it's already in baseToolSchema
4. **Import baseToolSchema** - `import { baseToolSchema } from "../../utils/sharedSchemas.js";`

## Examples from Uploads:

```typescript
// Before
query_collections: z
  .object({
    apiToken: apiToken(),
    ids: z.union([collectionId, z.array(collectionId).nonempty()]).optional(),
    environment: z.string().optional(),
  })
  .strict(),

// After  
query_collections: baseToolSchema.extend({
  ids: z.union([collectionId, z.array(collectionId).nonempty()]).optional(),
}),
```

## Files to Update:

All schema files in:
- `/src/tools/*/schemas.ts`
- `/src/tools/*/*/schemas.ts`

Each schema file needs:
1. Import baseToolSchema
2. Update all schemas to extend baseToolSchema
3. Remove apiToken and environment fields (already in base)
4. Remove .strict() calls