/**
 * @file duplicateItemTypeHandler.ts
 * @description Handler for duplicating existing DatoCMS Item Types
 */

import { createCustomHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { schemaSchemas } from "../../../schemas.js";
import { UnifiedClientManager } from "../../../../../utils/unifiedClientManager.js";
import { createResponse } from "../../../../../utils/responseHandlers.js";

/**
 * Handler to duplicate an existing Item Type in DatoCMS
 */
export const duplicateItemTypeHandler = createCustomHandler({
  domain: "schema",
  schemaName: "duplicate_item_type",
  schema: schemaSchemas.duplicate_item_type,
  errorContext: {
    operation: "duplicate",
    resourceType: "ItemType",
    handlerName: "duplicateItemTypeHandler"
  }
}, async (args) => {
  const { apiToken, itemTypeId, name, apiKey, environment } = args;
  
  // Initialize DatoCMS client
  const client = UnifiedClientManager.getDefaultClient(apiToken, environment);
  
  // First find the item type to duplicate
  const itemType = await client.itemTypes.find(itemTypeId);

  // Then create a new item type with the same structure but different name and API key
  const duplicatedItemType = await client.itemTypes.create({
    name: name,
    api_key: apiKey,
    // Copy relevant properties from the original
    all_locales_required: itemType.all_locales_required,
    draft_mode_active: itemType.draft_mode_active,
    modular_block: itemType.modular_block,
    ordering_direction: itemType.ordering_direction,
    ordering_field: itemType.ordering_field,
    singleton: itemType.singleton,
    sortable: itemType.sortable,
    title_field: itemType.title_field,
    tree: itemType.tree
  });
  
  return createResponse(JSON.stringify(duplicatedItemType, null, 2));
});