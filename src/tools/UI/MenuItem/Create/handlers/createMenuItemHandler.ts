/**
 * @file createMenuItemHandler.ts
 * @description Handler for creating a DatoCMS menu item
 */

import type { z } from "zod";
import { buildClient } from "@datocms/cma-client-node";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { isAuthorizationError, isNotFoundError, createErrorResponse , extractDetailedErrorInfo } from "../../../../../utils/errorHandlers.js";
import type { menuItemSchemas } from "../../schemas.js";

/**
 * Handler function for creating a DatoCMS menu item
 */
export const createMenuItemHandler = async (args: z.infer<typeof menuItemSchemas.create>) => {
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
    const clientParameters = environment ? { apiToken, environment } : { apiToken };
    const client = buildClient(clientParameters);
    
    try {
      // Create menu item payload
      const payload: Record<string, any> = {
        label
      };

      // Add optional fields if they are defined
      if (position !== undefined) payload.position = position;
      if (external_url !== undefined) payload.external_url = external_url;
      if (open_in_new_tab !== undefined) payload.open_in_new_tab = open_in_new_tab;
      if (parent_id !== undefined) payload.parent_id = parent_id;
      if (item_type_id !== undefined) payload.item_type_id = item_type_id;
      if (item_type_filter_id !== undefined) payload.item_type_filter_id = item_type_filter_id;
      
      // Create the menu item
      const createdMenuItem = await client.menuItems.create(payload as any);
      
      // If no item returned, return error
      if (!createdMenuItem) {
        return createErrorResponse("Error: Failed to create menu item.");
      }

      // Return the created menu item
      return createResponse(JSON.stringify(createdMenuItem, null, 2));
      
    } catch (apiError: unknown) {
      if (isAuthorizationError(apiError)) {
        return createErrorResponse("Error: Please provide a valid DatoCMS API token. The token you provided was rejected by the DatoCMS API.");
      }
      
      // Re-throw other API errors to be caught by the outer catch
      throw apiError;
    }
  } catch (error: unknown) {
    return createErrorResponse(`Error creating DatoCMS menu item: ${extractDetailedErrorInfo(error)}`);
  }
};