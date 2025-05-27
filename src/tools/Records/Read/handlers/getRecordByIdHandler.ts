/**
 * @file getRecordByIdHandler.ts
 * @description Handler for retrieving a specific DatoCMS record by ID
 * 
 * This handler uses the enhanced factory pattern which provides:
 * - Automatic debug tracking when DEBUG=true
 * - Performance monitoring
 * - Standardized error handling
 * - Schema validation
 */

import { createRetrieveHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { returnMostPopulatedLocale } from "../../../../utils/returnMostPopulatedLocale.js";
import { recordsSchemas } from "../../schemas.js";
import type { Item } from "../../types.js";

/**
 * Handler to retrieve a specific DatoCMS record by its ID
 * 
 * Debug features:
 * - Tracks API call duration to DatoCMS
 * - Logs record metadata and status
 * - Tracks locale processing performance
 * - Provides execution trace for troubleshooting
 */
export const getRecordByIdHandler = createRetrieveHandler({
  domain: 'records',
  schemaName: 'get',
  schema: recordsSchemas.get,
  entityName: 'Record',
  idParam: 'itemId',
  
  clientAction: async (client, args) => {
    const { 
      itemId, 
      version = "published", 
      returnAllLocales = false, 
      nested = true 
    } = args;
    
    // Prepare query parameters with proper typing
    const queryParams = {
      version: version as "published" | "current",
      nested
    };
    
    // Retrieve the item with proper typing
    const item: Item = await client.items.find(itemId, queryParams);
    
    // If no item found, return null (will be handled by factory)
    if (!item) {
      return null;
    }
    
    
    // Build additional info about the record
    const additionalInfo: string[] = [];
    
    if (item.meta.status === 'published' && item.meta.published_at) {
      additionalInfo.push(`Record Status: Published (published on ${new Date(item.meta.published_at).toLocaleString()})`);
    } else if (item.meta.status === 'draft') {
      additionalInfo.push('Record Status: Draft (not yet published)');
    } else if (item.meta.status === 'updated') {
      additionalInfo.push(`Record Status: Updated (published version from ${new Date(item.meta.published_at!).toLocaleString()}, with unpublished changes)`);
    }
    
    if (item.meta.publication_scheduled_at) {
      additionalInfo.push(`Scheduled Publication: ${new Date(item.meta.publication_scheduled_at).toLocaleString()}`);
    }
    
    if (item.meta.unpublishing_scheduled_at) {
      additionalInfo.push(`Scheduled Unpublishing: ${new Date(item.meta.unpublishing_scheduled_at).toLocaleString()}`);
    }
    
    // Process locales
    const processedItem = returnMostPopulatedLocale(item, returnAllLocales);
    
    // Add locale information if returning all locales
    let localeNote = '';
    if (returnAllLocales) {
      const serializedRecord = JSON.stringify(processedItem, null, 2);
      const hasLocalizedFields = serializedRecord.includes('{"en":') ||
                                serializedRecord.includes('{"it":') ||
                                serializedRecord.includes('"localized":true');
      
      if (hasLocalizedFields) {
        localeNote = '\n\nNOTE: This record contains localized fields (shown as objects with locale keys like { "en": "value", "it": "value" }).\nWhen updating these fields, you MUST include values for ALL locales that should be preserved, not just the ones you\'re updating.';
      }
    }
    
    // Return enriched record data
    // Include metadata as a separate field to maintain the original structure
    const result = Object.assign({}, processedItem, {
      _metadata: {
        additionalInfo: additionalInfo.join('\n'),
        localeNote
      }
    });
    
    return result;
  }
});
