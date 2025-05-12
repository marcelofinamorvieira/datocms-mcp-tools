/**
 * @file createRecordHandler.ts
 * @description Handler for creating a new DatoCMS record
 */

import type { z } from "zod";
import { buildClient } from "@datocms/cma-client-node";
import { createResponse } from "../../../../utils/responseHandlers.js";
import { isAuthorizationError, isNotFoundError, createErrorResponse } from "../../../../utils/errorHandlers.js";
import type { recordsSchemas } from "../../schemas.js";

/**
 * Handler function for creating a new DatoCMS record
 */
export const createRecordHandler = async (args: z.infer<typeof recordsSchemas.create>) => {
  const { 
    apiToken, 
    itemType, 
    data, 
    returnOnlyConfirmation = false, 
    environment 
  } = args;
  
  try {
    // Initialize DatoCMS client
    const clientParameters = environment ? { apiToken, environment } : { apiToken };
    const client = buildClient(clientParameters);
    
    try {
      // Create the item
      const createdItem = await client.items.create({
        item_type: { 
          id: itemType, 
          type: "item_type" 
        },
        ...data
      });
      
      // If no item returned, return error
      if (!createdItem) {
        return createErrorResponse(`Error: Failed to create a new record of type '${itemType}'.`);
      }

      // Return only confirmation message if requested (to save on tokens)
      if (returnOnlyConfirmation) {
        return createResponse(`Successfully created record with ID '${createdItem.id}' of type '${itemType}'.`);
      }

      // Otherwise return the full record data
      return createResponse(JSON.stringify(createdItem, null, 2));
      
    } catch (apiError: unknown) {
      if (isAuthorizationError(apiError)) {
        return createErrorResponse("Error: Please provide a valid DatoCMS API token. The token you provided was rejected by the DatoCMS API.");
      }
      
      if (isNotFoundError(apiError)) {
        return createErrorResponse(`Error: Item type with ID '${itemType}' was not found.`);
      }
      
      // Format API errors for better understanding
      const errorMessage = apiError instanceof Error ? apiError.message : String(apiError);
      
      // Check for common validation errors
      if (errorMessage.includes("Validation failed")) {
        return createErrorResponse(`Validation error creating DatoCMS record: ${errorMessage}. 
        
Please check that your field values match the required format for each field type. Refer to the DatoCMS API documentation for field type requirements: https://www.datocms.com/docs/content-management-api/resources/item/create#field-type-values`);
      }
      
      // Re-throw other API errors to be caught by the outer catch
      throw apiError;
    }
  } catch (error: unknown) {
    return createErrorResponse(`Error creating DatoCMS record: ${error instanceof Error ? error.message : String(error)}`);
  }
};