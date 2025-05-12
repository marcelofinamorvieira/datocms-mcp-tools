/**
 * @file updateRecordHandler.ts
 * @description Handler for updating an existing DatoCMS record
 */

import type { z } from "zod";
import { buildClient } from "@datocms/cma-client-node";
import { createResponse } from "../../../../utils/responseHandlers.js";
import { isAuthorizationError, isNotFoundError, createErrorResponse } from "../../../../utils/errorHandlers.js";
import type { recordsSchemas } from "../../schemas.js";

/**
 * Handler function for updating an existing DatoCMS record
 */
export const updateRecordHandler = async (args: z.infer<typeof recordsSchemas.update>) => {
  const { 
    apiToken,
    itemId,
    data,
    version,
    returnOnlyConfirmation = false,
    environment
  } = args;
  
  try {
    // Initialize DatoCMS client
    const clientParameters = environment ? { apiToken, environment } : { apiToken };
    const client = buildClient(clientParameters);
    
    try {
      // Prepare update parameters
      const updateParams: Record<string, any> = { ...data };
      
      // Add version if provided (for optimistic locking)
      if (version !== undefined) {
        updateParams.meta = { ...(updateParams.meta || {}), current_version: version };
      }
      
      // Update the item
      const updatedItem = await client.items.update(itemId, updateParams);
      
      // If no item returned, return error
      if (!updatedItem) {
        return createErrorResponse(`Error: Failed to update record with ID '${itemId}'.`);
      }

      // Return only confirmation message if requested (to save on tokens)
      if (returnOnlyConfirmation) {
        return createResponse(`Successfully updated record with ID '${itemId}'.`);
      }

      // Otherwise return the full record data
      return createResponse(JSON.stringify(updatedItem, null, 2));
      
    } catch (apiError: unknown) {
      if (isAuthorizationError(apiError)) {
        return createErrorResponse("Error: Please provide a valid DatoCMS API token. The token you provided was rejected by the DatoCMS API.");
      }
      
      if (isNotFoundError(apiError)) {
        return createErrorResponse(`Error: Record with ID '${itemId}' was not found.`);
      }
      
      // Check for version conflict errors
      const errorMessage = apiError instanceof Error ? apiError.message : String(apiError);
      if (errorMessage.includes("version") && errorMessage.includes("conflict")) {
        return createErrorResponse(`Error: Version conflict detected. The record has been modified since you retrieved it. Please fetch the latest version and try again.`);
      }
      
      // Format API errors for better understanding
      if (errorMessage.includes("Validation failed")) {
        return createErrorResponse(`Validation error updating DatoCMS record: ${errorMessage}. 
        
Please check that your field values match the required format for each field type. Refer to the DatoCMS API documentation for field type requirements: https://www.datocms.com/docs/content-management-api/resources/item/update#updating-fields`);
      }
      
      // Re-throw other API errors to be caught by the outer catch
      throw apiError;
    }
  } catch (error: unknown) {
    return createErrorResponse(`Error updating DatoCMS record: ${error instanceof Error ? error.message : String(error)}`);
  }
};