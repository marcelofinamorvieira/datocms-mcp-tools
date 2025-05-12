/**
 * @file createUploadsFilterHandler.ts
 * @description Handler for creating a DatoCMS uploads filter
 */

import type { z } from "zod";
import { buildClient } from "@datocms/cma-client-node";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { isAuthorizationError, isNotFoundError, createErrorResponse , extractDetailedErrorInfo } from "../../../../../utils/errorHandlers.js";
import type { uploadsFilterSchemas } from "../../schemas.js";

/**
 * Handler function for creating a DatoCMS uploads filter
 */
export const createUploadsFilterHandler = async (args: z.infer<typeof uploadsFilterSchemas.create>) => {
  const { 
    apiToken, 
    name,
    payload,
    environment 
  } = args;
  
  try {
    // Initialize DatoCMS client
    const clientParameters = environment ? { apiToken, environment } : { apiToken };
    const client = buildClient(clientParameters);
    
    try {
      // Create uploads filter payload
      const filterPayload = {
        name,
        filter: payload,
        shared: true
      };

      // Create the uploads filter
      const createdUploadsFilter = await client.uploadFilters.create(filterPayload as any);
      
      // If no filter returned, return error
      if (!createdUploadsFilter) {
        return createErrorResponse("Error: Failed to create uploads filter.");
      }

      // Return the created uploads filter
      return createResponse(JSON.stringify(createdUploadsFilter, null, 2));
      
    } catch (apiError: unknown) {
      if (isAuthorizationError(apiError)) {
        return createErrorResponse("Error: Please provide a valid DatoCMS API token. The token you provided was rejected by the DatoCMS API.");
      }
      
      // Re-throw other API errors to be caught by the outer catch
      throw apiError;
    }
  } catch (error: unknown) {
    return createErrorResponse(`Error creating DatoCMS uploads filter: ${extractDetailedErrorInfo(error)}`);
  }
};