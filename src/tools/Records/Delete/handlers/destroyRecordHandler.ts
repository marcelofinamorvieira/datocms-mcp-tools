/**
 * @file destroyRecordHandler.ts
 * @description Handler for deleting a DatoCMS record
 * Extracted from the DestroyDatoCMSRecord tool
 */

import { createCustomHandler, BaseParams } from "../../../../utils/enhancedHandlerFactory.js";
import { recordsSchemas } from "../../schemas.js";
import { SimpleSchemaTypes } from "@datocms/cma-client-node";
import { createStandardSuccessResponse, createStandardMcpResponse } from "../../../../utils/standardResponse.js";
import type { Response as McpResponse } from "../../../../utils/responseHandlers.js";

interface DestroyRecordParams extends BaseParams {
  itemId: string;
  returnOnlyConfirmation?: boolean;
}

/**
 * Handler function for deleting a DatoCMS record
 */
export const destroyRecordHandler = createCustomHandler<DestroyRecordParams, McpResponse>(
  {
    domain: "records",
    schemaName: "destroy",
    schema: recordsSchemas.destroy,
    errorContext: {
      operation: "delete",
      resourceType: "Record"
    }
  },
  async (args) => {
    const { apiToken, environment, itemId, returnOnlyConfirmation = false } = args;
    
    // Get the client
    const { UnifiedClientManager } = await import("../../../../utils/unifiedClientManager.js");
    const client = UnifiedClientManager.getDefaultClient(apiToken, environment);
    
    const deletedItem = await client.items.destroy(itemId) as SimpleSchemaTypes.Item;
    
    // If no item returned, return error
    if (!deletedItem) {
      throw new Error(`Failed to delete record with ID '${itemId}'.`);
    }

    // Return only confirmation message if requested (to save on tokens)
    if (returnOnlyConfirmation) {
      const response = createStandardSuccessResponse(
        null,
        `Successfully deleted record with ID '${itemId}'.`
      );
      return createStandardMcpResponse(response);
    }

    // Otherwise return the full record data
    const response = createStandardSuccessResponse(
      deletedItem,
      `Successfully deleted record with ID '${itemId}'.`
    );
    return createStandardMcpResponse(response);
  }
);
