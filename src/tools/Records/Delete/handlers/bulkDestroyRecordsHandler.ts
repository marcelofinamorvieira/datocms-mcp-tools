/**
 * @file bulkDestroyRecordsHandler.ts
 * @description Handler for deleting multiple DatoCMS records in bulk
 * Extracted from the BulkDestroyDatoCMSRecords tool
 */

import { createCustomHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { createResponse, Response as MCPResponse } from "../../../../utils/responseHandlers.js";
import { recordsSchemas } from "../../schemas.js";
import type { BaseParams } from "../../../../utils/enhancedHandlerFactory.js";
import type { Client } from "@datocms/cma-client-node";

interface BulkDestroyRecordsParams extends BaseParams {
  itemIds: string[];
}

/**
 * Handler function for deleting multiple DatoCMS records in bulk
 */
export const bulkDestroyRecordsHandler = createCustomHandler<BulkDestroyRecordsParams, MCPResponse>(
  {
    domain: "records",
    schemaName: "bulk_destroy",
    schema: recordsSchemas.bulk_destroy
  },
  async (args) => {
    const { itemIds, apiToken, environment } = args;

    // Get the records client
    const { UnifiedClientManager } = await import("../../../../utils/unifiedClientManager.js");
    const client = UnifiedClientManager.getDefaultClient(apiToken, environment) as Client;

    // Check if we have any IDs to delete
    if (!Array.isArray(itemIds) || itemIds.length === 0) {
      throw new Error("No record IDs provided for deletion or itemIds is not an array.");
    }
    
    // Check maximum number of records (similar to bulk publish)
    if (itemIds.length > 200) {
      throw new Error("Maximum of 200 records allowed per bulk delete request.");
    }
    
    // Format input for bulkDestroy with explicit type annotation
    // Format each ID into the required structure for the API
    const itemsToDelete = itemIds.map((id) => ({ type: "item" as const, id }));
    
    // Execute bulk deletion
    await client.items.bulkDestroy({
      items: itemsToDelete,
    });
    
    // Return success response with count
    const message = `Successfully deleted ${itemIds.length} record(s) with IDs: ${itemIds.join(", ")}`;
    return createResponse(JSON.stringify({ success: true, message }, null, 2));
  }
);
