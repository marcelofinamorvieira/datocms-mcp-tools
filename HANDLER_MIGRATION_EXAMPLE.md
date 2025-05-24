# Handler Migration Example

## Example: Migrating getFieldHandler

This document shows a complete example of migrating a handler to use the new advanced type patterns.

### Step 1: Update the Schema

First, update the schema definition to use branded ID types:

```typescript
// src/tools/Schema/schemas.ts

// OLD:
get_field: baseToolSchema.extend({
  fieldId: z.string().min(1).describe("The ID of the field to retrieve.")
}),

// NEW:
import { fieldIdSchema } from '../../types/branded.js';

get_field: baseToolSchema.extend({
  fieldId: fieldIdSchema.describe("The ID of the field to retrieve.")
}),
```

### Step 2: Update Handler Interface

Update the handler to use branded types:

```typescript
// src/tools/Schema/Field/Read/handlers/getFieldHandler.ts

// OLD:
interface GetFieldParams extends BaseParams {
  fieldId: string;
}

// NEW:
import { FieldId } from '../../../../../types/branded.js';

interface GetFieldParams extends BaseParams {
  fieldId: FieldId;
}
```

### Step 3: Update Error Handling

Replace string errors with discriminated unions:

```typescript
// OLD:
} catch (error) {
  return createResponse({
    success: false,
    error: `Failed to retrieve field: ${error.message}`
  });
}

// NEW:
import { DatoCMSErrors, fromApiError } from '../../../../../types/errors.js';

} catch (error) {
  // Check if it's a 404 error
  if (error.status === 404) {
    return createResponse({
      success: false,
      error: DatoCMSErrors.notFound('field', fieldId)
    });
  }
  
  // Use the error converter for other API errors
  return createResponse({
    success: false,
    error: fromApiError(error)
  });
}
```

### Step 4: Complete Handler Example

Here's the complete migrated handler:

```typescript
import { createCustomHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { createResponse, Response as McpResponse } from "../../../../../utils/responseHandlers.js";
import { schemaSchemas } from "../../../schemas.js";
import { UnifiedClientManager } from "../../../../../utils/unifiedClientManager.js";
import type { BaseParams } from "../../../../../utils/enhancedHandlerFactory.js";
import { FieldId } from '../../../../../types/branded.js';
import { DatoCMSErrors, fromApiError, getErrorMessage } from '../../../../../types/errors.js';

interface GetFieldParams extends BaseParams {
  fieldId: FieldId; // Now using branded type
}

/**
 * Retrieves a specific field by ID
 */
export const getFieldHandler = createCustomHandler<GetFieldParams, McpResponse>({
  domain: "schema",
  schemaName: "get_field",
  schema: schemaSchemas.get_field,
  errorContext: {
    operation: "retrieve",
    resourceType: "Field",
    handlerName: "getFieldHandler"
  }
}, async (args) => {
  const { apiToken, fieldId, environment } = args;

  try {
    // Build the DatoCMS client
    const client = UnifiedClientManager.getDefaultClient(apiToken, environment);

    // Get the field by ID - fieldId is now type-safe
    const field = await client.fields.find(fieldId);

    // Add special note if the field is localized to help guide users
    if (field.localized) {
      return createResponse({
        success: true,
        data: field,
        message: `Field retrieved successfully. NOTE: This field is localized, meaning its values must be provided as an object with locale keys when creating or updating records. Example: { "${field.api_key}": { "en": "English value", "it": "Italian value" } }`
      });
    }

    return createResponse({
      success: true,
      data: field,
      message: `Field retrieved successfully.`
    });
  } catch (error: any) {
    // Use discriminated error unions
    if (error?.status === 404) {
      const notFoundError = DatoCMSErrors.notFound('field', fieldId);
      return createResponse({
        success: false,
        error: getErrorMessage(notFoundError)
      });
    }

    // Convert other API errors
    const apiError = fromApiError(error);
    return createResponse({
      success: false,
      error: getErrorMessage(apiError)
    });
  }
});
```

### Step 5: Update Handlers That Accept Multiple IDs

For handlers that work with both itemTypeId and fieldId:

```typescript
// OLD:
interface ListFieldsParams extends BaseParams {
  itemTypeId: string;
}

// NEW:
import { ItemTypeId } from '../../../../../types/branded.js';

interface ListFieldsParams extends BaseParams {
  itemTypeId: ItemTypeId;
}
```

### Step 6: Update Handlers with Sorting

For handlers that accept orderBy parameters:

```typescript
// OLD:
orderBy: z.string().optional()

// NEW:
import { RecordOrderBy, isValidOrderBy, RECORD_SORTABLE_FIELDS } from '../../../../../types/templates.js';

orderBy: z.string().optional().refine(
  (val): val is RecordOrderBy | undefined => 
    !val || isValidOrderBy(val, RECORD_SORTABLE_FIELDS),
  {
    message: `Order by must be one of: ${RECORD_SORTABLE_FIELDS.map(f => `${f}_ASC, ${f}_DESC`).join(', ')}`
  }
).describe('Sort order for results (e.g., "created_at_DESC", "position_ASC")')
```

### Step 7: Update Field Type Usage

When working with field types:

```typescript
// OLD:
field_type: z.enum(['boolean', 'color', 'date', ...])

// NEW:
import { FIELD_TYPES, FieldType } from '../../../../../types/constants.js';

field_type: z.enum(FIELD_TYPES).describe('The type of field to create')

// In handler code:
const fieldType: FieldType = args.field_type;
```

## Benefits of Migration

1. **Type Safety**: Cannot accidentally pass wrong ID types
2. **Better Errors**: Rich error objects with context
3. **Autocomplete**: IDE knows valid sorting fields
4. **Self-Documenting**: Types explain valid values
5. **Runtime Validation**: Matches compile-time guarantees

## Testing the Migration

After migrating a handler:
1. Run `npm run build` - should compile without errors
2. Try to pass wrong ID type - should get TypeScript error
3. Test error cases - should get rich error objects
4. Check autocomplete - should suggest valid values