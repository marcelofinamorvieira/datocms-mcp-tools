/**
 * @file unpublishRecordHandler.ts
 * @description Handler for unpublishing a DatoCMS record
 * Extracted from the UnpublishDatoCMSRecord tool
 */

import type { z } from "zod";
import { UnifiedClientManager } from "../../../../utils/unifiedClientManager.js";
import { createErrorResponse, extractDetailedErrorInfo } from "../../../../utils/errorHandlers.js";
import { createResponse } from "../../../../utils/responseHandlers.js";
import type { recordsSchemas } from "../../schemas.js";
import type { Item, McpResponse, DatoCMSValidationError } from "../../types.js";
import { isAuthorizationError, isNotFoundError, isValidationError } from "../../types.js";

/**
 * Handler function for unpublishing a DatoCMS record
 */
export const unpublishRecordHandler = async (args: z.infer<typeof recordsSchemas.unpublish>): Promise<McpResponse> => {
  const { apiToken, itemId, recursive = false, environment } = args;

  try {
    // Initialize DatoCMS client
    const client = UnifiedClientManager.getDefaultClient(apiToken, environment);
    
    try {
      // Unpublish entire record (all locales) - content_in_locales is not in the schema
      const unpublishedItem: Item = await client.items.unpublish(itemId, undefined, { recursive });
      
      if (!unpublishedItem) {
        return createErrorResponse(`Error: Failed to unpublish record with ID '${itemId}'.`);
      }
      
      return createResponse(JSON.stringify(unpublishedItem, null, 2));
      
    } catch (apiError: unknown) {
      if (isAuthorizationError(apiError)) {
        return createErrorResponse("Error: Please provide a valid DatoCMS API token. The token you provided was rejected by the DatoCMS API.");
      }
      
      if (isNotFoundError(apiError)) {
        return createErrorResponse(`Error: Record with ID '${itemId}' not found.`);
      }
      
      if (isValidationError(apiError)) {
        const validationError = apiError as DatoCMSValidationError;
        const validationDetails = validationError.errors?.map(err => 
          typeof err === 'object' && err !== null && 'message' in err 
            ? `- ${(err as any).field ? `Field '${(err as any).field}': ` : ''}${(err as any).message}`
            : JSON.stringify(err)
        ).join('\n') || 'Unknown validation error';
        
        return createErrorResponse(`Error: Unable to unpublish record due to validation errors:\n${validationDetails}`);
      }
      
      // Re-throw other API errors to be caught by the outer catch
      throw apiError;
    }
  } catch (error: unknown) {
    return createErrorResponse(`Error unpublishing DatoCMS record: ${extractDetailedErrorInfo(error)}`);
  }
};
