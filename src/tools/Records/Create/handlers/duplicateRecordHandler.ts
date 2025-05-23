/**
 * @file duplicateRecordHandler.ts
 * @description Handler for duplicating a DatoCMS record
 * Extracted from the DuplicateDatoCMSRecord tool
 */

import { createCustomHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { recordsSchemas } from "../../schemas.js";

/**
 * Handler function for duplicating a DatoCMS record
 */
export const duplicateRecordHandler = createCustomHandler({
  domain: "records",
  schemaName: "duplicate",
  schema: recordsSchemas.duplicate,
  entityName: "Record",
  clientAction: async (client, args) => {
    const { itemId, returnOnlyConfirmation = false } = args;
    
    // Duplicate the item
    const duplicatedItem = await client.items.duplicate(itemId);
    
    // If no item returned, return error
    if (!duplicatedItem) {
      throw new Error(`Failed to duplicate record with ID '${itemId}'.`);
    }

    // Return only confirmation message if requested (to save on tokens)
    if (returnOnlyConfirmation) {
      return `Successfully duplicated record with ID '${itemId}'. New record ID: '${duplicatedItem.id}'`;
    }

    // Otherwise return the full record data
    return duplicatedItem;
  }
});
