/**
 * @file updateSchemaMenuItemHandler.ts
 * @description Handler for updating a DatoCMS schema menu item
 */

import type { z } from "zod";
import { getClient } from "../../../../../utils/clientManager.js";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { isAuthorizationError, isNotFoundError, createErrorResponse , extractDetailedErrorInfo } from "../../../../../utils/errorHandlers.js";
import type { schemaMenuItemSchemas } from "../../schemas.js";

/**
 * Handler function for updating a DatoCMS schema menu item
 */
export const updateSchemaMenuItemHandler = async (args: z.infer<typeof schemaMenuItemSchemas.update>) => {
  const { 
    apiToken, 
    schemaMenuItemId,
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
    const client = getClient(apiToken, environment);
    
    try {
      // Create schema menu item update payload (only including defined fields)
      const payload: Record<string, any> = {};

      // Add fields only if they are defined
      if (label !== undefined) payload.label = label;
      if (position !== undefined) payload.position = position;
      if (external_url !== undefined) payload.external_url = external_url;
      if (parent_id !== undefined) payload.parent_id = parent_id;
      if (type !== undefined) payload.type = type;
      
      // Add type-specific attributes if provided
      if (attributes) {
        payload.attributes = {};
        
        // Add attributes based on the type if specified
        if (type) {
          switch (type) {
            case "model":
              if (attributes.model_id) {
                payload.attributes.model_id = attributes.model_id;
              }
              break;
            case "custom_page":
              if (attributes.custom_page_id) {
                payload.attributes.custom_page_id = attributes.custom_page_id;
              }
              break;
            case "plugin":
              if (attributes.plugin_id) {
                payload.attributes.plugin_id = attributes.plugin_id;
              }
              if (attributes.plugin_base_url) {
                payload.attributes.plugin_base_url = attributes.plugin_base_url;
              }
              if (attributes.plugin_parameters) {
                payload.attributes.plugin_parameters = attributes.plugin_parameters;
              }
              if (attributes.plugin_name) {
                payload.attributes.plugin_name = attributes.plugin_name;
              }
              if (attributes.plugin_icon_url) {
                payload.attributes.plugin_icon_url = attributes.plugin_icon_url;
              }
              break;
            case "models_group":
              if (attributes.models_filter) {
                payload.attributes.models_filter = attributes.models_filter;
              }
              break;
            case "block_models_group":
              if (attributes.block_models_filter) {
                payload.attributes.block_models_filter = attributes.block_models_filter;
              }
              break;
          }
        } else {
          // If no type is specified, add all provided attributes
          // This allows updating attributes without specifying type
          if (attributes.model_id !== undefined) payload.attributes.model_id = attributes.model_id;
          if (attributes.custom_page_id !== undefined) payload.attributes.custom_page_id = attributes.custom_page_id;
          if (attributes.plugin_id !== undefined) payload.attributes.plugin_id = attributes.plugin_id;
          if (attributes.plugin_base_url !== undefined) payload.attributes.plugin_base_url = attributes.plugin_base_url;
          if (attributes.plugin_parameters !== undefined) payload.attributes.plugin_parameters = attributes.plugin_parameters;
          if (attributes.plugin_name !== undefined) payload.attributes.plugin_name = attributes.plugin_name;
          if (attributes.plugin_icon_url !== undefined) payload.attributes.plugin_icon_url = attributes.plugin_icon_url;
          if (attributes.models_filter !== undefined) payload.attributes.models_filter = attributes.models_filter;
          if (attributes.block_models_filter !== undefined) payload.attributes.block_models_filter = attributes.block_models_filter;
        }
        
        // If attributes object is empty, don't include it in the payload
        if (Object.keys(payload.attributes).length === 0) {
          delete payload.attributes;
        }
      }
      
      // Update the schema menu item
      const updatedSchemaMenuItem = await client.schemaMenuItems.update(schemaMenuItemId, payload);
      
      // If no item returned, return error
      if (!updatedSchemaMenuItem) {
        return createErrorResponse(`Error: Failed to update schema menu item with ID '${schemaMenuItemId}'.`);
      }

      // Return the updated schema menu item
      return createResponse(JSON.stringify(updatedSchemaMenuItem, null, 2));
      
    } catch (apiError: unknown) {
      if (isAuthorizationError(apiError)) {
        return createErrorResponse("Error: Please provide a valid DatoCMS API token. The token you provided was rejected by the DatoCMS API.");
      }
      
      if (isNotFoundError(apiError)) {
        return createErrorResponse(`Error: Schema menu item with ID '${schemaMenuItemId}' was not found.`);
      }
      
      // Re-throw other API errors to be caught by the outer catch
      throw apiError;
    }
  } catch (error: unknown) {
    return createErrorResponse(`Error updating DatoCMS schema menu item: ${extractDetailedErrorInfo(error)}`);
  }
};