/**
 * @file getRecordReferencesHandler.ts
 * @description Handler for retrieving references to a specific DatoCMS record
 * Extracted from the GetDatoCMSRecordReferences tool
 */

import { createCustomHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { ClientType, UnifiedClientManager } from "../../../../utils/unifiedClientManager.js";
import { createResponse } from "../../../../utils/responseHandlers.js";
import { returnMostPopulatedLocale } from "../../../../utils/returnMostPopulatedLocale.js";
import { recordsSchemas } from "../../schemas.js";

/**
 * Handler function for retrieving references to a specific DatoCMS record
 */
export const getRecordReferencesHandler = createCustomHandler({
  domain: "records",
  schemaName: "references",
  schema: recordsSchemas.references,
}, async (args: any) => {
  const {
    apiToken,
    environment,
    itemId,
    version = "current",
    returnAllLocales = false,
    nested = true,
    returnOnlyIds = false
  } = args;
  
  // Initialize client
  const client = UnifiedClientManager.getDefaultClient(apiToken, environment);
  
  // Retrieve records that reference the specified item with nested parameter
  const referencingItems = await client.items.references(itemId, { nested, version });

  // Return empty result message if no items found
  if (referencingItems.length === 0) {
    return createResponse("No items found linking to the specified record.");
  }
  
  // If returnOnlyIds is true, return just the IDs using map for cleaner code
  if (returnOnlyIds) {
    const result = referencingItems.map((item: any) => item.id);
    return createResponse(JSON.stringify(result, null, 2));
  }
  
  // Process the items to filter locales (saves on tokens) unless returnAllLocales is true
  const result = returnMostPopulatedLocale(referencingItems, returnAllLocales);
  return createResponse(JSON.stringify(result, null, 2));
});
