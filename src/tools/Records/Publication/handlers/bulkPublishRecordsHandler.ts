/**
 * @file bulkPublishRecordsHandler.ts
 * @description Handler for publishing multiple DatoCMS records in bulk
 * Extracted from the BulkPublishDatoCMSRecords tool
 */

import { createCustomHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { recordsSchemas } from "../../schemas.js";

/**
 * Handler function for publishing multiple DatoCMS records in bulk
 */
export const bulkPublishRecordsHandler = createCustomHandler({
  domain: "records",
  schemaName: "bulk_publish",
  schema: recordsSchemas.bulk_publish,
  entityName: "Records",
  clientAction: async (client, args) => {
    const { itemIds } = args;

    // Check if we have any IDs to publish
    if (itemIds.length === 0) {
      throw new Error("No record IDs provided for publication.");
    }
    
    // Check maximum number of records (DatoCMS API limit)
    if (itemIds.length > 200) {
      throw new Error("Maximum of 200 records allowed per bulk publish request.");
    }
    
    // Format input for bulkPublish with explicit type annotation
    const itemsToPublish = itemIds.map(id => ({ type: "item" as const, id }));
    
    // Call bulkPublish API
    await client.items.bulkPublish({
      items: itemsToPublish
    });
    
    // Return only confirmation message
    return `Successfully published ${itemIds.length} record(s).`;
  }
});
