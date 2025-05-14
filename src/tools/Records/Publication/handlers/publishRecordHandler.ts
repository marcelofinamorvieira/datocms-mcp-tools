/**
 * @file publishRecordHandler.ts
 * @description Handler for publishing a DatoCMS record
 * Extracted from the PublishDatoCMSRecord tool
 */

import type { z } from "zod";
import { getClient } from "../../../../utils/clientManager.js";
import { createResponse } from "../../../../utils/responseHandlers.js";
import { createErrorResponse, extractDetailedErrorInfo } from "../../../../utils/errorHandlers.js";
import type { recordsSchemas } from "../../schemas.js";
import type { Item, McpResponse, DatoCMSValidationError, DatoCMSVersionConflictError } from "../../types.js";
import { isAuthorizationError, isNotFoundError, isValidationError, isVersionConflictError } from "../../types.js";

/**
 * Handler function for publishing a DatoCMS record
 */
export const publishRecordHandler = async (args: z.infer<typeof recordsSchemas.publish>): Promise<McpResponse> => {
  const { apiToken, itemId, content_in_locales, non_localized_content, recursive = false, environment } = args;
  
  try {
    // Initialize DatoCMS client
    const client = getClient(apiToken, environment);
    
    try {
      let publishedItem: Item;
      
      // Determine publishing mode based on provided parameters
      if (content_in_locales || non_localized_content !== undefined) {
        // Selective publishing with specified parameters
        // The DatoCMS API requires both properties to be present for selective publishing
        const publishOptions: {
          content_in_locales: string[];
          non_localized_content: boolean;
        } = {
          content_in_locales: content_in_locales || [],
          non_localized_content: non_localized_content ?? false
        };
        
        publishedItem = await client.items.publish(itemId, publishOptions, { recursive });
      } else {
        // Publish entire record (all locales & non-localized content)
        publishedItem = await client.items.publish(itemId, undefined, { recursive });
      }
      
      if (!publishedItem) {
        return createErrorResponse(`Error: Failed to publish record with ID '${itemId}'.`);
      }
      
      return createResponse(JSON.stringify(publishedItem, null, 2));
      
    } catch (apiError: unknown) {
      if (isAuthorizationError(apiError)) {
        return createErrorResponse("Error: Please provide a valid DatoCMS API token. The token you provided was rejected by the DatoCMS API.");
      }
      
      if (isNotFoundError(apiError)) {
        return createErrorResponse(`Error: Record with ID '${itemId}' was not found.`);
      }
      
      if (isValidationError(apiError)) {
        const validationError = apiError as DatoCMSValidationError;
        const validationDetails = validationError.errors?.map(err => 
          typeof err === 'object' && err !== null && 'message' in err 
            ? `- ${(err as any).field ? `Field '${(err as any).field}': ` : ''}${(err as any).message}`
            : JSON.stringify(err)
        ).join('\n') || 'Unknown validation error';
        
        return createErrorResponse(`Error: Unable to publish record due to validation errors:\n${validationDetails}`);
      }
      
      if (isVersionConflictError(apiError)) {
        const versionError = apiError as DatoCMSVersionConflictError;
        return createErrorResponse(
          `Error: Version conflict. The record has been modified since you retrieved it. ` +
          `Current version is ${versionError.current_version}. Please fetch the latest version and try again.`
        );
      }
      
      // Re-throw other API errors to be caught by the outer catch
      throw apiError;
    }
  } catch (error: unknown) {
    // Use createErrorResponse for consistent error handling
    return createErrorResponse(`Error publishing DatoCMS record: ${extractDetailedErrorInfo(error)}`);
  }
};