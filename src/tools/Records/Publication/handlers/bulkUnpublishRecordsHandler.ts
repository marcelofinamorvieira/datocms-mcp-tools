/**
 * @file bulkUnpublishRecordsHandler.ts
 * @description Handler for unpublishing multiple DatoCMS records in bulk
 * Extracted from the BulkUnpublishDatoCMSRecords tool
 */

import { createCustomHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { recordsSchemas } from "../../schemas.js";

/**
 * Handler function for unpublishing multiple DatoCMS records in bulk
 */
export const bulkUnpublishRecordsHandler = createCustomHandler({
  domain: "records",
  schemaName: "bulk_unpublish",
  schema: recordsSchemas.bulk_unpublish,
  entityName: "Records",
  clientAction: async (client, args) => {
    const { itemIds } = args;

    // Check if we have any IDs to unpublish
    if (itemIds.length === 0) {
      throw new Error("No record IDs provided for unpublication.");
    }
    
    // Check maximum number of records (DatoCMS API limit)
    if (itemIds.length > 200) {
      throw new Error("Maximum of 200 records allowed per bulk unpublish request.");
    }
    
    // Format input for bulkUnpublish with explicit type annotation
    const itemsToUnpublish = itemIds.map(id => ({ type: "item" as const, id }));
    
    // Call bulkUnpublish API
    await client.items.bulkUnpublish({
      items: itemsToUnpublish
    });
    
    // Return only confirmation message
    return `Successfully unpublished ${itemIds.length} record(s).`;
  }
});
