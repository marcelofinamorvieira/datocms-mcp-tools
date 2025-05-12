/**
 * @file retrievePluginHandler.ts
 * @description Handler for retrieving a single DatoCMS plugin
 */

import type { z } from "zod";
import { buildClient } from "@datocms/cma-client-node";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { isAuthorizationError, isNotFoundError, createErrorResponse , extractDetailedErrorInfo } from "../../../../../utils/errorHandlers.js";
import type { pluginSchemas } from "../../schemas.js";

/**
 * Handler function for retrieving a single DatoCMS plugin
 */
export const retrievePluginHandler = async (args: z.infer<typeof pluginSchemas.retrieve> | z.infer<typeof pluginSchemas.fields>) => {
  const { apiToken, pluginId, environment } = args;
  
  // Determine if we're retrieving plugin fields
  const retrieveFields = 'fields' in args;
  
  try {
    // Initialize DatoCMS client
    const clientParameters = environment ? { apiToken, environment } : { apiToken };
    const client = buildClient(clientParameters);
    
    try {
      // Attempt to retrieve the plugin
      let result;
      
      if (retrieveFields) {
        // Get plugin fields
        result = await client.plugins.fields(pluginId);
      } else {
        // Get the plugin
        result = await client.plugins.find(pluginId);
      }
      
      // If no result, return error
      if (!result) {
        return createErrorResponse(`Error: Plugin with ID '${pluginId}' not found.`);
      }
      
      // Return the retrieved plugin
      return createResponse(JSON.stringify(result, null, 2));
      
    } catch (apiError: unknown) {
      if (isAuthorizationError(apiError)) {
        return createErrorResponse("Error: Please provide a valid DatoCMS API token. The token you provided was rejected by the DatoCMS API.");
      }
      
      if (isNotFoundError(apiError)) {
        return createErrorResponse(`Error: Plugin with ID '${pluginId}' not found.`);
      }
      
      // Re-throw other API errors to be caught by the outer catch
      throw apiError;
    }
  } catch (error: unknown) {
    return createErrorResponse(`Error retrieving DatoCMS plugin: ${extractDetailedErrorInfo(error)}`);
  }
};