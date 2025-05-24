/**
 * @file enhancedQueryRecordsHandler.ts
 * @description Enhanced handler for querying DatoCMS records with filters and pagination
 * Uses the unified handler factory pattern with middleware composition
 */

import { createListHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { returnMostPopulatedLocale } from "../../../../utils/returnMostPopulatedLocale.js";
import { recordsSchemas } from "../../schemas.js";
import { SimpleSchemaTypes } from "@datocms/cma-client-node";

// The results type is now simply SimpleSchemaTypes.Item[]
// since we're using the standard client methods

/**
 * Create the record query handler using the enhanced handler factory
 */
export const enhancedQueryRecordsHandler = createListHandler<any, SimpleSchemaTypes.Item>({
  // Handler identification and schema information
  domain: "records",
  schemaName: "query",
  schema: recordsSchemas.query,
  entityName: "Record",
  
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
    const queryParams: SimpleSchemaTypes.ItemInstancesHrefSchema = {
      version: version as "published" | "current",
      nested: nested || false
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
    } else if (modelId || modelName || (fields && Object.keys(fields).length > 0)) {
      // Model-based query OR field-only filtering query
      filter = {};
      
      // Add model type if specified
      if (modelId || modelName) {
        filter.type = modelId || modelName;
      }
      
      // Add field filtering if provided
      if (fields && Object.keys(fields).length > 0) {
        Object.entries(fields).forEach(([fieldName, fieldValue]) => {
          // Add field filter with simple structure
          filter![fieldName] = { eq: fieldValue };
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

    // Execute the query using the standard DatoCMS client
    const results = await client.items.list(clientParams);
    
    // Return the items directly
    return results;
  },
  
  // Result formatter function that formats the API response for the client
  formatResult: (results, _args) => {
    // Since we can't rely on args here, use defaults
    const returnAllLocales = false;
    const returnOnlyIds = false;
    
    // Use default pagination values since we can't rely on args
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