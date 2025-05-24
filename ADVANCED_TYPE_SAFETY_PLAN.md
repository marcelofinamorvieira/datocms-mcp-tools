# Advanced Type Safety Enhancement Plan

## Overview
This document outlines a comprehensive plan to implement advanced TypeScript patterns that will provide real, meaningful type safety improvements to the DatoCMS MCP server. These are not superficial changes but fundamental improvements that will catch real bugs at compile time.

## Goals
1. **Prevent runtime errors** through compile-time type checking
2. **Make invalid states unrepresentable** in the type system
3. **Improve developer experience** with better autocomplete and error messages
4. **Document business logic** through the type system itself

## Implementation Plan

### Phase 1: Branded Types for IDs (Critical)

#### Problem
Currently, all IDs are just `string`, which allows dangerous mistakes:
```typescript
// This compiles but is wrong!
await client.fields.find(roleId, fieldId); // Passing roleId where itemTypeId expected
```

#### Solution: Branded Types
Create a comprehensive branded types system:

```typescript
// src/types/branded.ts
type Brand<K, T> = K & { __brand: T };

// Core ID types
export type ItemTypeId = Brand<string, 'ItemTypeId'>;
export type FieldId = Brand<string, 'FieldId'>;
export type FieldsetId = Brand<string, 'FieldsetId'>;
export type RecordId = Brand<string, 'RecordId'>;
export type UploadId = Brand<string, 'UploadId'>;
export type RoleId = Brand<string, 'RoleId'>;
export type UserId = Brand<string, 'UserId'>;
export type TokenId = Brand<string, 'TokenId'>;
export type WebhookId = Brand<string, 'WebhookId'>;
export type BuildTriggerId = Brand<string, 'BuildTriggerId'>;
export type EnvironmentId = Brand<string, 'EnvironmentId'>;
export type MenuItemId = Brand<string, 'MenuItemId'>;
export type PluginId = Brand<string, 'PluginId'>;

// Constructor functions with validation
export function itemTypeId(id: string): ItemTypeId {
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid ItemType ID');
  }
  return id as ItemTypeId;
}

// ... similar for all types

// Type guards
export function isItemTypeId(id: unknown): id is ItemTypeId {
  return typeof id === 'string' && id.length > 0;
}
```

#### Implementation Strategy
1. Create the branded types module
2. Update all schema definitions to use branded types
3. Update all handlers to construct branded types from input
4. Update client method calls to expect branded types
5. Add runtime validation at API boundaries

### Phase 2: Exhaustiveness Checking (Critical)

#### Problem
Router tools have switch statements that don't guarantee all cases are handled:
```typescript
switch (action) {
  case 'create': return createHandler(args);
  case 'read': return readHandler(args);
  // Missing 'update' case - TypeScript doesn't complain!
}
```

#### Solution: Never Type Assertion
```typescript
// src/utils/exhaustive.ts
export function assertExhaustive(value: never, message?: string): never {
  throw new Error(message ?? `Unhandled case: ${JSON.stringify(value)}`);
}

// Usage in routers
switch (action) {
  case 'create': return createHandler(args);
  case 'read': return readHandler(args);
  case 'update': return updateHandler(args);
  case 'delete': return deleteHandler(args);
  default: return assertExhaustive(action, `Unknown action: ${action}`);
}
```

#### Implementation Strategy
1. Create the exhaustive checking utility
2. Update all 11 router tools to use exhaustiveness checking
3. Ensure all action types are const unions (not just strings)

### Phase 3: Discriminated Unions for Errors (High Value)

#### Problem
Current error types are just strings, losing context:
```typescript
type ErrorType = 'validation_error' | 'not_found' | 'auth_error';
// No way to know what additional data each error should have
```

#### Solution: Rich Error Types
```typescript
// src/types/errors.ts
export type DatoCMSError =
  | { type: 'validation_error'; field: string; message: string; code: 'VALIDATION_FAILED' }
  | { type: 'not_found'; resource: string; id: string; code: 'NOT_FOUND' }
  | { type: 'auth_error'; reason: string; code: 'UNAUTHORIZED' }
  | { type: 'rate_limit'; retryAfter: number; code: 'RATE_LIMITED' }
  | { type: 'api_error'; statusCode: number; body: unknown; code: 'API_ERROR' };

// Type-safe error creation
export const DatoCMSErrors = {
  validation: (field: string, message: string): DatoCMSError => ({
    type: 'validation_error',
    field,
    message,
    code: 'VALIDATION_FAILED'
  }),
  notFound: (resource: string, id: string): DatoCMSError => ({
    type: 'not_found',
    resource,
    id,
    code: 'NOT_FOUND'
  }),
  // ... etc
};

// Type guard for error handling
export function isDatoCMSError(error: unknown): error is DatoCMSError {
  return isObject(error) && 'type' in error && 'code' in error;
}
```

