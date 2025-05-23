/**
 * @file getRecordReferencesHandler.ts
 * @description Handler for retrieving references to a specific DatoCMS record
 * Extracted from the GetDatoCMSRecordReferences tool
 */

import { createCustomHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { returnMostPopulatedLocale } from "../../../../utils/returnMostPopulatedLocale.js";
import { recordsSchemas } from "../../schemas.js";

/**
 * Handler function for retrieving references to a specific DatoCMS record
 */
export const getRecordReferencesHandler = createCustomHandler({
  domain: "records",
  schemaName: "references",
  schema: recordsSchemas.references,
  entityName: "Record References",
  clientAction: async (client, args) => {
    const {
      itemId,
      version = "current",
      returnAllLocales = false,
      nested = true,
      returnOnlyIds = false
    } = args;
    
    // Retrieve records that reference the specified item with nested parameter
    const referencingItems = await client.items.references(itemId, { nested, version });

    // Return empty result message if no items found
    if (referencingItems.length === 0) {
      return "No items found linking to the specified record.";
    }
    
    // If returnOnlyIds is true, return just the IDs using map for cleaner code
    if (returnOnlyIds) {
      return referencingItems.map(item => item.id);
    }
    
    // Process the items to filter locales (saves on tokens) unless returnAllLocales is true
    return returnMostPopulatedLocale(referencingItems, returnAllLocales);
  }
});
