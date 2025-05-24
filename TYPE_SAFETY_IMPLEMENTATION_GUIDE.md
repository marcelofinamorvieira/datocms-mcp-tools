# Type Safety Implementation Guide

## Phase 1: Branded Types Implementation

### Step 1: Create Core Branded Types Module

```typescript
// src/types/branded.ts
/**
 * Branded types for DatoCMS IDs
 * These types prevent accidental ID misuse at compile time
 */

// Core brand type - adds phantom type to base type
type Brand<K, T> = K & { __brand: T };

// Entity ID types
export type ItemTypeId = Brand<string, 'ItemTypeId'>;
export type FieldId = Brand<string, 'FieldId'>;
export type FieldsetId = Brand<string, 'FieldsetId'>;
export type RecordId = Brand<string, 'RecordId'>;
export type UploadId = Brand<string, 'UploadId'>;
export type RoleId = Brand<string, 'RoleId'>;
export type UserId = Brand<string, 'UserId'>;
export type AccessTokenId = Brand<string, 'AccessTokenId'>;
export type InvitationId = Brand<string, 'InvitationId'>;
export type WebhookId = Brand<string, 'WebhookId'>;
export type WebhookCallId = Brand<string, 'WebhookCallId'>;
export type BuildTriggerId = Brand<string, 'BuildTriggerId'>;
export type EnvironmentId = Brand<string, 'EnvironmentId'>;
export type MenuItemId = Brand<string, 'MenuItemId'>;
export type SchemaMenuItemId = Brand<string, 'SchemaMenuItemId'>;
export type PluginId = Brand<string, 'PluginId'>;
export type UploadCollectionId = Brand<string, 'UploadCollectionId'>;
export type ModelFilterId = Brand<string, 'ModelFilterId'>;
export type UploadsFilterId = Brand<string, 'UploadsFilterId'>;
export type JobResultId = Brand<string, 'JobResultId'>;
export type DeployEventId = Brand<string, 'DeployEventId'>;

// Constructor functions with validation
export function toItemTypeId(id: string): ItemTypeId {
  if (!id || typeof id !== 'string' || id.trim() === '') {
    throw new Error(`Invalid ItemType ID: ${id}`);
  }
  return id as ItemTypeId;
}

export function toFieldId(id: string): FieldId {
  if (!id || typeof id !== 'string' || id.trim() === '') {
    throw new Error(`Invalid Field ID: ${id}`);
  }
  return id as FieldId;
}

// ... repeat for all ID types

// Type guards
export function isItemTypeId(value: unknown): value is ItemTypeId {
  return typeof value === 'string' && value.length > 0;
}

export function isFieldId(value: unknown): value is FieldId {
  return typeof value === 'string' && value.length > 0;
}

// ... repeat for all ID types

// Zod transformers for use in schemas
import { z } from 'zod';

export const itemTypeIdSchema = z.string().min(1).transform(toItemTypeId);
export const fieldIdSchema = z.string().min(1).transform(toFieldId);
export const fieldsetIdSchema = z.string().min(1).transform(toFieldsetId);
export const recordIdSchema = z.string().min(1).transform(toRecordId);
export const uploadIdSchema = z.string().min(1).transform(toUploadId);
export const roleIdSchema = z.string().min(1).transform(toRoleId);
export const userIdSchema = z.string().min(1).transform(toUserId);
export const accessTokenIdSchema = z.string().min(1).transform(toAccessTokenId);
// ... repeat for all ID types
```

### Step 2: Update Shared Schemas

```typescript
// src/utils/sharedSchemas.ts
import { 
  itemTypeIdSchema, 
  fieldIdSchema, 
  recordIdSchema,
  uploadIdSchema,
  roleIdSchema,
  userIdSchema,
  // ... import all ID schemas
} from '../types/branded.js';

// Replace generic ID schemas with branded ones
export const createItemTypeIdSchema = (description: string = "The ID of the item type") => 
  itemTypeIdSchema.describe(description);

export const createFieldIdSchema = (description: string = "The ID of the field") =>
  fieldIdSchema.describe(description);

export const createRecordIdSchema = (description: string = "The ID of the record") =>
  recordIdSchema.describe(description);

// Update the generic createIdSchema to be deprecated
/**
 * @deprecated Use specific ID schema creators instead (createItemTypeIdSchema, etc.)
 */
export const createIdSchema = (entityName: string) => {
  console.warn(`createIdSchema is deprecated. Use specific ID schema for ${entityName}`);
  return z.string().min(1).describe(`The ID of the ${entityName}`);
};
```

