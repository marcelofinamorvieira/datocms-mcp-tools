/**
 * @file retrieveMenuItemHandler.ts
 * @description Handler for retrieving a single DatoCMS menu item
 */

import type { z } from "zod";
import { UnifiedClientManager } from "../../../../../utils/unifiedClientManager.js";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { isAuthorizationError, isNotFoundError, createErrorResponse, extractDetailedErrorInfo } from "../../../../../utils/errorHandlers.js";
import type { menuItemSchemas } from "../../schemas.js";
import { createTypedUIClient } from "../../../uiClient.js";
import { GetMenuItemResponse, isUIAuthorizationError, isUINotFoundError } from "../../../uiTypes.js";

/**
 * Handler function for retrieving a single DatoCMS menu item
 */
export const retrieveMenuItemHandler = async (args: z.infer<typeof menuItemSchemas.retrieve>): Promise<GetMenuItemResponse> => {
  const { apiToken, menuItemId, environment } = args;
  
  try {
    // Initialize DatoCMS client
    const client = UnifiedClientManager.getDefaultClient(apiToken, environment);
    const typedClient = createTypedUIClient(client);
    
    try {
      // Get the menu item using typed client
      const menuItem = await typedClient.findMenuItem(menuItemId);
      
      // Return success response
      return {
        success: true,
        data: menuItem
      };
      
    } catch (apiError: unknown) {
      if (isUIAuthorizationError(apiError)) {
        return {
          success: false,
          error: "Error: Please provide a valid DatoCMS API token. The token you provided was rejected by the DatoCMS API."
        };
      }
      
      if (isUINotFoundError(apiError)) {
        return {
          success: false,
          error: `Error: Menu item with ID '${menuItemId}' was not found.`
        };
      }
      
      // Re-throw other API errors to be caught by the outer catch
      throw apiError;
    }
  } catch (error: unknown) {
    return {
      success: false,
      error: `Error retrieving DatoCMS menu item: ${extractDetailedErrorInfo(error)}`
    };
  }
};