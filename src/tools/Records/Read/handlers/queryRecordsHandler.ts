/**
 * @file queryRecordsHandler.ts
 * @description Handler for querying DatoCMS records with filters and pagination
 * Extracted from the QueryDatoCMSRecords tool
 */

import { createListHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { returnMostPopulatedLocale } from "../../../../utils/returnMostPopulatedLocale.js";
import { recordsSchemas } from "../../schemas.js";
import type { Item, RecordQueryParams } from "../../types.js";

/**
 * Handler function for querying DatoCMS records with various filters
 */
export const queryRecordsHandler = createListHandler({
  domain: "records",
  schemaName: "query",
  schema: recordsSchemas.query,
  entityName: "Record",
  clientAction: async (client, args) => {
    const { 
      textSearch, 
      ids, 
      modelId, 
      modelName, 
      version = "current", 
      returnAllLocales = false, 
      returnOnlyIds = false,
      page,
      nested = true,
      order_by,
      fields,
      locale
    } = args;

    // Validate that field filtering requires a model specification
    if (fields && Object.keys(fields).length > 0 && !modelId && !modelName && !textSearch) {
      throw new Error(
        "Field filtering requires either 'modelId' or 'modelName' to be specified. " +
        "DatoCMS does not support cross-model field filtering. " +
        "Please specify which model/content type you want to filter within."
      );
    }
    
    // Prepare query parameters with proper typing
    const queryParams: RecordQueryParams = {
      version: version as "published" | "current",
      nested
    };
    
    // Add order_by parameter if provided
    if (order_by) {
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
    // The CMA client expects a plain object with specific properties
    let filter: Record<string, unknown> | undefined;
    
    // Keep track of field filters to handle multiple field conditions correctly
    const fieldFilters: Record<string, unknown> = {};
    
    // Handle filter logic following DatoCMS API constraints:
    // - filter[ids] cannot be used with filter[type] or filter[fields]
    // - filter[type] cannot be used with filter[fields] (mutually exclusive)
    // - filter[fields] requires a model context (validated above)
    
    if (ids) {
      // IDs-based query - cannot combine with type or fields per API docs
      filter = { 
        ids: Array.isArray(ids) ? ids : [ids]
      };
      
      // Add locale if provided (allowed with ids)
      if (locale) {
        filter.locale = locale;
      }
    } else if (textSearch) {
      // Text search query - can combine with type but not with fields
      filter = { query: textSearch };
      
      // Add model type if specified (and no field filtering)
      if ((modelId || modelName) && (!fields || Object.keys(fields).length === 0)) {
        filter.type = modelId || modelName;
      }
      
      // Add locale if provided
      if (locale) {
        filter.locale = locale;
      }
    } else if (fields && Object.keys(fields).length > 0) {
      // Field filtering - requires model context (validated above)
      // Since DatoCMS doesn't support filter[type] + filter[fields], we need to use a different approach
      // Based on API constraints, we'll query the specific model and filter client-side
      
      // Set up model filter first
      filter = {
        type: modelId || modelName
      };
      
      // Store field filtering for client-side processing after API call
      // We cannot use filter[fields] with filter[type] according to API docs
      
      // Add locale if provided
      if (locale) {
        filter.locale = locale;
      }
    } else if (modelId || modelName) {
      // Model-only query (no field filtering)
      filter = { 
        type: modelId || modelName 
      };
      
      // Add locale if provided
      if (locale) {
        filter.locale = locale;
      }
    }
    
    // Note: Field filtering is now handled client-side after the API call
    // because DatoCMS API doesn't support combining filter[type] with filter[fields]
    
    // Assign the filter to query params if it exists
    if (filter) {
      queryParams.filter = filter;
    }
    
    // Use type assertion to handle the client's expected types
    // This allows us to maintain our enhanced type system while still working with the client
    const clientParams = queryParams as any; // Use any here to bridge the gap between our types and client types
    
    
    // Pass the filter directly to the API since we're no longer trying to combine
    // filter[type] with filter[fields] - field filtering is handled client-side
    
    // Type the response properly
    let paginatedItems = await client.items.list(clientParams) as Item[] & {
      meta?: { 
        total_count?: number;
        [key: string]: unknown;
      }
    };
      
    // Apply client-side field filtering if needed
    // This is necessary because DatoCMS API doesn't support filter[type] + filter[fields]
    if (fields && Object.keys(fields).length > 0) {
      paginatedItems = paginatedItems.filter(item => {
        return Object.entries(fields).every(([fieldName, fieldValue]) => {
          const itemValue = (item as any)[fieldName];
          
          if (typeof fieldValue === 'object' && fieldValue !== null && !Array.isArray(fieldValue)) {
            // Handle condition objects like { eq: "value" }
            const conditions = fieldValue as Record<string, any>;
            return Object.entries(conditions).every(([operator, value]) => {
              switch (operator) {
                case 'eq':
                  return itemValue === value;
                case 'neq':
                  return itemValue !== value;
                case 'in':
                  return Array.isArray(value) && value.includes(itemValue);
                case 'nin':
                  return Array.isArray(value) && !value.includes(itemValue);
                case 'gt':
                  return itemValue > value;
                case 'gte':
                  return itemValue >= value;
                case 'lt':
                  return itemValue < value;
                case 'lte':
                  return itemValue <= value;
                case 'exists':
                  return value ? (itemValue !== null && itemValue !== undefined) : (itemValue === null || itemValue === undefined);
                default:
                  // For unsupported operators, fall back to equality check
                  return itemValue === value;
              }
            });
          } else {
            // Direct value comparison
            return itemValue === fieldValue;
          }
        });
      }) as Item[] & { meta?: { total_count?: number; [key: string]: unknown; } };
    }

    // Use map approach for collecting IDs
    if (returnOnlyIds) {
      const allItemIds = paginatedItems.map(item => item.id);
      // Return just the IDs array with metadata attached
      return allItemIds as any;
    }
    
    // Process items to filter locales with better typing
    const allItems = paginatedItems.map(item => 
      returnMostPopulatedLocale(item, returnAllLocales)
    );
    
    // Return processed items
    return allItems;
  }
});
