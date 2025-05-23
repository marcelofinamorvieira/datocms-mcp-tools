/**
 * @file updateRecordHandler.ts
 * @description Handler for updating an existing DatoCMS record
 */

import { createUpdateHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { extractDetailedErrorInfo } from "../../../../utils/errorHandlers.js";
import { recordsSchemas } from "../../schemas.js";

/**
 * Handler function for updating an existing DatoCMS record
 */
export const updateRecordHandler = createUpdateHandler({
  domain: "records",
  schemaName: "update",
  schema: recordsSchemas.update,
  entityName: "Record",
  idParam: "itemId",
  clientAction: async (client, args) => {
    const { 
      itemId,
      data,
      version,
      returnOnlyConfirmation = false
    } = args;
    
    try {
      // Prepare update parameters
      const updateParams: Record<string, any> = { ...data };
      
      // Add version if provided (for optimistic locking)
      if (version !== undefined) {
        updateParams.meta = { ...(updateParams.meta || {}), current_version: version };
      }
      
      // Update the item
      const updatedItem = await client.items.update(itemId, updateParams);
      
      // If no item returned, return error
      if (!updatedItem) {
        throw new Error(`Failed to update record with ID '${itemId}'.`);
      }

      // Return only confirmation message if requested (to save on tokens)
      if (returnOnlyConfirmation) {
        return `Successfully updated record with ID '${itemId}'.`;
      }

      // Otherwise return the full record data
      return updatedItem;
    } catch (apiError: unknown) {
      // Check for version conflict errors
      const errorMessage = extractDetailedErrorInfo(apiError);
      if (errorMessage.includes("version") && errorMessage.includes("conflict")) {
        throw new Error(`Version conflict detected. The record has been modified since you retrieved it. Please fetch the latest version and try again.`);
      }
      
      // Format API errors for better understanding
      if (errorMessage.includes("Validation failed")) {
        // Check for localization-specific errors
        if (errorMessage.includes("locales")) {
          throw new Error(`Localization error updating DatoCMS record: ${errorMessage}

Please check that:
1. For localized fields, you've included values for ALL locales that should be preserved, not just the ones you're updating
2. Example: if 'title' already has values for 'en' and 'es' locales, and you want to update only 'es',
   you must provide { title: { en: 'existing English title', es: 'new Spanish title' } },
   otherwise the 'en' value will be deleted
3. The locales are consistent across all localized fields (they must share the same locale keys)
4. You're using the correct locale codes as defined in your DatoCMS project settings

Use the Schema tools to check which fields are localized. For each localized field you're updating,
include ALL locale values that should exist after the update.`);
        }

        throw new Error(`Validation error updating DatoCMS record: ${errorMessage}.

Please check that your field values match the required format for each field type. Refer to the DatoCMS API documentation for field type requirements: https://www.datocms.com/docs/content-management-api/resources/item/update#updating-fields`);
      }
      
      // Re-throw other API errors
      throw apiError;
    }
  }
});