/**
 * @file destroyRecordHandler.ts
 * @description Handler for deleting a DatoCMS record
 * Extracted from the DestroyDatoCMSRecord tool
 */

import { createDeleteHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { recordsSchemas } from "../../schemas.js";

/**
 * Handler function for deleting a DatoCMS record
 */
export const destroyRecordHandler = createDeleteHandler({
  domain: "records",
  schemaName: "destroy",
  schema: recordsSchemas.destroy,
  entityName: "Record",
  idParam: "itemId",
  clientAction: async (client, args) => {
    const { itemId, returnOnlyConfirmation = false } = args;
    
    const deletedItem = await client.items.destroy(itemId);
    
    // If no item returned, return error
    if (!deletedItem) {
      throw new Error(`Failed to delete record with ID '${itemId}'.`);
    }

    // Return only confirmation message if requested (to save on tokens)
    if (returnOnlyConfirmation) {
      return `Successfully deleted record with ID '${itemId}'.`;
    }

    // Otherwise return the full record data
    return deletedItem;
  }
});
