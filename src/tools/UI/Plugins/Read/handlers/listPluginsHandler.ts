/**
 * @file listPluginsHandler.ts
 * @description Handler for listing DatoCMS plugins
 */

import type { z } from "zod";
import { buildClient } from "@datocms/cma-client-node";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { isAuthorizationError, createErrorResponse } from "../../../../../utils/errorHandlers.js";
import type { pluginSchemas } from "../../schemas.js";

/**
 * Handler function for listing DatoCMS plugins
 */
export const listPluginsHandler = async (args: z.infer<typeof pluginSchemas.list>) => {
  const { apiToken, page, environment } = args;
  
  try {
    // Initialize DatoCMS client with appropriate parameters
    const clientParameters = environment ? { apiToken, environment } : { apiToken };
    const client = buildClient(clientParameters);
    
    try {
      // Prepare pagination parameters
      const paginationParams = page
        ? { 
            offset: page.offset, 
            limit: page.limit
          }
        : { 
            offset: 0, 
            limit: 100 
          };
      
      // Get plugins with pagination
      const plugins = await client.plugins.list();
      
      // Format the response
      return createResponse(JSON.stringify({
        data: plugins,
        meta: {
          totalCount: plugins.length, // Note: More accurate count might be available if pagination is implemented fully
        }
      }, null, 2));
      
    } catch (apiError: unknown) {
      if (isAuthorizationError(apiError)) {
        return createErrorResponse("Error: Please provide a valid DatoCMS API token. The token you provided was rejected by the DatoCMS API.");
      }
      
      // Re-throw other API errors to be caught by the outer catch
      throw apiError;
    }
  } catch (error: unknown) {
    return createErrorResponse(`Error listing DatoCMS plugins: ${error instanceof Error ? error.message : String(error)}`);
  }
};