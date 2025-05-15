/**
 * @file bulkDestroyRecordsHandler.ts
 * @description Handler for deleting multiple DatoCMS records in bulk
 * Extracted from the BulkDestroyDatoCMSRecords tool
 */

import type { z } from "zod";
import { getClient } from "../../../../utils/clientManager.js";
import { isAuthorizationError, isNotFoundError, createErrorResponse , extractDetailedErrorInfo } from "../../../../utils/errorHandlers.js";
import { createResponse } from "../../../../utils/responseHandlers.js";
import type { recordsSchemas } from "../../schemas.js";

/**
 * Handler function for deleting multiple DatoCMS records in bulk
 */
export const bulkDestroyRecordsHandler = async (args: z.infer<typeof recordsSchemas.bulk_destroy>) => {
  // Verify args is not undefined and contains the expected properties
  if (!args || !args.apiToken || !args.itemIds) {
    return createErrorResponse("Error: Missing required parameters. Required: apiToken, itemIds.");
  }
  
  const { apiToken, itemIds, environment } = args;

  // Check if we have any IDs to delete
  if (!Array.isArray(itemIds) || itemIds.length === 0) {
    return createErrorResponse("Error: No record IDs provided for deletion or itemIds is not an array.");
  }
  
  // Check maximum number of records (similar to bulk publish)
  if (itemIds.length > 200) {
    return createErrorResponse("Error: Maximum of 200 records allowed per bulk delete request.");
  }

  try {
    // Initialize DatoCMS client
    const client = getClient(apiToken, environment);
    
    try {
      // Format input for bulkDestroy with explicit type annotation
      // Format each ID into the required structure for the API
      const itemsToDelete = itemIds.map(id => ({ type: "item" as const, id }));
      
      // Execute bulk deletion
      await client.items.bulkDestroy({
        items: itemsToDelete,
      });
      
      // Return success response with count
      return createResponse(`Successfully deleted ${itemIds.length} record(s) with IDs: ${itemIds.join(", ")}`);
      
    } catch (apiError: unknown) {
      if (isAuthorizationError(apiError)) {
        return createErrorResponse("Error: Please provide a valid DatoCMS API token. The token you provided was rejected by the DatoCMS API.");
      }
      
      if (isNotFoundError(apiError)) {
        return createErrorResponse("Error: One or more records in the provided IDs were not found.");
      }
      
      // Re-throw other API errors to be caught by the outer catch
      throw apiError;
    }
  } catch (error: unknown) {
    return createErrorResponse(`Error bulk deleting DatoCMS records: ${extractDetailedErrorInfo(error)}`);
  }
};
