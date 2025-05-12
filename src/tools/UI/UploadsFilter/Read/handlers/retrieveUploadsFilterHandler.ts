/**
 * @file retrieveUploadsFilterHandler.ts
 * @description Handler for retrieving a single DatoCMS uploads filter
 */

import type { z } from "zod";
import { buildClient } from "@datocms/cma-client-node";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { isAuthorizationError, isNotFoundError, createErrorResponse } from "../../../../../utils/errorHandlers.js";
import type { uploadsFilterSchemas } from "../../schemas.js";

/**
 * Handler function for retrieving a single DatoCMS uploads filter
 */
export const retrieveUploadsFilterHandler = async (args: z.infer<typeof uploadsFilterSchemas.retrieve>) => {
  const { apiToken, uploadsFilterId, environment } = args;
  
  try {
    // Initialize DatoCMS client
    const clientParameters = environment ? { apiToken, environment } : { apiToken };
    const client = buildClient(clientParameters);
    
    try {
      // Get the uploads filter
      const uploadsFilter = await client.uploadFilters.find(uploadsFilterId);
      
      // If no filter returned, return error
      if (!uploadsFilter) {
        return createErrorResponse(`Error: Uploads filter with ID '${uploadsFilterId}' was not found.`);
      }

      // Return the uploads filter
      return createResponse(JSON.stringify(uploadsFilter, null, 2));
      
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
    return createErrorResponse(`Error retrieving DatoCMS uploads filter: ${error instanceof Error ? error.message : String(error)}`);
  }
};
