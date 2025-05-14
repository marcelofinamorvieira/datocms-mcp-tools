/**
 * @file listSchemaMenuItemsHandler.ts
 * @description Handler for listing DatoCMS schema menu items
 */

import type { z } from "zod";
import { getClient } from "../../../../../utils/clientManager.js";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { isAuthorizationError, createErrorResponse , extractDetailedErrorInfo } from "../../../../../utils/errorHandlers.js";
import type { schemaMenuItemSchemas } from "../../schemas.js";

/**
 * Handler function for listing DatoCMS schema menu items
 */
export const listSchemaMenuItemsHandler = async (args: z.infer<typeof schemaMenuItemSchemas.list>) => {
  const { apiToken, page = { limit: 100, offset: 0 }, environment } = args;
  
  try {
    // Initialize DatoCMS client
    const client = getClient(apiToken, environment);
    
    try {
      // Get the list of schema menu items
      const schemaMenuItems = await client.schemaMenuItems.list();
      
      // Return the list of schema menu items
      return createResponse(JSON.stringify(schemaMenuItems, null, 2));
      
    } catch (apiError: unknown) {
      if (isAuthorizationError(apiError)) {
        return createErrorResponse("Error: Please provide a valid DatoCMS API token. The token you provided was rejected by the DatoCMS API.");
      }
      
      // Re-throw other API errors to be caught by the outer catch
      throw apiError;
    }
  } catch (error: unknown) {
    return createErrorResponse(`Error listing DatoCMS schema menu items: ${extractDetailedErrorInfo(error)}`);
  }
};
