/**
 * @file createItemTypeHandler.ts
 * @description Handler for creating new DatoCMS Item Types
 */

import type { z } from "zod";
import { getClient } from "../../../../../utils/clientManager.js";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { isAuthorizationError, createErrorResponse , extractDetailedErrorInfo } from "../../../../../utils/errorHandlers.js";
import type { schemaSchemas } from "../../../schemas.js";

/**
 * Handler to create a new Item Type in DatoCMS
 */
export const createItemTypeHandler = async (args: z.infer<typeof schemaSchemas.create_item_type>) => {
  const {
    apiToken,
    name,
    apiKey,
    allLocalesRequired,
    draftModeActive,
    modularBlock,
    orderingDirection, 
    orderingField, 
    singleton, 
    sortable, 
    titleField, 
    tree, 
    environment 
  } = args;

  // Enforce singular API key naming
  if (apiKey && apiKey.endsWith('s')) {
    return createErrorResponse(
      "Item type apiKey must be singular (avoid trailing 's'). Example: 'article' instead of 'articles'."
    );
  }

  // Modular block item types must not have draft mode active
  if (modularBlock === true && draftModeActive !== false) {
    return createErrorResponse(
      "Modular block models require draftModeActive set to false."
    );
  }
  
  try {
    // Initialize DatoCMS client
    const client = getClient(apiToken, environment);
    
    try {
      // Create the item type
      const itemTypeData = {
        name,
        api_key: apiKey,
        all_locales_required: allLocalesRequired,
        draft_mode_active: draftModeActive,
        modular_block: modularBlock,
        ordering_direction: orderingDirection,
        ordering_field: orderingField,
        singleton,
        sortable,
        title_field: titleField,
        tree
      };
      
      // Remove undefined values
      const cleanedItemTypeData = Object.fromEntries(
        Object.entries(itemTypeData).filter(([_, v]) => v !== undefined)
      );

      // Create the item type with required parameters
      const createdItemType = await client.itemTypes.create({
        name: name, // Required string parameter
        api_key: apiKey, // Required string parameter
        ...Object.entries(cleanedItemTypeData)
          .filter(([k, v]) => v !== undefined && !['name', 'api_key'].includes(k))
          .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {})
      });
      
      return createResponse(JSON.stringify(createdItemType, null, 2));
      
    } catch (apiError: unknown) {
      if (isAuthorizationError(apiError)) {
        return createErrorResponse("Error: Please provide a valid DatoCMS API token. The token you provided was rejected by the DatoCMS API.");
      }
      
      // Re-throw other API errors to be caught by the outer catch
      throw apiError;
    }
  } catch (error: unknown) {
    return createErrorResponse(`Error creating item type: ${extractDetailedErrorInfo(error)}`);
  }
};