/**
 * @file publishRecordHandler.ts
 * @description Handler for publishing a DatoCMS record
 * Extracted from the PublishDatoCMSRecord tool
 */

import { createCustomHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { recordsSchemas } from "../../schemas.js";
import type { Item, DatoCMSValidationError, DatoCMSVersionConflictError } from "../../types.js";
import { isValidationError, isVersionConflictError } from "../../types.js";

/**
 * Handler function for publishing a DatoCMS record
 */
export const publishRecordHandler = createCustomHandler({
  domain: "records",
  schemaName: "publish",
  schema: recordsSchemas.publish,
  entityName: "Record",
  clientAction: async (client, args) => {
    const { itemId, content_in_locales, non_localized_content, recursive = false } = args;
    
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
        throw new Error(`Failed to publish record with ID '${itemId}'.`);
      }
      
      return publishedItem;
    } catch (apiError: unknown) {
      if (isValidationError(apiError)) {
        const validationError = apiError as DatoCMSValidationError;
        const validationDetails = validationError.errors?.map(err => 
          typeof err === 'object' && err !== null && 'message' in err 
            ? `- ${(err as any).field ? `Field '${(err as any).field}': ` : ''}${(err as any).message}`
            : JSON.stringify(err)
        ).join('\n') || 'Unknown validation error';
        
        throw new Error(`Unable to publish record due to validation errors:\n${validationDetails}`);
      }
      
      if (isVersionConflictError(apiError)) {
        const versionError = apiError as DatoCMSVersionConflictError;
        throw new Error(
          `Version conflict. The record has been modified since you retrieved it. ` +
          `Current version is ${versionError.current_version}. Please fetch the latest version and try again.`
        );
      }
      
      // Re-throw other API errors
      throw apiError;
    }
  }
});