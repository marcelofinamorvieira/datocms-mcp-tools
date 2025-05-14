/**
 * @file listItemTypesHandler.ts
 * @description Handler for listing all item types in a DatoCMS project
 */

import type { z } from "zod";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { isAuthorizationError, createErrorResponse, extractDetailedErrorInfo } from "../../../../../utils/errorHandlers.js";
import type { schemaSchemas } from "../../../schemas.js";
import { createSchemaClient } from "../../../schemaClient.js";
import { isDatoCMSAuthorizationError, ItemType } from "../../../schemaTypes.js";

/**
 * Response type for the listItemTypes handler
 */
export interface ListItemTypesResponse {
  success: boolean;
  data?: ItemType[];
  totalCount?: number;
  pagination?: {
    offset: number;
    limit: number;
    totalPages: number;
    currentPage: number;
  };
  error?: string;
}

/**
 * Handler to list all Item Types in a DatoCMS project
 * 
 * @param args - The arguments containing apiToken, optional environment, and pagination parameters
 * @returns A response containing the list of item types or an error message
 */
export const listItemTypesHandler = async (
  args: z.infer<typeof schemaSchemas.list_item_types>
): Promise<ListItemTypesResponse> => {
  const { apiToken, environment, page } = args;
  
  try {
    // Initialize DatoCMS typed client
    const schemaClient = createSchemaClient(apiToken, environment);
    
    try {
      // Get pagination parameters with defaults
      const offset = page?.offset || 0;
      const limit = page?.limit || 10;
      
      // Retrieve all item types using the typed client
      const allItemTypes = await schemaClient.listItemTypes();

      // Apply pagination in memory
      const itemTypes = allItemTypes.slice(offset, offset + limit);
      const totalCount = allItemTypes.length;
      const totalPages = Math.ceil(totalCount / limit);
      
      // Return the item types with pagination information
      return {
        success: true,
        data: itemTypes,
        totalCount,
        pagination: {
          offset,
          limit,
          totalPages,
          currentPage: Math.floor(offset / limit) + 1
        }
      };
      
    } catch (apiError: unknown) {
      if (isDatoCMSAuthorizationError(apiError) || isAuthorizationError(apiError)) {
        return {
          success: false,
          error: "Error: Please provide a valid DatoCMS API token. The token you provided was rejected by the DatoCMS API."
        };
      }
      
      // Re-throw other API errors to be caught by the outer catch
      throw apiError;
    }
  } catch (error: unknown) {
    return {
      success: false,
      error: `Error listing DatoCMS Item Types: ${extractDetailedErrorInfo(error)}`
    };
  }
};