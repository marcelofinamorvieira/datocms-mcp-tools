/**
 * @file getItemTypeHandler.ts
 * @description Handler for retrieving a specific DatoCMS Item Type by ID
 */

import { createCustomHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { schemaSchemas } from "../../../schemas.js";
import { UnifiedClientManager } from "../../../../../utils/unifiedClientManager.js";

/**
 * Handler to retrieve a specific Item Type by ID
 */
export const getItemTypeHandler = createCustomHandler({
  domain: "schema",
  schemaName: "get_item_type", 
  schema: schemaSchemas.get_item_type,
  errorContext: {
    operation: "retrieve",
    resourceType: "ItemType",
    handlerName: "getItemTypeHandler"
  }
}, async (args) => {
  const { apiToken, itemTypeId, environment } = args;
  
  // Initialize DatoCMS client
  const client = UnifiedClientManager.getDefaultClient(apiToken, environment);
  
  // Retrieve the item type
  const itemType = await client.itemTypes.find(itemTypeId);
  
  // Add special note if the model has all_locales_required flag
  if (itemType.all_locales_required) {
    return {
      success: true,
      data: itemType,
      message: "NOTE: This model requires all locales to be present for localized fields. When creating or updating records, you must provide values for all configured locales in every localized field. Check the model's fields to see which ones are localized."
    };
  }

  // Return the item type data
  return {
    success: true,
    data: itemType
  };
});