/**
 * @file listMenuItemsHandler.ts
 * @description Handler for listing DatoCMS menu items
 */

import type { z } from "zod";
import { UnifiedClientManager } from "../../../../../utils/unifiedClientManager.js";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { isAuthorizationError, createErrorResponse, extractDetailedErrorInfo } from "../../../../../utils/errorHandlers.js";
import type { menuItemSchemas } from "../../schemas.js";
import { createTypedUIClient } from "../../../uiClient.js";
import { ListMenuItemsResponse, isUIAuthorizationError } from "../../../uiTypes.js";

/**
 * Handler function for listing DatoCMS menu items
 */
export const listMenuItemsHandler = async (args: z.infer<typeof menuItemSchemas.list>): Promise<ListMenuItemsResponse> => {
  const { apiToken, page = { limit: 100, offset: 0 }, environment } = args;
  
  try {
    // Initialize DatoCMS client
    const client = UnifiedClientManager.getDefaultClient(apiToken, environment);
    const typedClient = createTypedUIClient(client);
    
    try {
      // Get the list of menu items using typed client
      const menuItems = await typedClient.listMenuItems(page);
      
      // Return success response
      return {
        success: true,
        data: menuItems
      };
      
    } catch (apiError: unknown) {
      if (isUIAuthorizationError(apiError)) {
        return {
          success: false,
          error: "Error: Please provide a valid DatoCMS API token. The token you provided was rejected by the DatoCMS API."
        };
      }
      
      // Re-throw other API errors to be caught by the outer catch
      throw apiError;
    }
  } catch (error: unknown) {
    return {
      success: false,
      error: `Error listing DatoCMS menu items: ${extractDetailedErrorInfo(error)}`
    };
  }
};