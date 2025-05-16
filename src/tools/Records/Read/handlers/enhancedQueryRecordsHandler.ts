/**
 * @file enhancedQueryRecordsHandler.ts
 * @description Enhanced handler for querying DatoCMS records with filters and pagination
 * Uses the unified handler factory pattern with middleware composition
 */

import type { z } from "zod";
import { ClientType } from "../../../../utils/unifiedClientManager.js";
import { createListHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { returnMostPopulatedLocale } from "../../../../utils/returnMostPopulatedLocale.js";
import { recordsSchemas } from "../../schemas.js";
import type { Item, RecordQueryParams } from "../../types.js";

// Define augmented results type that includes meta information
interface ResultsWithMeta {
  items: Item[];
  meta?: { 
    total_count?: number;
    [key: string]: unknown;
  }
}

/**
 * Create the record query handler using the enhanced handler factory
 */
export const enhancedQueryRecordsHandler = createListHandler({
  // Handler identification and schema information
  domain: "records",
  schemaName: "query",
  schema: recordsSchemas.query,
  entityName: "Record",
  
  // Client type to use (using the appropriate client for records)
  clientType: ClientType.RECORDS,
  
  // Enhanced error context for better error messages
  errorContext: {
    handlerName: "records.query",
    resourceType: "Records",
    additionalInfo: {
      description: "This handler queries DatoCMS records with filters and pagination."
    }
  },
  
  // Client action function that performs the actual API call
  clientAction: async (client, args) => {
    const { 
      textSearch, 
      ids, 
      modelId, 
      modelName, 
      version = "current", 
      page,
      nested = true,
      order_by,
      fields,
      locale
    } = args;
    
    // Prepare query parameters
    const queryParams: RecordQueryParams = {
      version: version as "published" | "current",
      nested
    };
    
    // Add order_by parameter if provided with a model type filter
    if (order_by && (modelId || modelName)) {
      queryParams.order_by = order_by;
    }
    
    // Convert pagination parameters - Use sensible defaults
    const pageParams = page ? {
      limit: page.limit ?? 5,
      offset: page.offset ?? 0
    } : {
      limit: 5,
      offset: 0
    };
    
    // Add pagination parameters
    queryParams.page = pageParams;
    
    // Build filter object using Record<string, unknown> to avoid type issues
    let filter: Record<string, unknown> | undefined;
    
    // Handle filter logic based on provided parameters
    if (textSearch) {
      // Text search query
      filter = { query: textSearch };
      if (modelName) {
        filter.type = modelName;
      }
    } else if (ids) {
      // IDs-based query
      filter = { 
        ids: Array.isArray(ids) ? ids : [ids]
      };
    } else if (modelId || modelName) {
      // Model-based query with or without field filtering
      filter = { 
        type: modelId || modelName 
      };
      
      // Add field filtering if provided
      if (fields && Object.keys(fields).length > 0) {
        Object.entries(fields).forEach(([fieldName, fieldValue]) => {
          if (filter) {
            // Add field filter with simple structure
            filter[fieldName] = { eq: fieldValue };
          }
        });
      }

      // Add locale filter if provided
      if (locale) {
        filter.locale = locale;
      }
    }
    
    // Assign the filter to query params if it exists
    if (filter) {
      queryParams.filter = filter;
    }
    
    // Use type assertion to bridge the gap between our types and client types
    const clientParams = queryParams as any;
    
    // Execute the query and return the results
    const results = await client.items.list(clientParams);
    
    // The DatoCMS client may return items with meta information
    // Here we ensure we have a consistent format by wrapping items in a result object
    const resultsWithMeta: ResultsWithMeta = {
      items: Array.isArray(results) ? results : [],
      meta: (results as any).meta || { total_count: Array.isArray(results) ? results.length : 0 }
    };
    
    return resultsWithMeta.items;
  },
  
  // Result formatter function that formats the API response for the client
  formatResult: (results) => {
    const { returnAllLocales = false, returnOnlyIds = false } = recordsSchemas.query.parse({}) as any;
    
    // Default pagination parameters 
    const pageParams = {
      limit: 5,
      offset: 0
    };
    
    // Return enhanced response for empty results with metadata
    if (results.length === 0) {
      return {
        message: "No items found matching your query.",
        pagination: {
          limit: pageParams.limit,
          offset: pageParams.offset,
          total: 0,
          has_more: false
        },
        records: []
      };
    }
    
    // Calculate total count - since we no longer have meta we just use length
    const totalCount = results.length;
    
    // Calculate if there might be more records (simplified without meta)
    const hasMoreRecords = results.length === pageParams.limit;
    
    // Enhanced pagination metadata
    const paginationInfo = {
      limit: pageParams.limit,
      offset: pageParams.offset,
      total: totalCount,
      has_more: hasMoreRecords
    };
    
    // Use map approach for collecting IDs
    if (returnOnlyIds) {
      const allItemIds = results.map(item => item.id);
      return {
        message: `Found ${allItemIds.length} record(s) matching your query.`,
        pagination: paginationInfo,
        recordIds: allItemIds
      };
    }
    
    // Process items to filter locales with better typing
    const allItems = results.map(item => 
      returnMostPopulatedLocale(item, returnAllLocales)
    );
    
    // Return processed items with enhanced pagination metadata
    return {
      message: `Found ${allItems.length} record(s) matching your query.`,
      pagination: paginationInfo,
      records: allItems
    };
  }
});

export default enhancedQueryRecordsHandler;