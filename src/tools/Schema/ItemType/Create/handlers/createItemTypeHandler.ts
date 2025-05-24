/**
 * @file createItemTypeHandler.ts
 * @description Handler for creating new DatoCMS Item Types
 */

import { createCreateHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { schemaSchemas } from "../../../schemas.js";
import type { SimpleSchemaTypes } from "@datocms/cma-client-node";

/**
 * Handler to create a new Item Type in DatoCMS
 */
export const createItemTypeHandler = createCreateHandler({
  domain: "schema",
  schemaName: "create_item_type",
  schema: schemaSchemas.create_item_type,
  entityName: "ItemType",
  successMessage: (itemType: SimpleSchemaTypes.ItemType) => `Item type '${itemType.name}' created successfully with ID: ${itemType.id}`,
  clientAction: async (client, args) => {
    const {
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
      tree
    } = args;

    // Enforce singular API key naming
    if (apiKey && apiKey.endsWith('s')) {
      throw new Error(
        "Item type apiKey must be singular (avoid trailing 's'). Example: 'article' instead of 'articles'."
      );
    }

    // Modular block item types must not have draft mode active
    if (modularBlock === true && draftModeActive !== false) {
      throw new Error(
        "Modular block models require draftModeActive set to false."
      );
    }
    
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
    
    return createdItemType;
  }
});