### Step 3: Update Handler Example

```typescript
// Before: src/tools/Schema/Field/Read/handlers/getFieldHandler.ts
export const getFieldHandler = createRetrieveHandler({
  domain: 'fields',
  schemaName: 'get',
  schema: fieldSchemas.get,
  entityName: 'Field',
  idParam: 'fieldId',
  clientAction: async (client, args) => {
    const typedClient = client as Client;
    return await typedClient.fields.find(args.itemTypeId, args.fieldId);
  }
});

// After: with branded types
import { ItemTypeId, FieldId } from '../../../../../types/branded.js';

export const getFieldHandler = createRetrieveHandler({
  domain: 'fields',
  schemaName: 'get',
  schema: fieldSchemas.get, // Schema now uses branded types
  entityName: 'Field',
  idParam: 'fieldId',
  clientAction: async (client, args: { itemTypeId: ItemTypeId; fieldId: FieldId }) => {
    const typedClient = client as Client;
    // TypeScript now ensures we can't accidentally swap these parameters!
    return await typedClient.fields.find(args.itemTypeId, args.fieldId);
  }
});
```

## Phase 2: Exhaustiveness Checking

### Step 1: Create Exhaustiveness Utility

```typescript
// src/utils/exhaustive.ts
/**
 * Utility for exhaustiveness checking in TypeScript
 * Ensures all cases in a union are handled
 */

/**
 * Assert that a code path should never be reached
 * @param value - The value that should be of type `never`
 * @param message - Optional custom error message
 * @throws Error if the code path is reached
 */
export function assertNever(value: never, message?: string): never {
  const errorMessage = message ?? `Unhandled case: ${JSON.stringify(value)}`;
  throw new Error(errorMessage);
}

/**
 * Type guard that checks if all cases have been handled
 * Useful in switch statements with union types
 */
export function exhaustiveCheck(value: never): void {
  // This function should never be called if all cases are handled
  // TypeScript will error if there are unhandled cases
}

/**
 * Create a type-safe switch handler
 */
export function createExhaustiveSwitch<T extends string | number | symbol, R>(
  value: T,
  handlers: Record<T, () => R>
): R {
  if (value in handlers) {
    return handlers[value]();
  }
  return assertNever(value as never);
}
```

### Step 2: Update Router Tool Example

```typescript
// Before: src/tools/Schema/SchemaRouterTool.ts
if (args.action === 'itemType_create') {
  return await createItemTypeHandler(args as z.infer<typeof schemas.itemType_create>);
} else if (args.action === 'itemType_read') {
  return await getItemTypeHandler(args as z.infer<typeof schemas.itemType_read>);
}
// ... more if/else

// After: with exhaustiveness checking
import { assertNever } from '../../utils/exhaustive.js';

// Define action type as const union
const SCHEMA_ACTIONS = [
  'itemType_create',
  'itemType_read',
  'itemType_update',
  'itemType_delete',
  'itemType_duplicate',
  'itemType_list',
  'field_create',
  'field_read',
  'field_update',
  'field_delete',
  'field_list',
  // ... all actions
] as const;

type SchemaAction = typeof SCHEMA_ACTIONS[number];

// In the handler
const action = args.action as SchemaAction;

switch (action) {
  case 'itemType_create':
    return await createItemTypeHandler(args as z.infer<typeof schemas.itemType_create>);
  case 'itemType_read':
    return await getItemTypeHandler(args as z.infer<typeof schemas.itemType_read>);
  case 'itemType_update':
    return await updateItemTypeHandler(args as z.infer<typeof schemas.itemType_update>);
  case 'itemType_delete':
    return await deleteItemTypeHandler(args as z.infer<typeof schemas.itemType_delete>);
  // ... all other cases
  default:
    return assertNever(action, `Unknown schema action: ${action}`);
}
```

## Phase 3: Discriminated Error Unions

### Step 1: Create Error Types

