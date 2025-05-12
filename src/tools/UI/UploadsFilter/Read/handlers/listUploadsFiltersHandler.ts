/**
 * @file listUploadsFiltersHandler.ts
 * @description Handler for listing DatoCMS uploads filters
 */

import type { z } from "zod";
import { buildClient } from "@datocms/cma-client-node";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { isAuthorizationError, createErrorResponse } from "../../../../../utils/errorHandlers.js";
import type { uploadsFilterSchemas } from "../../schemas.js";

/**
 * Handler function for listing DatoCMS uploads filters
 */
export const listUploadsFiltersHandler = async (args: z.infer<typeof uploadsFilterSchemas.list>) => {
  const { apiToken, page = { limit: 100, offset: 0 }, environment } = args;
  
  try {
    // Initialize DatoCMS client
    const clientParameters = environment ? { apiToken, environment } : { apiToken };
    const client = buildClient(clientParameters);
    
    try {
      // Get the list of uploads filters
      const uploadsFilters = await client.uploadFilters.list();
      
      // Return the list of uploads filters
      return createResponse(JSON.stringify(uploadsFilters, null, 2));
      
    } catch (apiError: unknown) {
      if (isAuthorizationError(apiError)) {
        return createErrorResponse("Error: Please provide a valid DatoCMS API token. The token you provided was rejected by the DatoCMS API.");
      }
      
      // Re-throw other API errors to be caught by the outer catch
      throw apiError;
    }
  } catch (error: unknown) {
    return createErrorResponse(`Error listing DatoCMS uploads filters: ${error instanceof Error ? error.message : String(error)}`);
  }
};
