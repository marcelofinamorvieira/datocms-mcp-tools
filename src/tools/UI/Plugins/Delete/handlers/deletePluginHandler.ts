/**
 * @file deletePluginHandler.ts
 * @description Handler for deleting a DatoCMS plugin
 */

import type { z } from "zod";
import { buildClient } from "@datocms/cma-client-node";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { isAuthorizationError, isNotFoundError, createErrorResponse } from "../../../../../utils/errorHandlers.js";
import type { pluginSchemas } from "../../schemas.js";

/**
 * Handler function for deleting a DatoCMS plugin
 */
export const deletePluginHandler = async (args: z.infer<typeof pluginSchemas.delete>) => {
  const { apiToken, pluginId, environment } = args;
  
  try {
    // Initialize DatoCMS client
    const clientParameters = environment ? { apiToken, environment } : { apiToken };
    const client = buildClient(clientParameters);
    
    try {
      // Try to get the plugin first to check if it exists and to get its name
      let pluginName = "Plugin";
      try {
        const plugin = await client.plugins.find(pluginId);
        if (plugin) {
          pluginName = plugin.name || "Plugin";
        }
      } catch (findError) {
        // Ignore errors here, we'll handle the not found when we try to destroy
      }
      
      // Delete the plugin
      await client.plugins.destroy(pluginId);
      
      // Return success message
      return createResponse(JSON.stringify({
        success: true,
        message: `Successfully deleted plugin: ${pluginName}`,
        id: pluginId
      }, null, 2));
      
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
    return createErrorResponse(`Error deleting DatoCMS plugin: ${error instanceof Error ? error.message : String(error)}`);
  }
};