/**
 * @file bulkUnpublishRecordsHandler.ts
 * @description Handler for unpublishing multiple DatoCMS records in bulk
 * Extracted from the BulkUnpublishDatoCMSRecords tool
 */

import { createCustomHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { ClientType, UnifiedClientManager } from "../../../../utils/unifiedClientManager.js";
import { createResponse } from "../../../../utils/responseHandlers.js";
import { recordsSchemas } from "../../schemas.js";

/**
 * Handler function for unpublishing multiple DatoCMS records in bulk
 */
export const bulkUnpublishRecordsHandler = createCustomHandler({
  domain: "records",
  schemaName: "bulk_unpublish",
  schema: recordsSchemas.bulk_unpublish,
}, async (args: any) => {
  const { apiToken, environment, itemIds } = args;
  
  // Initialize client
  const client = UnifiedClientManager.getDefaultClient(apiToken, environment);

  // Check if we have any IDs to unpublish
  if (itemIds.length === 0) {
    throw new Error("No record IDs provided for unpublication.");
  }
  
  // Check maximum number of records (DatoCMS API limit)
  if (itemIds.length > 200) {
    throw new Error("Maximum of 200 records allowed per bulk unpublish request.");
  }
  
  // Format input for bulkUnpublish with explicit type annotation
  const itemsToUnpublish = itemIds.map((id: string) => ({ type: "item" as const, id }));
  
  // Call bulkUnpublish API
  await client.items.bulkUnpublish({
    items: itemsToUnpublish
  });
  
  // Return only confirmation message
  const result = `Successfully unpublished ${itemIds.length} record(s).`;
  return createResponse(result);
});
