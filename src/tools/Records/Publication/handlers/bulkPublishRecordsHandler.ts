/**
 * @file bulkPublishRecordsHandler.ts
 * @description Handler for publishing multiple DatoCMS records in bulk
 * Extracted from the BulkPublishDatoCMSRecords tool
 */

import { createCustomHandler, BaseParams } from "../../../../utils/enhancedHandlerFactory.js";
import { recordsSchemas } from "../../schemas.js";
import { SimpleSchemaTypes } from "@datocms/cma-client-node";
import { createResponse, Response as McpResponse } from "../../../../utils/responseHandlers.js";

interface BulkPublishParams extends BaseParams {
  itemIds: string[];
  content_in_locales?: string[];
  non_localized_content?: boolean;
  recursive?: boolean;
}

/**
 * Handler function for publishing multiple DatoCMS records in bulk
 */
export const bulkPublishRecordsHandler = createCustomHandler<BulkPublishParams, McpResponse>(
  {
    domain: "records",
    schemaName: "bulk_publish",
    schema: recordsSchemas.bulk_publish,
    errorContext: {
      operation: "bulk_publish",
      resourceType: "Records"
    }
  },
  async (args) => {
    const { apiToken, environment, itemIds } = args;
    
    // Check if we have any IDs to publish
    if (itemIds.length === 0) {
      throw new Error("No record IDs provided for publication.");
    }
    
    // Check maximum number of records (DatoCMS API limit)
    if (itemIds.length > 200) {
      throw new Error("Maximum of 200 records allowed per bulk publish request.");
    }
    
    // Get the client
    const { UnifiedClientManager } = await import("../../../../utils/unifiedClientManager.js");
    const client = UnifiedClientManager.getDefaultClient(apiToken, environment);
    
    // Format input for bulkPublish with explicit type annotation
    const itemsToPublish: SimpleSchemaTypes.ItemBulkPublishSchema = {
      items: itemIds.map(id => ({ type: "item", id }))
    };
    
    // Call bulkPublish API
    const result = await client.items.bulkPublish(itemsToPublish);
    
    // Return response
    return createResponse(JSON.stringify({
      success: true,
      data: result,
      message: `Successfully published ${itemIds.length} record(s).`
    }, null, 2));
  }
);
