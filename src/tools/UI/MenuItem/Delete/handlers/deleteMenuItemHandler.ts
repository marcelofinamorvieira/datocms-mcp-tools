/**
 * @file deleteMenuItemHandler.ts
 * @description Handler for deleting a DatoCMS menu item
 */

import type { z } from "zod";
import { getClient } from "../../../../../utils/clientManager.js";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { isAuthorizationError, isNotFoundError, createErrorResponse , extractDetailedErrorInfo } from "../../../../../utils/errorHandlers.js";
import type { menuItemSchemas } from "../../schemas.js";

/**
 * Handler function for deleting a DatoCMS menu item
 */
export const deleteMenuItemHandler = async (args: z.infer<typeof menuItemSchemas.delete>) => {
  const { apiToken, menuItemId, force = false, environment } = args;
  
  try {
    // Initialize DatoCMS client
    const client = getClient(apiToken, environment);
    
    try {
      // Delete the menu item
      await client.menuItems.destroy(menuItemId);
      
      // Return success message
      return createResponse(JSON.stringify({ 
        success: true, 
        message: `Successfully deleted menu item with ID: ${menuItemId}` 
      }, null, 2));
      
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
    // Check if the error is related to having child menu items
    const errorMessage = extractDetailedErrorInfo(error);
    
    if (errorMessage.includes("has children")) {
      return createErrorResponse(`Error: Cannot delete menu item with ID '${menuItemId}' because it has children. Set 'force' to true to delete it along with all its children.`);
    }
    
    return createErrorResponse(`${extractDetailedErrorInfo(errorMessage)}`);
  }
};