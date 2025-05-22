/**
 * @file cancelScheduledUnpublicationHandler.ts
 * @description Handler for canceling a scheduled unpublication for a DatoCMS record
 * Extracted from the DestroyScheduledUnpublicationOnRecord tool
 */

import type { z } from "zod";
import { UnifiedClientManager } from "../../../../utils/unifiedClientManager.js";
import { isAuthorizationError, isNotFoundError, createErrorResponse , extractDetailedErrorInfo } from "../../../../utils/errorHandlers.js";
import { createResponse } from "../../../../utils/responseHandlers.js";
import type { recordsSchemas } from "../../schemas.js";

/**
 * Handler function for canceling a scheduled unpublication for a DatoCMS record
 */
export const cancelScheduledUnpublicationHandler = async (args: z.infer<typeof recordsSchemas.cancel_scheduled_unpublication>) => {
  const { apiToken, itemId, environment } = args;
  
  try {
    // Initialize DatoCMS client
    const client = UnifiedClientManager.getDefaultClient(apiToken, environment);
    
    try {
      // Cancel the scheduled unpublication
      await client.scheduledUnpublishing.destroy(itemId);
      
      // Return success response
      return createResponse(`Successfully cancelled scheduled unpublication for item with ID '${itemId}'.`);
      
    } catch (apiError: unknown) {
      if (isAuthorizationError(apiError)) {
        return createErrorResponse("Error: Please provide a valid DatoCMS API token. The token you provided was rejected by the DatoCMS API.");
      }
      
      // Check if it's a not found error
      if (isNotFoundError(apiError)) {
        return createErrorResponse(`Error: Item with ID '${itemId}' was not found or has no scheduled unpublication.`);
      }
      
      // Re-throw other API errors to be caught by the outer catch
      throw apiError;
    }
  } catch (error: unknown) {
    return {
      content: [{
        type: "text" as const,
        text: `Error cancelling scheduled unpublication: ${extractDetailedErrorInfo(error)}`
      }]
    };
  }
};
