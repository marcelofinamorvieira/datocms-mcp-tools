/**
 * @file updateMenuItemHandler.ts
 * @description Handler for updating a DatoCMS menu item
 */

import type { z } from "zod";
import { UnifiedClientManager } from "../../../../../utils/unifiedClientManager.js";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { isAuthorizationError, isNotFoundError, createErrorResponse , extractDetailedErrorInfo } from "../../../../../utils/errorHandlers.js";
import type { menuItemSchemas } from "../../schemas.js";

/**
 * Handler function for updating a DatoCMS menu item
 */
export const updateMenuItemHandler = async (args: z.infer<typeof menuItemSchemas.update>) => {
  const { 
    apiToken, 
    menuItemId,
    label, 
    position, 
    external_url, 
    open_in_new_tab, 
    parent_id, 
    item_type_id, 
    item_type_filter_id,
    environment 
  } = args;
  
  try {
    // Initialize DatoCMS client
    const client = UnifiedClientManager.getDefaultClient(apiToken, environment);
    
    try {
      // Create menu item update payload (only including defined fields)
      const payload: Record<string, any> = {};

      // Add fields only if they are defined
      if (label !== undefined) payload.label = label;
      if (position !== undefined) payload.position = position;
      if (external_url !== undefined) payload.external_url = external_url;
      if (open_in_new_tab !== undefined) payload.open_in_new_tab = open_in_new_tab;
      if (parent_id !== undefined) payload.parent_id = parent_id;
      if (item_type_id !== undefined) payload.item_type_id = item_type_id;
      if (item_type_filter_id !== undefined) payload.item_type_filter_id = item_type_filter_id;
      
      // Update the menu item
      const updatedMenuItem = await client.menuItems.update(menuItemId, payload);
      
      // If no item returned, return error
      if (!updatedMenuItem) {
        return createErrorResponse(`Error: Failed to update menu item with ID '${menuItemId}'.`);
      }

      // Return the updated menu item
      return createResponse(JSON.stringify(updatedMenuItem, null, 2));
      
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
    return createErrorResponse(`Error updating DatoCMS menu item: ${extractDetailedErrorInfo(error)}`);
  }
};