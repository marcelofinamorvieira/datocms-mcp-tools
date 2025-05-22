/**
 * @file queryRecordsHandler.ts
 * @description Handler for querying DatoCMS records with filters and pagination
 * Extracted from the QueryDatoCMSRecords tool
 */

import type { z } from "zod";
import { UnifiedClientManager } from "../../../../utils/unifiedClientManager.js";
import { createResponse } from "../../../../utils/responseHandlers.js";
import { isAuthorizationError, createErrorResponse, extractDetailedErrorInfo } from "../../../../utils/errorHandlers.js";
import { returnMostPopulatedLocale } from "../../../../utils/returnMostPopulatedLocale.js";
import type { recordsSchemas } from "../../schemas.js";
import type { Item, RecordFilter, RecordQueryParams, McpResponse } from "../../types.js";
// For debugging purposes
let debugFilter: any = null;

/**
 * Handler function for querying DatoCMS records with various filters
 */
export const queryRecordsHandler = async (args: z.infer<typeof recordsSchemas.query>): Promise<McpResponse> => {
  const { 
    apiToken, 
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
    locale,
    environment
  } = args;

  try {
    // Initialize DatoCMS client
    const client = UnifiedClientManager.getDefaultClient(apiToken, environment);
    
    // Prepare query parameters with proper typing
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
    // The CMA client expects a plain object with specific properties
    let filter: Record<string, unknown> | undefined;
    
    // Keep track of field filters to handle multiple field conditions correctly
    const fieldFilters: Record<string, unknown> = {};
    
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
            // Support both direct values and filter condition objects
            if (typeof fieldValue === 'object' && fieldValue !== null && !Array.isArray(fieldValue)) {
              // It's a filter condition object like { eq: "value" }
              const conditions = fieldValue as Record<string, any>;
              
              // For DatoCMS field filtering, we need to use a more specific structure
              // Instead of: { name: { eq: "value" } }
              // We need:    { filter: { name: { eq: "value" } } }
              
              // Map our filter operators to DatoCMS expected format
              const mappedConditions: Record<string, any> = {};
              
              // Handle each condition operator
              Object.entries(conditions).forEach(([operator, value]) => {
                // Only allow operators that are supported by DatoCMS API
                // These are: eq, neq, in, nin, gt, gte, lt, lte, exists
                const supportedOperators = ['eq', 'neq', 'in', 'nin', 'gt', 'gte', 'lt', 'lte', 'exists'];
                
                if (supportedOperators.includes(operator)) {
                  // For supported operators, pass as-is
                  mappedConditions[operator] = value;
                } else if (operator === 'matches') {
                  // The 'matches' operator doesn't work as expected, so map to 'eq' instead
                  // for backward compatibility
                  if (typeof value === 'object' && value !== null && 'pattern' in value) {
                    mappedConditions['eq'] = value.pattern;
                  } else {
                    mappedConditions['eq'] = value;
                  }
                } else {
                  // For unsupported operators, provide detailed error message
                  // and fall back to 'eq' for graceful degradation
                  
                  // Attempt to handle some common unsupported operators with useful messages
                  if (operator === 'contains') {
                    // Special handling for 'contains' to provide a better error message
                    // Add warning to debug info but continue with fallback
                    debugFilter = {
                      ...debugFilter,
                      warning: `Operator 'contains' is not supported by DatoCMS API. Using 'eq' instead. For partial matching, consider using the DatoCMS search API features which support full-text search.`
                    };
                  } else {
                    // Generic warning for other unsupported operators
                    debugFilter = {
                      ...debugFilter,
                      warning: `Unsupported filter operator: '${operator}'. Using 'eq' instead. Supported operators are: ${supportedOperators.join(', ')}`
                    };
                  }
                  
                  // Fall back to 'eq' for unsupported operators
                  mappedConditions['eq'] = value;
                }
              });
              
              // Store in fieldFilters (not directly in filter)
              fieldFilters[fieldName] = mappedConditions;
            } else {
              // It's a direct value like "value", convert to { eq: "value" }
              fieldFilters[fieldName] = { eq: fieldValue };
            }
          }
        });
      }

      // Add locale filter if provided
      if (locale) {
        filter.locale = locale;
      }
      
      // Now that we've processed all field filters, add them to the main filter
      // If we have field filters, we need to add them to the filter
      if (Object.keys(fieldFilters).length > 0) {
        // Make sure filter is defined before adding field filters
        if (!filter) {
          filter = {};
        }
        
        // Apply all field filters
        Object.entries(fieldFilters).forEach(([field, conditions]) => {
          filter![field] = conditions;
        });
      }
    }
    
    // Store filter for debugging
    debugFilter = filter ? {...filter} : null;
    
    // Assign the filter to query params if it exists
    if (filter) {
      queryParams.filter = filter;
    }
    
    try {
      // Use type assertion to handle the client's expected types
      // This allows us to maintain our enhanced type system while still working with the client
      const clientParams = queryParams as any; // Use any here to bridge the gap between our types and client types
      
      // Debug the actual query parameters being sent
      const debugQueryParams = {
        ...clientParams,
        filter: debugFilter,
        clientInfo: typeof client.items.list
      };
      
      // Fix for field filtering - Convert filter to the nested format expected by the DatoCMS API
      // DatoCMS API expects filters in this format: { filter: { type: "dog", fields: { name: { eq: "value" } } } }
      if (filter && Object.keys(filter).length > 0) {
        // Create the new filter structure
        const newFilter: Record<string, any> = {
          // Add type to the filter if present
          type: filter.type
        };
        
        // Add locale if present
        if (filter.locale) {
          newFilter.locale = filter.locale;
        }
        
        // Add ids if present
        if (filter.ids) {
          newFilter.ids = filter.ids;
        }
        
        // Add query if present
        if (filter.query) {
          newFilter.query = filter.query;
        }
        
        // Create a fields object to hold all field filters
        const fieldsFilter: Record<string, any> = {};
        let hasFieldFilters = false;
        
        // Process field filters
        Object.entries(filter).forEach(([field, value]) => {
          // Skip type, locale, ids, and query as they're handled differently
          if (field === 'type' || field === 'locale' || field === 'ids' || field === 'query') {
            return;
          }
          
          // Handle field filters in the format expected by the API
          if (typeof value === 'object' && value !== null) {
            fieldsFilter[field] = value;
            hasFieldFilters = true;
          }
        });
        
        // Only add fields filter if we have field conditions
        if (hasFieldFilters) {
          newFilter.fields = fieldsFilter;
        }
        
        // Replace filter object with properly structured filter
        clientParams.filter = newFilter;
      }
      
      // Type the response properly
      const paginatedItems = await client.items.list(clientParams) as Item[] & {
        meta?: { 
          total_count?: number;
          [key: string]: unknown;
        }
      };

      // Return enhanced response for empty results with metadata
      if (paginatedItems.length === 0) {
        return createResponse(JSON.stringify({
          message: "No items found matching your query.",
          pagination: {
            limit: pageParams.limit,
            offset: pageParams.offset,
            total: 0,
            has_more: false
          },
          // DEBUG: Added to troubleshoot field filtering issues - remove after fixing
          debug: {
            requestedFilters: fields || {},
            processedFilter: debugFilter || {},
            transformedFilter: clientParams.filter || {},
            queryParams: {
              version: queryParams.version,
              page: queryParams.page,
              order_by: queryParams.order_by || null
            }
          }, // DEBUG: Remove this before production
          records: []
        }, null, 2));
      }
      
      // Check for meta property with better typing
      const totalCount = paginatedItems.meta?.total_count ?? paginatedItems.length;
      
      // Calculate if there might be more records
      const hasMoreRecords = paginatedItems.length === pageParams.limit && 
                          (pageParams.offset + paginatedItems.length) < totalCount;
      
      // Enhanced pagination metadata
      const paginationInfo = {
        limit: pageParams.limit,
        offset: pageParams.offset,
        total: totalCount,
        has_more: hasMoreRecords
      };
      
      // Use map approach for collecting IDs
      if (returnOnlyIds) {
        const allItemIds = paginatedItems.map(item => item.id);
        return createResponse(JSON.stringify({
          message: `Found ${allItemIds.length} record(s) matching your query.`,
          pagination: paginationInfo,
          // DEBUG: Added to troubleshoot field filtering issues - remove after fixing
          debug: {
            requestedFilters: fields || {},
            processedFilter: debugFilter || {},
            transformedFilter: clientParams.filter || {},
            queryParams: {
              version: queryParams.version,
              page: queryParams.page,
              order_by: queryParams.order_by || null
            }
          }, // DEBUG: Remove this before production
          recordIds: allItemIds
        }, null, 2));
      }
      
      // Process items to filter locales with better typing
      const allItems = paginatedItems.map(item => 
        returnMostPopulatedLocale(item, returnAllLocales)
      );
      
      // Return processed items with enhanced pagination metadata and debug info
      return createResponse(JSON.stringify({
        message: `Found ${allItems.length} record(s) matching your query.`,
        pagination: paginationInfo,
        // DEBUG: Added to troubleshoot field filtering issues - remove after fixing
        debug: {
          requestedFilters: fields || {},
          processedFilter: debugFilter || {},
          transformedFilter: clientParams.filter || {},
          queryParams: {
            version: queryParams.version,
            page: queryParams.page,
            order_by: queryParams.order_by || null
          }
        }, // DEBUG: Remove this before production
        records: allItems
      }, null, 2));
      
    } catch (apiError: unknown) {
      if (isAuthorizationError(apiError)) {
        return createErrorResponse("Error: Please provide a valid DatoCMS API token. The token you provided was rejected by the DatoCMS API.");
      }
      
      // Generic API error handling with improved type safety
      return createErrorResponse(`Error querying DatoCMS records: ${extractDetailedErrorInfo(apiError)}`);
    }
  } catch (error: unknown) {
    return createErrorResponse(`Error querying DatoCMS records: ${extractDetailedErrorInfo(error)}`);
  }
};
