/**
 * @file listRecordVersionsHandler.ts
 * @description Handler for listing versions of a DatoCMS record
 * 
 * This handler uses the enhanced factory pattern which provides:
 * - Automatic debug tracking when DEBUG=true
 * - Performance monitoring
 * - Standardized error handling
 * - Schema validation
 */

import { createListHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { recordsSchemas } from "../../schemas.js";
import type { SimpleSchemaTypes } from "@datocms/cma-client-node";

/**
 * Handler for listing versions of a DatoCMS record
 * 
 * Debug features:
 * - Tracks API call duration to DatoCMS
 * - Logs pagination parameters
 * - Provides execution trace for troubleshooting
 * - Sanitizes sensitive data (API tokens) in debug output
 */
export const listRecordVersionsHandler = createListHandler<any, SimpleSchemaTypes.ItemVersion>({
  domain: 'records.versions',
  schemaName: 'versions_list',
  schema: recordsSchemas.versions_list,
  entityName: 'Record Version',
  clientAction: async (client, args) => {
    const { itemId, page } = args;
    
    // Prepare pagination parameters
    const paginationParams = page ? {
      page: {
        limit: page.limit,
        offset: page.offset
      }
    } : {};
    
    // List versions of the item with pagination
    const versions = await client.itemVersions.list(itemId, paginationParams);
    
    // Return the versions directly - processing should be done in formatResult
    return versions;
  },
  formatResult: (results, args) => {
    const { page, returnOnlyIds = true } = args;
    
    // Process versions based on returnOnlyIds parameter
    const processedVersions = returnOnlyIds 
      ? results.map((version: SimpleSchemaTypes.ItemVersion) => ({
          id: version.id,
          created_at: version.created_at,
          timestamp: version.created_at // Alias for easier understanding
        }))
      : results;
    
    // Add pagination metadata
    return {
      returnOnlyIds,
      pagination: {
        limit: page?.limit || results.length,
        offset: page?.offset || 0,
        total: results.length,
        has_more: results.length === page?.limit
      },
      versions: processedVersions
    };
  }
});
