/**
 * @file getRecordByIdHandler.ts
 * @description Handler for retrieving a specific DatoCMS record by ID
 * Extracted from the GetDatoCMSRecordById tool
 */

import type { z } from "zod";
import { createResponse } from "../../../../utils/responseHandlers.js";
import { isAuthorizationError, isNotFoundError, createErrorResponse , extractDetailedErrorInfo } from "../../../../utils/errorHandlers.js";
import { returnMostPopulatedLocale } from "../../../../utils/returnMostPopulatedLocale.js";
import { getClient } from "../../../../utils/clientManager.js";
import type { recordsSchemas } from "../../schemas.js";

/**
 * Handler to retrieve a specific DatoCMS record by its ID
 */
export const getRecordByIdHandler = async (args: z.infer<typeof recordsSchemas.get>) => {
  const { apiToken, itemId, version = "published", returnAllLocales = false, nested = true, environment } = args;
  
  try {
    // Initialize DatoCMS client
    const client = getClient(apiToken, environment);
    
    try {
      // Prepare query parameters
      const queryParams: Record<string, unknown> = {
        version,
        nested
      };
    
      // Retrieve the item
      const item = await client.items.find(itemId, queryParams);
      
      // If no item found, return error
      if (!item) {
        return createErrorResponse(`Error: Record with ID '${itemId}' was not found.`);
      }

      // Process the item to filter locales (saves on tokens) unless returnAllLocales is true
      const processedItem = returnMostPopulatedLocale(item, returnAllLocales);

      // Return data in all locales if requested, which helps understand
      // the structure of localized fields for later updates
      const serializedRecord = JSON.stringify(processedItem, null, 2);

      if (returnAllLocales) {
        // Add a note about localized fields if they exist in the record
        const hasLocalizedFields = serializedRecord.includes('{"en":') ||
                                  serializedRecord.includes('{"it":') ||
                                  serializedRecord.includes('"localized":true');

        if (hasLocalizedFields) {
          return createResponse(`${serializedRecord}

NOTE: This record contains localized fields (shown as objects with locale keys like { "en": "value", "it": "value" }).
When updating these fields, you MUST include values for ALL locales that should be preserved, not just the ones you're updating.`);
        }
      }

      // Convert to JSON and create response (will be chunked only if necessary)
      return createResponse(serializedRecord);
      
    } catch (apiError: unknown) {
      if (isAuthorizationError(apiError)) {
        return createErrorResponse("Error: Please provide a valid DatoCMS API token. The token you provided was rejected by the DatoCMS API.");
      }
      
      // Check if it's a not found error
      if (isNotFoundError(apiError)) {
        return createErrorResponse(`Error: Record with ID '${itemId}' was not found.`);
      }
      
      // Re-throw other API errors to be caught by the outer catch
      throw apiError;
    }
  } catch (error: unknown) {
    return createErrorResponse(`Error retrieving DatoCMS record: ${extractDetailedErrorInfo(error)}`);
  }
};
