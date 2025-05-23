/**
 * @file duplicateRecordHandler.ts
 * @description Handler for duplicating a DatoCMS record
 * Extracted from the DuplicateDatoCMSRecord tool
 */

import { createCustomHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { ClientType } from "../../../../utils/unifiedClientManager.js";
import { recordsSchemas } from "../../schemas.js";
import { createResponse } from "../../../../utils/responseHandlers.js";

/**
 * Handler function for duplicating a DatoCMS record
 */
export const duplicateRecordHandler = createCustomHandler(
  {
    domain: "records",
    schemaName: "duplicate",
    schema: recordsSchemas.duplicate,
    clientType: ClientType.DEFAULT
  },
  async (args: any) => {
    const { itemId, returnOnlyConfirmation = false, apiToken, environment } = args;
    
    // Get the records client
    const { UnifiedClientManager } = await import("../../../../utils/unifiedClientManager.js");
    const client = UnifiedClientManager.getDefaultClient(apiToken, environment);
    
    // Duplicate the item
    const duplicatedItem = await client.items.duplicate(itemId);
    
    // If no item returned, return error
    if (!duplicatedItem) {
      throw new Error(`Failed to duplicate record with ID '${itemId}'.`);
    }

    // Return only confirmation message if requested (to save on tokens)
    if (returnOnlyConfirmation) {
      const message = `Successfully duplicated record with ID '${itemId}'. New record ID: '${duplicatedItem.id}'`;
      return createResponse(JSON.stringify({ success: true, message }, null, 2));
    }

    // Otherwise return the full record data
    return createResponse(JSON.stringify(duplicatedItem, null, 2));
  }
);
