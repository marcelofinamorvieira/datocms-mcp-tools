/**
 * @file deleteItemTypeHandlerV2.ts
 * @description Handler for deleting DatoCMS Item Types, using the handler factory pattern
 */

import { z } from "zod";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { UnifiedClientManager } from "../../../../../utils/unifiedClientManager.js";
import { isAuthorizationError, isNotFoundError, createErrorResponse, extractDetailedErrorInfo } from "../../../../../utils/errorHandlers.js";

import { schemaSchemas } from "../../../schemas.js";

/**
 * Handler to delete an Item Type from DatoCMS
 * This implementation uses a simplified approach to avoid TypeScript issues
 */
export const deleteItemTypeHandler = async (args: z.infer<typeof schemaSchemas.delete_item_type>) => {
  try {
    const { apiToken, itemTypeId, environment } = args;
    
    // Initialize DatoCMS client
    const client = UnifiedClientManager.getDefaultClient(apiToken as string, environment as string);
    
    try {
      // Delete the item type
      await client.itemTypes.destroy(itemTypeId as string);
      
      // Return success response
      return createResponse(JSON.stringify({
        success: true,
        message: `Item Type ${itemTypeId} was successfully deleted.`
      }, null, 2));
      
    } catch (apiError: unknown) {
      if (isAuthorizationError(apiError)) {
        return createErrorResponse("Error: Please provide a valid DatoCMS API token. The token you provided was rejected by the DatoCMS API.");
      }
      
      if (isNotFoundError(apiError)) {
        return createErrorResponse(`Error: Item Type with ID '${itemTypeId}' was not found.`);
      }
      
      // Re-throw other API errors to be caught by the outer catch
      throw apiError;
    }
  } catch (error: unknown) {
    return createErrorResponse(`Error deleting DatoCMS Item Type: ${extractDetailedErrorInfo(error)}`);
  }
};