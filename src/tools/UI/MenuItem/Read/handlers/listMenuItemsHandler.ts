/**
 * @file listMenuItemsHandler.ts
 * @description Handler for listing DatoCMS menu items
 */

import type { z } from "zod";
import { buildClient } from "@datocms/cma-client-node";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { isAuthorizationError, createErrorResponse } from "../../../../../utils/errorHandlers.js";
import type { menuItemSchemas } from "../../schemas.js";

/**
 * Handler function for listing DatoCMS menu items
 */
export const listMenuItemsHandler = async (args: z.infer<typeof menuItemSchemas.list>) => {
  const { apiToken, page = { limit: 100, offset: 0 }, environment } = args;
  
  try {
    // Initialize DatoCMS client
    const clientParameters = environment ? { apiToken, environment } : { apiToken };
    const client = buildClient(clientParameters);
    
    try {
      // Get the list of menu items
      const menuItems = await client.menuItems.list({
        page: {
          limit: page?.limit ?? 100,
          offset: page?.offset ?? 0
        }
      });
      
      // Return the list of menu items
      return createResponse(JSON.stringify(menuItems, null, 2));
      
    } catch (apiError: unknown) {
      if (isAuthorizationError(apiError)) {
        return createErrorResponse("Error: Please provide a valid DatoCMS API token. The token you provided was rejected by the DatoCMS API.");
      }
      
      // Re-throw other API errors to be caught by the outer catch
      throw apiError;
    }
  } catch (error: unknown) {
    return createErrorResponse(`Error listing DatoCMS menu items: ${error instanceof Error ? error.message : String(error)}`);
  }
};