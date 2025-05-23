/**
 * @file bulkPublishRecordsHandler.ts
 * @description Handler for publishing multiple DatoCMS records in bulk
 * Extracted from the BulkPublishDatoCMSRecords tool
 */

import { createCustomHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { ClientType } from "../../../../utils/unifiedClientManager.js";
import { createResponse } from "../../../../utils/responseHandlers.js";
import { recordsSchemas } from "../../schemas.js";
import type { z } from "zod";

type BulkPublishArgs = z.input<typeof recordsSchemas.bulk_publish>;

/**
 * Handler function for publishing multiple DatoCMS records in bulk
 */
export const bulkPublishRecordsHandler = createCustomHandler(
  {
    domain: "records",
    schemaName: "bulk_publish",
    schema: recordsSchemas.bulk_publish,
    clientType: ClientType.DEFAULT
  },
  async (args: BulkPublishArgs) => {
  const { apiToken, environment, itemIds } = args;
  
  // Initialize client - use default client for bulk operations
  const { UnifiedClientManager } = await import("../../../../utils/unifiedClientManager.js");
  const client = UnifiedClientManager.getDefaultClient(apiToken, environment);

  // Check if we have any IDs to publish
  if (itemIds.length === 0) {
    throw new Error("No record IDs provided for publication.");
  }
  
  // Check maximum number of records (DatoCMS API limit)
  if (itemIds.length > 200) {
    throw new Error("Maximum of 200 records allowed per bulk publish request.");
  }
  
  // Format input for bulkPublish with explicit type annotation
  const itemsToPublish = itemIds.map((id: string) => ({ type: "item" as const, id }));
  
  // Call bulkPublish API
  await client.items.bulkPublish({
    items: itemsToPublish
  });
  
  // Return only confirmation message
  const result = `Successfully published ${itemIds.length} record(s).`;
  return createResponse(result);
});