### Phase 4: Template Literal Types (Medium Value)

#### Problem
String patterns like ordering are error-prone:
```typescript
orderBy: 'created_at_ASC' // Easy to typo, no autocomplete
```

#### Solution: Template Literal Types
```typescript
// src/types/templates.ts
export type SortableField = 'created_at' | 'updated_at' | 'position' | 'title';
export type SortDirection = 'ASC' | 'DESC';
export type OrderByClause = `${SortableField}_${SortDirection}`;

// Even more powerful - dynamic field sorting
export type OrderBy<T extends string> = `${T}_${'ASC' | 'DESC'}`;

// For API keys
export type ApiKey = `${Lowercase<string>}_${Lowercase<string>}`;

// For locales
export type LocaleCode = `${Lowercase<string>}-${Uppercase<string>}`;
```

### Phase 5: Const Assertions (Foundation)

#### Problem
Maintaining synchronization between runtime values and types:
```typescript
const FIELD_TYPES = ['boolean', 'color', 'date'];
type FieldType = 'boolean' | 'color' | 'date'; // Duplicate definition
```

#### Solution: Single Source of Truth
```typescript
// src/types/constants.ts
export const FIELD_TYPES = [
  'boolean',
  'color', 
  'date',
  'date_time',
  'file',
  'float',
  'gallery',
  'integer',
  'json',
  'lat_lon',
  'link',
  'links',
  'rich_text',
  'seo',
  'slug',
  'string',
  'structured_text',
  'text',
  'video'
] as const;

export type FieldType = typeof FIELD_TYPES[number];

// Validation function derived from const
export function isValidFieldType(type: unknown): type is FieldType {
  return FIELD_TYPES.includes(type as any);
}

// Similar for other constants
export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE'] as const;
export type HttpMethod = typeof HTTP_METHODS[number];
```

## Implementation Order

1. **Week 1: Foundation**
   - [ ] Create `src/types/branded.ts` with all ID types
   - [ ] Create `src/types/constants.ts` with const assertions
   - [ ] Create `src/types/errors.ts` with discriminated unions
   - [ ] Create `src/utils/exhaustive.ts` for switch checking

2. **Week 2: Core Updates**
   - [ ] Update all Zod schemas to use branded types
   - [ ] Update all router tools with exhaustiveness checking
   - [ ] Update error handling to use discriminated unions

3. **Week 3: Handler Migration**
   - [ ] Update all handlers to construct/use branded types
   - [ ] Update all error returns to use rich error types
   - [ ] Add template literal types where applicable

4. **Week 4: Testing & Documentation**
   - [ ] Comprehensive testing of type constraints
   - [ ] Update documentation with new patterns
   - [ ] Create migration guide for future handlers

## Validation Strategy

### Real Type Safety Checklist
- [ ] Can we pass a `RoleId` where `ItemTypeId` is expected? (Should fail compilation)
- [ ] Do switch statements fail to compile if we add a new action? (Should fail)
- [ ] Can we access error-specific fields based on error type? (Should work)
- [ ] Does autocomplete suggest valid ordering clauses? (Should work)
- [ ] Are runtime validations derived from type definitions? (Should be)

### Anti-Patterns to Avoid
1. **Don't use `as any` to "fix" type errors** - Find the real solution
2. **Don't create types that aren't enforced** - Types must have runtime validation
3. **Don't duplicate type information** - Use const assertions and derive types
4. **Don't make types too narrow** - Balance safety with flexibility

## Success Metrics
1. **Compile-time catches**: New errors caught during `npm run build`
2. **Developer experience**: Better autocomplete and error messages
3. **Runtime safety**: Fewer runtime type errors in production
4. **Code clarity**: Business logic visible in type definitions

## Migration Example

### Before:
```typescript
export const getFieldHandler = createRetrieveHandler({
  schema: z.object({
    itemTypeId: z.string(),
    fieldId: z.string()
  }),
  clientAction: async (client, args) => {
    return await client.fields.find(args.itemTypeId, args.fieldId);
  }
});
```

### After:
```typescript
export const getFieldHandler = createRetrieveHandler({
  schema: z.object({
    itemTypeId: z.string().transform(itemTypeId),
    fieldId: z.string().transform(fieldId)
  }),
  clientAction: async (client, args) => {
    // Now TypeScript ensures we can't mix up the IDs!
    return await client.fields.find(args.itemTypeId, args.fieldId);
  }
});
```

## Conclusion
This plan provides real, meaningful type safety improvements that will:
- Catch real bugs at compile time
- Improve code maintainability
- Make the codebase self-documenting
- Reduce cognitive load on developers

These aren't cosmetic changes - they're fundamental improvements to how we model our domain in TypeScript.