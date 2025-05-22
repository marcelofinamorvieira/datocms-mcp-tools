/**
 * @file createMenuItemHandler.ts
 * @description Handler for creating a DatoCMS menu item
 */

import type { z } from "zod";
import { UnifiedClientManager } from "../../../../../utils/unifiedClientManager.js";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { isAuthorizationError, isNotFoundError, createErrorResponse, extractDetailedErrorInfo } from "../../../../../utils/errorHandlers.js";
import type { menuItemSchemas } from "../../schemas.js";
import { createTypedUIClient } from "../../../uiClient.js";
import { CreateMenuItemResponse, MenuItemCreateParams, isUIAuthorizationError, isUIValidationError } from "../../../uiTypes.js";

/**
 * Handler function for creating a DatoCMS menu item
 */
export const createMenuItemHandler = async (args: z.infer<typeof menuItemSchemas.create>): Promise<CreateMenuItemResponse> => {
  const { 
    apiToken, 
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
    const typedClient = createTypedUIClient(client);
    
    try {
      // Create menu item payload with proper typing
      const payload: MenuItemCreateParams = {
        label
      };

      // Add optional fields if they are defined
      if (position !== undefined) payload.position = position;
      if (external_url !== undefined) payload.external_url = external_url;
      if (open_in_new_tab !== undefined) payload.open_in_new_tab = open_in_new_tab;
      if (parent_id !== undefined) payload.parent_id = parent_id;
      if (item_type_id !== undefined) payload.item_type_id = item_type_id;
      if (item_type_filter_id !== undefined) payload.item_type_filter_id = item_type_filter_id;
      
      // Create the menu item using typed client
      const createdMenuItem = await typedClient.createMenuItem(payload);
      
      // Return success response
      return {
        success: true,
        data: createdMenuItem,
        message: "Menu item created successfully"
      };
      
    } catch (apiError: unknown) {
      if (isUIAuthorizationError(apiError)) {
        return {
          success: false,
          error: "Error: Please provide a valid DatoCMS API token. The token you provided was rejected by the DatoCMS API."
        };
      }
      
      if (isUIValidationError(apiError)) {
        return {
          success: false,
          error: "Validation failed",
          validationErrors: apiError.validationErrors
        };
      }
      
      // Re-throw other API errors to be caught by the outer catch
      throw apiError;
    }
  } catch (error: unknown) {
    return {
      success: false,
      error: `Error creating DatoCMS menu item: ${extractDetailedErrorInfo(error)}`
    };
  }
};