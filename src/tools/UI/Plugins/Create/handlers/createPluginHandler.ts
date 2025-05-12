/**
 * @file createPluginHandler.ts
 * @description Handler for creating a DatoCMS plugin
 */

import type { z } from "zod";
import { buildClient } from "@datocms/cma-client-node";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { isAuthorizationError, createErrorResponse , extractDetailedErrorInfo } from "../../../../../utils/errorHandlers.js";
import type { pluginSchemas } from "../../schemas.js";

/**
 * Handler function for creating a DatoCMS plugin
 */
export const createPluginHandler = async (args: z.infer<typeof pluginSchemas.create>) => {
  const { 
    apiToken, 
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
    const clientParameters = environment ? { apiToken, environment } : { apiToken };
    const client = buildClient(clientParameters);
    
    try {
      // Create plugin payload
      const payload: Record<string, any> = {
        name,
        url
      };

      // Add optional fields if they are defined
      if (description !== undefined) payload.description = description;
      if (parameters !== undefined) payload.parameters = parameters;
      if (package_name !== undefined) payload.package_name = package_name;
      if (package_version !== undefined) payload.package_version = package_version;
      if (permissions !== undefined) payload.permissions = permissions;
      
      // Create the plugin
      const createdPlugin = await client.plugins.create(payload);
      
      // If no plugin returned, return error
      if (!createdPlugin) {
        return createErrorResponse("Error: Failed to create plugin.");
      }

      // Return the created plugin
      return createResponse(JSON.stringify(createdPlugin, null, 2));
      
    } catch (apiError: unknown) {
      if (isAuthorizationError(apiError)) {
        return createErrorResponse("Error: Please provide a valid DatoCMS API token. The token you provided was rejected by the DatoCMS API.");
      }
      
      // Re-throw other API errors to be caught by the outer catch
      throw apiError;
    }
  } catch (error: unknown) {
    return createErrorResponse(`Error creating DatoCMS plugin: ${extractDetailedErrorInfo(error)}`);
  }
};