```typescript
// src/types/errors.ts
/**
 * Discriminated union types for DatoCMS errors
 * Provides type-safe error handling with rich context
 */

// Base error interface
interface BaseError {
  timestamp: string;
  requestId?: string;
}

// Specific error types
export interface ValidationError extends BaseError {
  type: 'validation_error';
  code: 'VALIDATION_FAILED';
  field: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface NotFoundError extends BaseError {
  type: 'not_found';
  code: 'NOT_FOUND';
  resource: string;
  id: string;
}

export interface AuthError extends BaseError {
  type: 'auth_error';
  code: 'UNAUTHORIZED' | 'FORBIDDEN';
  reason: string;
}

export interface RateLimitError extends BaseError {
  type: 'rate_limit';
  code: 'RATE_LIMITED';
  retryAfter: number;
  limit: number;
  remaining: number;
}

export interface ApiError extends BaseError {
  type: 'api_error';
  code: 'API_ERROR';
  statusCode: number;
  message: string;
  body?: unknown;
}

export interface ConflictError extends BaseError {
  type: 'conflict';
  code: 'CONFLICT';
  resource: string;
  message: string;
}

// Union of all error types
export type DatoCMSError = 
  | ValidationError 
  | NotFoundError 
  | AuthError 
  | RateLimitError 
  | ApiError
  | ConflictError;

// Error constructors
export const DatoCMSErrors = {
  validation(field: string, message: string, details?: Record<string, unknown>): ValidationError {
    return {
      type: 'validation_error',
      code: 'VALIDATION_FAILED',
      field,
      message,
      details,
      timestamp: new Date().toISOString()
    };
  },

  notFound(resource: string, id: string): NotFoundError {
    return {
      type: 'not_found',
      code: 'NOT_FOUND',
      resource,
      id,
      timestamp: new Date().toISOString()
    };
  },

  unauthorized(reason: string): AuthError {
    return {
      type: 'auth_error',
      code: 'UNAUTHORIZED',
      reason,
      timestamp: new Date().toISOString()
    };
  },

  forbidden(reason: string): AuthError {
    return {
      type: 'auth_error',
      code: 'FORBIDDEN',
      reason,
      timestamp: new Date().toISOString()
    };
  },

  rateLimit(limit: number, remaining: number, retryAfter: number): RateLimitError {
    return {
      type: 'rate_limit',
      code: 'RATE_LIMITED',
      limit,
      remaining,
      retryAfter,
      timestamp: new Date().toISOString()
    };
  },

  api(statusCode: number, message: string, body?: unknown): ApiError {
    return {
      type: 'api_error',
      code: 'API_ERROR',
      statusCode,
      message,
      body,
      timestamp: new Date().toISOString()
    };
  },

  conflict(resource: string, message: string): ConflictError {
    return {
      type: 'conflict',
      code: 'CONFLICT',
      resource,
      message,
      timestamp: new Date().toISOString()
    };
  }
};

// Type guards
export function isDatoCMSError(error: unknown): error is DatoCMSError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    'code' in error &&
    'timestamp' in error
  );
}

export function isValidationError(error: unknown): error is ValidationError {
  return isDatoCMSError(error) && error.type === 'validation_error';
}

export function isNotFoundError(error: unknown): error is NotFoundError {
  return isDatoCMSError(error) && error.type === 'not_found';
}

// ... more type guards
```

### Step 2: Update Error Handler

```typescript
// src/utils/errorHandlers.ts
import { DatoCMSError, isDatoCMSError } from '../types/errors.js';

export const errorHandlers = {
  validation: (field: string, message: string) => 
    createResponse({
      error: DatoCMSErrors.validation(field, message)
    }),

  notFound: (resource: string, id: string) =>
    createResponse({
      error: DatoCMSErrors.notFound(resource, id)
    }),

  // Type-safe error handler that uses discriminated union
  handle: (error: DatoCMSError) => {
    switch (error.type) {
      case 'validation_error':
        return createResponse({
          error: `Validation failed for field '${error.field}': ${error.message}`
        });
      
      case 'not_found':
        return createResponse({
          error: `${error.resource} with ID '${error.id}' not found`
        });
      
      case 'auth_error':
        return createResponse({
          error: `Authentication failed: ${error.reason}`
        });
      
      case 'rate_limit':
        return createResponse({
          error: `Rate limit exceeded. Retry after ${error.retryAfter} seconds`
        });
      
      case 'api_error':
        return createResponse({
          error: `API error (${error.statusCode}): ${error.message}`
        });
      
      case 'conflict':
        return createResponse({
          error: `Conflict on ${error.resource}: ${error.message}`
        });
      
      default:
        // This ensures we handle all error types
        const _exhaustive: never = error;
        return createResponse({ error: 'Unknown error type' });
    }
  }
};
```

