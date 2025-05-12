/**
 * @file createSchemaMenuItemHandler.ts
 * @description Handler for creating a DatoCMS schema menu item
 */

import type { z } from "zod";
import { buildClient } from "@datocms/cma-client-node";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { isAuthorizationError, isNotFoundError, createErrorResponse , extractDetailedErrorInfo } from "../../../../../utils/errorHandlers.js";
import type { schemaMenuItemSchemas } from "../../schemas.js";

/**
 * Handler function for creating a DatoCMS schema menu item
 */
export const createSchemaMenuItemHandler = async (args: z.infer<typeof schemaMenuItemSchemas.create>) => {
  const { 
    apiToken, 
    label, 
    position, 
    external_url, 
    parent_id, 
    type,
    attributes,
    environment 
  } = args;
  
  try {
    // Initialize DatoCMS client
    const clientParameters = environment ? { apiToken, environment } : { apiToken };
    const client = buildClient(clientParameters);
    
    try {
      // Create schema menu item payload
      const payload: Record<string, any> = {
        label,
        type
      };

      // Add optional fields if they are defined
      if (position !== undefined) payload.position = position;
      if (external_url !== undefined) payload.external_url = external_url;
      if (parent_id !== undefined) payload.parent_id = parent_id;
      
      // Add type-specific attributes if provided
      if (attributes) {
        // Different schema menu item types have different required attributes
        switch (type) {
          case "model":
            if (!attributes.model_id) {
              return createErrorResponse("Error: model_id is required when type is 'model'");
            }
            payload.attributes = { model_id: attributes.model_id };
            break;
          case "custom_page":
            if (!attributes.custom_page_id) {
              return createErrorResponse("Error: custom_page_id is required when type is 'custom_page'");
            }
            payload.attributes = { custom_page_id: attributes.custom_page_id };
            break;
          case "plugin":
            if (!attributes.plugin_id) {
              return createErrorResponse("Error: plugin_id is required when type is 'plugin'");
            }
            payload.attributes = { 
              plugin_id: attributes.plugin_id,
              plugin_base_url: attributes.plugin_base_url,
              plugin_parameters: attributes.plugin_parameters,
              plugin_name: attributes.plugin_name,
              plugin_icon_url: attributes.plugin_icon_url
            };
            break;
          case "models_group":
            payload.attributes = { models_filter: attributes.models_filter };
            break;
          case "block_models_group":
            payload.attributes = { block_models_filter: attributes.block_models_filter };
            break;
          case "general_group":
            // No specific attributes needed for general_group
            break;
        }
      }
      
      // Create the schema menu item
      const createdSchemaMenuItem = await client.schemaMenuItems.create(payload as any);
      
      // If no item returned, return error
      if (!createdSchemaMenuItem) {
        return createErrorResponse("Error: Failed to create schema menu item.");
      }

      // Return the created schema menu item
      return createResponse(JSON.stringify(createdSchemaMenuItem, null, 2));
      
    } catch (apiError: unknown) {
      if (isAuthorizationError(apiError)) {
        return createErrorResponse("Error: Please provide a valid DatoCMS API token. The token you provided was rejected by the DatoCMS API.");
      }
      
      // Re-throw other API errors to be caught by the outer catch
      throw apiError;
    }
  } catch (error: unknown) {
    return createErrorResponse(`Error creating DatoCMS schema menu item: ${extractDetailedErrorInfo(error)}`);
  }
};