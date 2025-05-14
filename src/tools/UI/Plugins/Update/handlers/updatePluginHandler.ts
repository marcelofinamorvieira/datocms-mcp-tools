/**
 * @file updatePluginHandler.ts
 * @description Handler for updating a DatoCMS plugin
 */

import type { z } from "zod";
import { getClient } from "../../../../../utils/clientManager.js";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { isAuthorizationError, isNotFoundError, createErrorResponse , extractDetailedErrorInfo } from "../../../../../utils/errorHandlers.js";
import type { pluginSchemas } from "../../schemas.js";

/**
 * Handler function for updating a DatoCMS plugin
 */
export const updatePluginHandler = async (args: z.infer<typeof pluginSchemas.update>) => {
  const { 
    apiToken, 
    pluginId,
    name, 
    description, 
    url, 
    parameters, 
    package_name, 
    package_version, 
    permissions,
    environment 
  } = args;
  
  try {
    // Initialize DatoCMS client
    const client = getClient(apiToken, environment);
    
    try {
      // Verify plugin exists by attempting to find it
      const existingPlugin = await client.plugins.find(pluginId);
      
      // Create update payload with only provided fields
      const payload: Record<string, any> = {};

      // Add fields that are defined
      if (name !== undefined) payload.name = name;
      if (description !== undefined) payload.description = description;
      if (url !== undefined) payload.url = url;
      if (parameters !== undefined) payload.parameters = parameters;
      if (package_name !== undefined) payload.package_name = package_name;
      if (package_version !== undefined) payload.package_version = package_version;
      if (permissions !== undefined) payload.permissions = permissions;
      
      // Update the plugin
      const updatedPlugin = await client.plugins.update(pluginId, payload);
      
      // Return the updated plugin
      return createResponse(JSON.stringify(updatedPlugin, null, 2));
      
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
    return createErrorResponse(`Error updating DatoCMS plugin: ${extractDetailedErrorInfo(error)}`);
  }
};