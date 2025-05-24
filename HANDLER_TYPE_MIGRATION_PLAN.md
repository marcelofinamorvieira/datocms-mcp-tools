# Handler Type Migration Plan

## Overview
This document outlines the plan to update all handlers to use the new advanced type patterns:
1. Branded types for IDs
2. Discriminated error unions
3. Template literal types for patterns
4. Const-based field types

## Current State
- ✅ Type infrastructure is in place
- ✅ All router tools have exhaustiveness checking
- 🔄 Handlers need to be updated to use new types

## Migration Strategy

### Phase 1: Update Schema Definitions
All Zod schemas need to be updated to use branded ID types:

```typescript
// Before
const schema = z.object({
  itemTypeId: z.string(),
  fieldId: z.string()
});

// After
import { itemTypeIdSchema, fieldIdSchema } from '../types/branded.js';

const schema = z.object({
  itemTypeId: itemTypeIdSchema,
  fieldId: fieldIdSchema
});
```

### Phase 2: Update Handler Parameters
Handlers need to accept branded types:

```typescript
// Before
interface HandlerParams {
  itemTypeId: string;
  fieldId: string;
}

// After
import { ItemTypeId, FieldId } from '../types/branded.js';

interface HandlerParams {
  itemTypeId: ItemTypeId;
  fieldId: FieldId;
}
```

### Phase 3: Update Error Handling
Replace string errors with discriminated unions:

```typescript
// Before
return createErrorResponse(`Item type with ID '${id}' not found`);

// After
import { DatoCMSErrors } from '../types/errors.js';

return createErrorResponse(DatoCMSErrors.notFound('item_type', id));
```

### Phase 4: Use Template Literals
For sorting and filtering:

```typescript
// Before
orderBy: z.string().optional()

// After
import { RecordOrderBy, isValidOrderBy, RECORD_SORTABLE_FIELDS } from '../types/templates.js';

orderBy: z.string().optional().refine(
  (val): val is RecordOrderBy | undefined => 
    !val || isValidOrderBy(val, RECORD_SORTABLE_FIELDS)
)
```

## Handler Groups to Update

### 1. Schema Domain (High Priority)
- **ItemType handlers** (6 files)
  - createItemTypeHandler
  - duplicateItemTypeHandler
  - getItemTypeHandler
  - listItemTypesHandler
  - updateItemTypeHandler
  - deleteItemTypeHandler

- **Field handlers** (5 files)
  - createFieldHandler
  - getFieldHandler
  - listFieldsHandler
  - updateFieldHandler
  - deleteFieldHandler

- **Fieldset handlers** (5 files)
  - createFieldsetHandler
  - getFieldsetHandler
  - listFieldsetsHandler
  - updateFieldsetHandler
  - destroyFieldsetHandler

### 2. Records Domain (High Priority)
- **CRUD handlers** (5 files)
  - createRecordHandler
  - getRecordByIdHandler
  - queryRecordsHandler
  - updateRecordHandler
  - destroyRecordHandler

- **Bulk operations** (4 files)
  - bulkDestroyRecordsHandler
  - bulkPublishRecordsHandler
  - bulkUnpublishRecordsHandler
  - duplicateRecordHandler

### 3. Uploads Domain (Medium Priority)
- **Upload handlers** (8 files)
  - createUploadHandler
  - getUploadByIdHandler
  - queryUploadsHandler
  - updateUploadHandler
  - destroyUploadHandler
  - bulkDestroyUploadsHandler
  - bulkTagUploadsHandler
  - bulkSetUploadCollectionHandler

### 4. Collaborators Domain (Medium Priority)
- **User handlers** (5 files)
  - inviteUserHandler
  - listUsersHandler
  - retrieveUserHandler
  - updateUserHandler
  - destroyUserHandler

- **Role handlers** (6 files)
  - createRoleHandler
  - listRolesHandler
  - retrieveRoleHandler
  - updateRoleHandler
  - destroyRoleHandler
  - duplicateRoleHandler

- **Token handlers** (5 files)
  - createTokenHandler
  - listTokensHandler
  - retrieveTokenHandler
  - updateTokenHandler
  - rotateTokenHandler

### 5. Other Domains (Lower Priority)
- Environment handlers (6 files)
- Webhook handlers (5 files)
- Build trigger handlers (9 files)
- UI handlers (menu items, filters, plugins)
- Project handlers (2 files)
- Locale handlers (5 files)

## Implementation Order
1. Start with Schema domain (Field and ItemType handlers)
2. Move to Records domain (high usage)
3. Continue with Uploads domain
4. Complete remaining domains

## Testing Strategy
After each domain:
1. Run `npm run build` to check for type errors
2. Test that branded types prevent ID misuse
3. Verify error handling with discriminated unions
4. Check template literal validation

## Success Criteria
- [ ] All handlers use branded ID types
- [ ] No string concatenation for errors
- [ ] Template literals for all patterns
- [ ] Zero TypeScript errors
- [ ] Runtime validation matches compile-time types