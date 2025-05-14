/**
 * @file getItemTypeHandler.ts
 * @description Handler for retrieving a specific DatoCMS Item Type by ID
 */

import type { z } from "zod";
import { getClient } from "../../../../../utils/clientManager.js";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { isAuthorizationError, isNotFoundError, createErrorResponse , extractDetailedErrorInfo } from "../../../../../utils/errorHandlers.js";
import type { schemaSchemas } from "../../../schemas.js";

/**
 * Handler to retrieve a specific Item Type by ID
 */
export const getItemTypeHandler = async (args: z.infer<typeof schemaSchemas.get_item_type>) => {
  const { apiToken, itemTypeId, environment } = args;
  
  try {
    // Initialize DatoCMS client
    const client = getClient(apiToken, environment);
    
    try {
      // Retrieve the item type
      const itemType = await client.itemTypes.find(itemTypeId);
      
      // Add special note if the model has all_locales_required flag
      const serializedItemType = JSON.stringify(itemType, null, 2);
      if (itemType.all_locales_required) {
        return createResponse(`${serializedItemType}

NOTE: This model requires all locales to be present for localized fields. When creating or updating records, you must provide values for all configured locales in every localized field. Check the model's fields to see which ones are localized.`);
      }

      // Return the item type data
      return createResponse(serializedItemType);
      
    } catch (apiError: unknown) {
      if (isAuthorizationError(apiError)) {
        return createErrorResponse("Error: Please provide a valid DatoCMS API token. The token you provided was rejected by the DatoCMS API.");
      }
      
      // Check if it's a not found error
      if (isNotFoundError(apiError)) {
        return createErrorResponse(`Error: Item Type with ID '${itemTypeId}' was not found.`);
      }
      
      // Re-throw other API errors to be caught by the outer catch
      throw apiError;
    }
  } catch (error: unknown) {
    return createErrorResponse(`Error retrieving DatoCMS Item Type: ${extractDetailedErrorInfo(error)}`);
  }
};