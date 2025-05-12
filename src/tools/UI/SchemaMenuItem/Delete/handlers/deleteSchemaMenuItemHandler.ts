/**
 * @file deleteSchemaMenuItemHandler.ts
 * @description Handler for deleting a DatoCMS schema menu item
 */

import type { z } from "zod";
import { buildClient } from "@datocms/cma-client-node";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { isAuthorizationError, isNotFoundError, createErrorResponse , extractDetailedErrorInfo } from "../../../../../utils/errorHandlers.js";
import type { schemaMenuItemSchemas } from "../../schemas.js";

/**
 * Handler function for deleting a DatoCMS schema menu item
 */
export const deleteSchemaMenuItemHandler = async (args: z.infer<typeof schemaMenuItemSchemas.delete>) => {
  const { apiToken, schemaMenuItemId, environment } = args;
  
  try {
    // Initialize DatoCMS client
    const clientParameters = environment ? { apiToken, environment } : { apiToken };
    const client = buildClient(clientParameters);
    
    try {
      // Delete the schema menu item
      await client.schemaMenuItems.destroy(schemaMenuItemId);
      
      // Return success message
      return createResponse(JSON.stringify({ 
        success: true, 
        message: `Successfully deleted schema menu item with ID: ${schemaMenuItemId}` 
      }, null, 2));
      
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
    // Check if the error is related to having child menu items
    const errorMessage = extractDetailedErrorInfo(error);
    
    if (errorMessage.includes("has children")) {
      return createErrorResponse(`Error: Cannot delete schema menu item with ID '${schemaMenuItemId}' because it has children.`);
    }
    
    return createErrorResponse(`${extractDetailedErrorInfo(errorMessage)}`);
  }
};