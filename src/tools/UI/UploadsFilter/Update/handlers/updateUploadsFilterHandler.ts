/**
 * @file updateUploadsFilterHandler.ts
 * @description Handler for updating a DatoCMS uploads filter
 */

import type { z } from "zod";
import { buildClient } from "@datocms/cma-client-node";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { isAuthorizationError, isNotFoundError, createErrorResponse } from "../../../../../utils/errorHandlers.js";
import type { uploadsFilterSchemas } from "../../schemas.js";

/**
 * Handler function for updating a DatoCMS uploads filter
 */
export const updateUploadsFilterHandler = async (args: z.infer<typeof uploadsFilterSchemas.update>) => {
  const { 
    apiToken, 
    uploadsFilterId,
    name, 
    payload,
    environment 
  } = args;
  
  try {
    // Initialize DatoCMS client
    const clientParameters = environment ? { apiToken, environment } : { apiToken };
    const client = buildClient(clientParameters);
    
    try {
      // Create uploads filter update payload (only including defined fields)
      const filterPayload: Record<string, any> = {};

      // Add fields only if they are defined
      if (name !== undefined) filterPayload.name = name;
      if (payload !== undefined) filterPayload.payload = payload;
      
      // Update the uploads filter
      const updatedUploadsFilter = await client.uploadFilters.update(uploadsFilterId, filterPayload);
      
      // If no filter returned, return error
      if (!updatedUploadsFilter) {
        return createErrorResponse(`Error: Failed to update uploads filter with ID '${uploadsFilterId}'.`);
      }

      // Return the updated uploads filter
      return createResponse(JSON.stringify(updatedUploadsFilter, null, 2));
      
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
    return createErrorResponse(`Error updating DatoCMS uploads filter: ${error instanceof Error ? error.message : String(error)}`);
  }
};