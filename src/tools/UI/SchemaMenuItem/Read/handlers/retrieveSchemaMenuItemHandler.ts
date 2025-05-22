/**
 * @file retrieveSchemaMenuItemHandler.ts
 * @description Handler for retrieving a single DatoCMS schema menu item
 */

import type { z } from "zod";
import { UnifiedClientManager } from "../../../../../utils/unifiedClientManager.js";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { isAuthorizationError, isNotFoundError, createErrorResponse , extractDetailedErrorInfo } from "../../../../../utils/errorHandlers.js";
import type { schemaMenuItemSchemas } from "../../schemas.js";

/**
 * Handler function for retrieving a single DatoCMS schema menu item
 */
export const retrieveSchemaMenuItemHandler = async (args: z.infer<typeof schemaMenuItemSchemas.retrieve>) => {
  const { apiToken, schemaMenuItemId, environment } = args;
  
  try {
    // Initialize DatoCMS client
    const client = UnifiedClientManager.getDefaultClient(apiToken, environment);
    
    try {
      // Get the schema menu item
      const schemaMenuItem = await client.schemaMenuItems.find(schemaMenuItemId);
      
      // If no item returned, return error
      if (!schemaMenuItem) {
        return createErrorResponse(`Error: Schema menu item with ID '${schemaMenuItemId}' was not found.`);
      }

      // Return the schema menu item
      return createResponse(JSON.stringify(schemaMenuItem, null, 2));
      
    } catch (apiError: unknown) {
      if (isAuthorizationError(apiError)) {
        return createErrorResponse("Error: Please provide a valid DatoCMS API token. The token you provided was rejected by the DatoCMS API.");
      }
      
      if (isNotFoundError(apiError)) {
        return createErrorResponse(`Error: Schema menu item with ID '${schemaMenuItemId}' was not found.`);
      }
      
      // Re-throw other API errors to be caught by the outer catch
      throw apiError;
    }
  } catch (error: unknown) {
    return createErrorResponse(`Error retrieving DatoCMS schema menu item: ${extractDetailedErrorInfo(error)}`);
  }
};
