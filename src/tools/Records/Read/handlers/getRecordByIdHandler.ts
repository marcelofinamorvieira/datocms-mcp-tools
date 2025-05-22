/**
 * @file getRecordByIdHandler.ts
 * @description Handler for retrieving a specific DatoCMS record by ID
 * Extracted from the GetDatoCMSRecordById tool
 */

import type { z } from "zod";
import { createResponse } from "../../../../utils/responseHandlers.js";
import { isAuthorizationError, isNotFoundError, createErrorResponse, extractDetailedErrorInfo } from "../../../../utils/errorHandlers.js";
import { returnMostPopulatedLocale } from "../../../../utils/returnMostPopulatedLocale.js";
import { UnifiedClientManager } from "../../../../utils/unifiedClientManager.js";
import type { recordsSchemas } from "../../schemas.js";
import type { Item, McpResponse } from "../../types.js";
import { isPublished, hasScheduledPublication, hasScheduledUnpublishing } from "../../advancedTypes.js";

/**
 * Handler to retrieve a specific DatoCMS record by its ID
 * 
 * @param args - Parameters for getting a record by ID
 * @returns A formatted response with the record data or error message
 */
export const getRecordByIdHandler = async (args: z.infer<typeof recordsSchemas.get>): Promise<McpResponse> => {
  const { apiToken, itemId, version = "published", returnAllLocales = false, nested = true, environment } = args;
  
  try {
    // Initialize DatoCMS client
    const client = UnifiedClientManager.getDefaultClient(apiToken, environment);
    
    try {
      // Prepare query parameters with proper typing
      const queryParams = {
        version: version as "published" | "current",
        nested
      };
    
      // Retrieve the item with proper typing
      const item: Item = await client.items.find(itemId, queryParams);
      
      // If no item found, return error
      if (!item) {
        return createErrorResponse(`Error: Record with ID '${itemId}' was not found.`);
      }

      // Use the type guards to provide additional context about the record
      let additionalInfo = '';
      if (isPublished(item)) {
        additionalInfo += `\nRecord Status: Published (published on ${new Date(item.meta.published_at!).toLocaleString()})`;
      } else if (item.meta.status === 'draft') {
        additionalInfo += '\nRecord Status: Draft (not yet published)';
      } else if (item.meta.status === 'updated') {
        additionalInfo += `\nRecord Status: Updated (published version from ${new Date(item.meta.published_at!).toLocaleString()}, with unpublished changes)`;
      }

      if (hasScheduledPublication(item)) {
        additionalInfo += `\nScheduled Publication: ${new Date(item.meta.publication_scheduled_at!).toLocaleString()}`;
      }

      if (hasScheduledUnpublishing(item)) {
        additionalInfo += `\nScheduled Unpublishing: ${new Date(item.meta.unpublishing_scheduled_at!).toLocaleString()}`;
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
          return createResponse(`${serializedRecord}${additionalInfo}

NOTE: This record contains localized fields (shown as objects with locale keys like { "en": "value", "it": "value" }).
When updating these fields, you MUST include values for ALL locales that should be preserved, not just the ones you're updating.`);
        }
      }

      // Convert to JSON and create response (will be chunked only if necessary)
      return createResponse(`${serializedRecord}${additionalInfo}`);
      
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