## Phase 4: Template Literal Types

### Step 1: Create Template Type Definitions

```typescript
// src/types/templates.ts
/**
 * Template literal types for type-safe string patterns
 */

// Sorting patterns
export type SortDirection = 'ASC' | 'DESC';

// Generic sorting for any field
export type OrderBy<T extends string> = `${T}_${SortDirection}`;

// Specific sortable fields for different resources
export type RecordSortableFields = 'created_at' | 'updated_at' | 'position' | 'published_at';
export type RecordOrderBy = OrderBy<RecordSortableFields>;

export type UploadSortableFields = 'created_at' | 'updated_at' | 'size' | 'filename';
export type UploadOrderBy = OrderBy<UploadSortableFields>;

// API key patterns (lowercase with underscores)
export type ApiKey = `${Lowercase<string>}_${Lowercase<string>}`;

// Locale patterns
export type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ja' | 'zh';
export type CountryCode = 'US' | 'GB' | 'ES' | 'FR' | 'DE' | 'IT' | 'BR' | 'JP' | 'CN';
export type LocaleCode = `${LanguageCode}-${CountryCode}`;

// Field type patterns for modular content
export type ModularContentBlockType = `${Lowercase<string>}_block`;

// Webhook event patterns
export type EntityType = 'item' | 'item_type' | 'upload';
export type EventType = 'create' | 'update' | 'delete' | 'publish' | 'unpublish';
export type WebhookEvent = `${EntityType}:${EventType}`;

// Environment patterns
export type EnvironmentName = 'main' | `${string}-sandbox` | `feature-${string}`;

// Permission patterns
export type ResourceType = 'item_type' | 'field' | 'fieldset' | 'upload' | 'webhook';
export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'publish';
export type Permission = `${ResourceType}:${PermissionAction}`;

// Validation functions
export function isValidOrderBy<T extends string>(
  value: string,
  validFields: readonly T[]
): value is OrderBy<T> {
  const pattern = /^(.+)_(ASC|DESC)$/;
  const match = value.match(pattern);
  if (!match) return false;
  
  const [, field, direction] = match;
  return validFields.includes(field as T) && ['ASC', 'DESC'].includes(direction);
}

export function isValidApiKey(value: string): value is ApiKey {
  return /^[a-z]+_[a-z]+$/.test(value);
}

export function isValidLocaleCode(value: string): value is LocaleCode {
  return /^[a-z]{2}-[A-Z]{2}$/.test(value);
}
```

### Step 2: Update Schemas to Use Template Types

```typescript
// src/tools/Records/schemas.ts
import { RecordOrderBy, isValidOrderBy, RecordSortableFields } from '../../types/templates.js';

const RECORD_SORTABLE_FIELDS: readonly RecordSortableFields[] = [
  'created_at',
  'updated_at', 
  'position',
  'published_at'
] as const;

export const recordQuerySchema = z.object({
  // ... other fields
  orderBy: z
    .string()
    .optional()
    .refine(
      (val): val is RecordOrderBy | undefined => 
        !val || isValidOrderBy(val, RECORD_SORTABLE_FIELDS),
      {
        message: `Order by must be one of: ${RECORD_SORTABLE_FIELDS.map(f => `${f}_ASC, ${f}_DESC`).join(', ')}`
      }
    )
    .describe('Sort order for results (e.g., "created_at_DESC", "position_ASC")')
});
```

## Phase 5: Const Assertions

### Step 1: Create Constants Module

