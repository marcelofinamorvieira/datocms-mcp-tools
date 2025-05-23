/**
 * @file unpublishRecordHandler.ts
 * @description Handler for unpublishing a DatoCMS record
 * Extracted from the UnpublishDatoCMSRecord tool
 */

import { createCustomHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { ClientType } from "../../../../utils/unifiedClientManager.js";
import { recordsSchemas } from "../../schemas.js";
import { createResponse } from "../../../../utils/responseHandlers.js";
import type { Item, DatoCMSValidationError } from "../../types.js";
import { isValidationError } from "../../types.js";

/**
 * Handler function for unpublishing a DatoCMS record
 */
export const unpublishRecordHandler = createCustomHandler(
  {
    domain: "records",
    schemaName: "unpublish",
    schema: recordsSchemas.unpublish,
    clientType: ClientType.DEFAULT
  },
  async (args: any) => {
    const { itemId, recursive = false, apiToken, environment } = args;

    // Get the records client
    const { UnifiedClientManager } = await import("../../../../utils/unifiedClientManager.js");
    const client = UnifiedClientManager.getDefaultClient(apiToken, environment);

    try {
      // Unpublish entire record (all locales) - content_in_locales is not in the schema
      const unpublishedItem: Item = await client.items.unpublish(itemId, undefined, { recursive });
      
      if (!unpublishedItem) {
        throw new Error(`Failed to unpublish record with ID '${itemId}'.`);
      }
      
      return createResponse(JSON.stringify(unpublishedItem, null, 2));
    } catch (apiError: unknown) {
      if (isValidationError(apiError)) {
        const validationError = apiError as DatoCMSValidationError;
        const validationDetails = validationError.errors?.map(err => 
          typeof err === 'object' && err !== null && 'message' in err 
            ? `- ${(err as any).field ? `Field '${(err as any).field}': ` : ''}${(err as any).message}`
            : JSON.stringify(err)
        ).join('\n') || 'Unknown validation error';
        
        throw new Error(`Unable to unpublish record due to validation errors:\n${validationDetails}`);
      }
      
      // Re-throw other API errors
      throw apiError;
    }
  }
);
