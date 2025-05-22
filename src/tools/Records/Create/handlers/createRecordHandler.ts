/**
 * @file createRecordHandler.ts
 * @description Handler for creating a new DatoCMS record
 * 
 * This handler uses the enhanced factory pattern which provides:
 * - Automatic debug tracking when DEBUG=true
 * - Performance monitoring
 * - Standardized error handling
 * - Schema validation
 */

import { createCreateHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { recordsSchemas } from "../../schemas.js";

/**
 * Handler for creating a new DatoCMS record
 * 
 * Debug features:
 * - Tracks API call duration to DatoCMS
 * - Logs field data size and structure
 * - Provides execution trace for troubleshooting
 * - Sanitizes sensitive data (API tokens) in debug output
 */
export const createRecordHandler = createCreateHandler({
  domain: 'records',
  schemaName: 'create',
  schema: recordsSchemas.create,
  entityName: 'Record',
  
  successMessage: (result: any) => {
    // Use the item type from the result for a more informative message
    const itemType = result.item_type?.id || 'unknown';
    return `Successfully created record with ID '${result.id}' of type '${itemType}'`;
  },
  
  clientAction: async (client, args) => {
    const { 
      itemType, 
      data, 
      returnOnlyConfirmation = false, 
      meta
    } = args;
    
    // Create the item
    const createdItem = await client.items.create({
      item_type: { 
        id: itemType, 
        type: "item_type" 
      },
      ...data,
      ...(meta && { meta })
    });
    
    // If no item returned, throw an error
    if (!createdItem) {
      throw new Error(`Failed to create a new record of type '${itemType}'.`);
    }
    
    // Return only confirmation data if requested (to save on tokens and response size)
    if (returnOnlyConfirmation) {
      return {
        id: createdItem.id,
        item_type: createdItem.item_type,
        meta: { status: createdItem.meta?.status || 'created' }
      };
    }
    
    // Otherwise return the full record data
    return createdItem;
  }
});