/**
 * @file queryRecordsHandler.ts
 * @description Handler for querying DatoCMS records with filters and pagination
 * Extracted from the QueryDatoCMSRecords tool
 */

import type { z } from "zod";
import { getClient } from "../../../../utils/clientManager.js";
import { createResponse } from "../../../../utils/responseHandlers.js";
import { isAuthorizationError, createErrorResponse, extractDetailedErrorInfo } from "../../../../utils/errorHandlers.js";
import { returnMostPopulatedLocale } from "../../../../utils/returnMostPopulatedLocale.js";
import type { recordsSchemas } from "../../schemas.js";
import type { Item, RecordFilter, RecordQueryParams, McpResponse } from "../../types.js";

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
    const client = getClient(apiToken, environment);
    
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
    
    try {
      // Use type assertion to handle the client's expected types
      // This allows us to maintain our enhanced type system while still working with the client
      const clientParams = queryParams as any; // Use any here to bridge the gap between our types and client types
      
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
          recordIds: allItemIds
        }, null, 2));
      }
      
      // Process items to filter locales with better typing
      const allItems = paginatedItems.map(item => 
        returnMostPopulatedLocale(item, returnAllLocales)
      );
      
      // Return processed items with enhanced pagination metadata
      return createResponse(JSON.stringify({
        message: `Found ${allItems.length} record(s) matching your query.`,
        pagination: paginationInfo,
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
