/**
 * @file retrieveMenuItemHandler.ts
 * @description Handler for retrieving a single DatoCMS menu item
 */

import type { z } from "zod";
import { buildClient } from "@datocms/cma-client-node";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { isAuthorizationError, isNotFoundError, createErrorResponse , extractDetailedErrorInfo } from "../../../../../utils/errorHandlers.js";
import type { menuItemSchemas } from "../../schemas.js";

/**
 * Handler function for retrieving a single DatoCMS menu item
 */
export const retrieveMenuItemHandler = async (args: z.infer<typeof menuItemSchemas.retrieve>) => {
  const { apiToken, menuItemId, environment } = args;
  
  try {
    // Initialize DatoCMS client
    const clientParameters = environment ? { apiToken, environment } : { apiToken };
    const client = buildClient(clientParameters);
    
    try {
      // Get the menu item
      const menuItem = await client.menuItems.find(menuItemId);
      
      // If no item returned, return error
      if (!menuItem) {
        return createErrorResponse(`Error: Menu item with ID '${menuItemId}' was not found.`);
      }

      // Return the menu item
      return createResponse(JSON.stringify(menuItem, null, 2));
      
    } catch (apiError: unknown) {
      if (isAuthorizationError(apiError)) {
        return createErrorResponse("Error: Please provide a valid DatoCMS API token. The token you provided was rejected by the DatoCMS API.");
      }
      
      if (isNotFoundError(apiError)) {
        return createErrorResponse(`Error: Menu item with ID '${menuItemId}' was not found.`);
      }
      
      // Re-throw other API errors to be caught by the outer catch
      throw apiError;
    }
  } catch (error: unknown) {
    return createErrorResponse(`Error retrieving DatoCMS menu item: ${extractDetailedErrorInfo(error)}`);
  }
};