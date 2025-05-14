/**
 * @file getItemTypeHandler.ts
 * @description Handler for retrieving a specific DatoCMS Item Type by ID
 */

import type { z } from "zod";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { isAuthorizationError, isNotFoundError, createErrorResponse, extractDetailedErrorInfo } from "../../../../../utils/errorHandlers.js";
import type { schemaSchemas } from "../../../schemas.js";
import { createSchemaClient } from "../../../schemaClient.js";
import { isDatoCMSAuthorizationError, isDatoCMSNotFoundError, ItemType } from "../../../schemaTypes.js";

/**
 * Response type for the getItemType handler
 */
export interface GetItemTypeResponse {
  success: boolean;
  data?: ItemType;
  message?: string;
  error?: string;
}

/**
 * Handler to retrieve a specific Item Type by ID
 * 
 * @param args - The arguments containing apiToken, itemTypeId, and optionally environment
 * @returns A response containing the item type or an error message
 */
export const getItemTypeHandler = async (
  args: z.infer<typeof schemaSchemas.get_item_type>
): Promise<GetItemTypeResponse> => {
  const { apiToken, itemTypeId, environment } = args;
  
  try {
    // Initialize DatoCMS typed client
    const schemaClient = createSchemaClient(apiToken, environment);
    
    try {
      // Retrieve the item type using the typed client
      const itemType = await schemaClient.findItemType(itemTypeId);
      
      // Add special note if the model has all_locales_required flag
      if (itemType.all_locales_required) {
        return {
          success: true,
          data: itemType,
          message: "NOTE: This model requires all locales to be present for localized fields. When creating or updating records, you must provide values for all configured locales in every localized field. Check the model's fields to see which ones are localized."
        };
      }

      // Return the item type data
      return {
        success: true,
        data: itemType
      };
      
    } catch (apiError: unknown) {
      if (isDatoCMSAuthorizationError(apiError) || isAuthorizationError(apiError)) {
        return {
          success: false,
          error: "Error: Please provide a valid DatoCMS API token. The token you provided was rejected by the DatoCMS API."
        };
      }
      
      // Check if it's a not found error
      if (isDatoCMSNotFoundError(apiError) || isNotFoundError(apiError)) {
        return {
          success: false,
          error: `Error: Item Type with ID '${itemTypeId}' was not found.`
        };
      }
      
      // Re-throw other API errors to be caught by the outer catch
      throw apiError;
    }
  } catch (error: unknown) {
    return {
      success: false,
      error: `Error retrieving DatoCMS Item Type: ${extractDetailedErrorInfo(error)}`
    };
  }
};