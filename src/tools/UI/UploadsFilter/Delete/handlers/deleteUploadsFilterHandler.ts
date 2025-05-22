/**
 * @file deleteUploadsFilterHandler.ts
 * @description Handler for deleting a DatoCMS uploads filter
 */

import type { z } from "zod";
import { UnifiedClientManager } from "../../../../../utils/unifiedClientManager.js";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { isAuthorizationError, isNotFoundError, createErrorResponse , extractDetailedErrorInfo } from "../../../../../utils/errorHandlers.js";
import type { uploadsFilterSchemas } from "../../schemas.js";

/**
 * Handler function for deleting a DatoCMS uploads filter
 */
export const deleteUploadsFilterHandler = async (args: z.infer<typeof uploadsFilterSchemas.delete>) => {
  const { apiToken, uploadsFilterId, environment } = args;
  
  try {
    // Initialize DatoCMS client
    const client = UnifiedClientManager.getDefaultClient(apiToken, environment);
    
    try {
      // Delete the uploads filter
      await client.uploadFilters.destroy(uploadsFilterId);
      
      // Return success message
      return createResponse(JSON.stringify({ 
        success: true, 
        message: `Successfully deleted uploads filter with ID: ${uploadsFilterId}` 
      }, null, 2));
      
    } catch (apiError: unknown) {
      if (isAuthorizationError(apiError)) {
        return createErrorResponse("Error: Please provide a valid DatoCMS API token. The token you provided was rejected by the DatoCMS API.");
      }
      
      if (isNotFoundError(apiError)) {
        return createErrorResponse(`Error: Uploads filter with ID '${uploadsFilterId}' was not found.`);
      }
      
      // Re-throw other API errors to be caught by the outer catch
      throw apiError;
    }
  } catch (error: unknown) {
    return createErrorResponse(`Error deleting DatoCMS uploads filter: ${extractDetailedErrorInfo(error)}`);
  }
};