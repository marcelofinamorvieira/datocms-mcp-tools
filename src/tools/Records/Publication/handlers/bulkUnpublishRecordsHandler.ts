/**
 * @file bulkUnpublishRecordsHandler.ts
 * @description Handler for unpublishing multiple DatoCMS records in bulk
 * Extracted from the BulkUnpublishDatoCMSRecords tool
 */

import { createCustomHandler, BaseParams } from "../../../../utils/enhancedHandlerFactory.js";
import { recordsSchemas } from "../../schemas.js";
import { SimpleSchemaTypes } from "@datocms/cma-client-node";
import { createResponse, Response as McpResponse } from "../../../../utils/responseHandlers.js";

// Define proper params that extend BaseParams
interface BulkUnpublishParams extends BaseParams {
  itemIds: string[];
  recursive?: boolean;
}

/**
 * Handler function for unpublishing multiple DatoCMS records in bulk
 */
export const bulkUnpublishRecordsHandler = createCustomHandler<BulkUnpublishParams, McpResponse>(
  {
    domain: "records",
    schemaName: "bulk_unpublish",
    schema: recordsSchemas.bulk_unpublish,
    errorContext: {
      operation: "bulk_unpublish",
      resourceType: "Records"
    }
  },
  async (args) => {
    const { apiToken, environment, itemIds } = args;
    
    // Check if we have any IDs to unpublish
    if (itemIds.length === 0) {
      throw new Error("No record IDs provided for unpublication.");
    }
    
    // Check maximum number of records (DatoCMS API limit)
    if (itemIds.length > 200) {
      throw new Error("Maximum of 200 records allowed per bulk unpublish request.");
    }
    
    // Get the client
    const { UnifiedClientManager } = await import("../../../../utils/unifiedClientManager.js");
    const client = UnifiedClientManager.getDefaultClient(apiToken, environment);
    
    // Format input for bulkUnpublish with explicit type annotation
    const itemsToUnpublish: SimpleSchemaTypes.ItemBulkUnpublishSchema = {
      items: itemIds.map(id => ({ type: "item", id }))
    };
    
    // Call bulkUnpublish API
    const result = await client.items.bulkUnpublish(itemsToUnpublish);
    
    // Return response
    return createResponse(JSON.stringify({
      success: true,
      data: result,
      message: `Successfully unpublished ${itemIds.length} record(s).`
    }, null, 2));
  }
);