```typescript
// src/types/constants.ts
/**
 * Type-safe constants using const assertions
 * Single source of truth for literal values
 */

// Field types
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

// Field appearances by type
export const FIELD_APPEARANCES = {
  boolean: ['switch', 'radio_buttons'] as const,
  color: ['color_picker', 'color_list'] as const,
  date: ['date_picker', 'date_time_picker'] as const,
  string: ['single_line', 'slug', 'simple_markdown'] as const,
  text: ['wysiwyg', 'textarea', 'markdown'] as const,
  // ... more
} as const;

export type FieldAppearanceMap = typeof FIELD_APPEARANCES;
export type FieldAppearance<T extends FieldType> = T extends keyof FieldAppearanceMap
  ? FieldAppearanceMap[T][number]
  : never;

// HTTP methods
export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const;
export type HttpMethod = typeof HTTP_METHODS[number];

// Entity types
export const ENTITY_TYPES = [
  'item',
  'item_type',
  'field',
  'fieldset',
  'upload',
  'role',
  'access_token',
  'webhook',
  'build_trigger',
  'environment',
  'menu_item',
  'plugin'
] as const;

export type EntityType = typeof ENTITY_TYPES[number];

// Validation functions derived from constants
export function isValidFieldType(type: unknown): type is FieldType {
  return FIELD_TYPES.includes(type as FieldType);
}

export function getFieldAppearances<T extends FieldType>(fieldType: T): readonly FieldAppearance<T>[] {
  return (FIELD_APPEARANCES[fieldType] ?? []) as readonly FieldAppearance<T>[];
}

// Type-safe enum creator
export function createEnum<T extends readonly string[]>(values: T): { [K in T[number]]: K } {
  return values.reduce((acc, val) => {
    acc[val] = val;
    return acc;
  }, {} as { [K in T[number]]: K });
}

// Usage example
export const FieldTypeEnum = createEnum(FIELD_TYPES);
// Now you can use FieldTypeEnum.boolean instead of 'boolean'
```

### Step 2: Update Field Type Usage

```typescript
// Before: src/tools/Schema/schemaTypes.ts
export type DatoCMSFieldType = 
  | 'boolean'
  | 'color'
  | 'date'
  // ... manually maintained list

// After: derived from const
import { FieldType, FIELD_TYPES } from '../../types/constants.js';

export type DatoCMSFieldType = FieldType; // Automatically stays in sync!

// In validation
export function validateFieldType(type: string): boolean {
  return FIELD_TYPES.includes(type as FieldType);
}
```

## Testing Strategy

### Type Safety Tests

```typescript
// src/types/__tests__/branded.test.ts
import { ItemTypeId, FieldId, toItemTypeId, toFieldId } from '../branded';

describe('Branded Types', () => {
  it('should not allow wrong ID types', () => {
    const itemId = toItemTypeId('123');
    const fieldId = toFieldId('456');
    
    // This should not compile:
    // @ts-expect-error - Cannot use FieldId where ItemTypeId expected
    const wrongUsage: ItemTypeId = fieldId;
    
    // This should compile:
    const correctUsage: ItemTypeId = itemId;
  });
  
  it('should validate IDs at runtime', () => {
    expect(() => toItemTypeId('')).toThrow('Invalid ItemType ID');
    expect(() => toFieldId(null as any)).toThrow('Invalid Field ID');
  });
});
```

### Exhaustiveness Tests

```typescript
// src/utils/__tests__/exhaustive.test.ts
import { assertNever } from '../exhaustive';

type Action = 'create' | 'read' | 'update';

describe('Exhaustiveness Checking', () => {
  it('should fail compilation if case is missing', () => {
    function handleAction(action: Action) {
      switch (action) {
        case 'create': return 'creating';
        case 'read': return 'reading';
        // Missing 'update' case
        default: 
          // @ts-expect-error - Argument of type '"update"' is not assignable to parameter of type 'never'
          return assertNever(action);
      }
    }
  });
});
```

## Migration Checklist

- [ ] Create all type modules (`branded.ts`, `constants.ts`, `errors.ts`, `templates.ts`, `exhaustive.ts`)
- [ ] Update shared schemas to use branded ID types
- [ ] Migrate Schema domain handlers (highest risk due to field/itemType relationships)
- [ ] Migrate Records domain handlers 
- [ ] Migrate Uploads domain handlers
- [ ] Migrate Collaborators domain handlers
- [ ] Migrate remaining domains
- [ ] Update all router tools with exhaustiveness checking
- [ ] Replace string error types with discriminated unions
- [ ] Add template literal types for patterns
- [ ] Convert literal unions to const assertions
- [ ] Run full test suite
- [ ] Update documentation

## Success Indicators

1. **Compilation catches ID misuse**: Cannot pass `RoleId` where `ItemTypeId` expected
2. **Switch statements are exhaustive**: Adding new action breaks compilation
3. **Errors have context**: Can access error-specific fields based on type
4. **Better autocomplete**: IDE suggests valid values for template literals
5. **No runtime type errors**: All dangerous operations caught at compile time