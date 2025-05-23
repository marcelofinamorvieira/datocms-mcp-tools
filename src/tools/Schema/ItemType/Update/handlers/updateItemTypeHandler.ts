/**
 * @file updateItemTypeHandler.ts
 * @description Handler for updating existing DatoCMS Item Types
 */

import { createUpdateHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { schemaSchemas } from "../../../schemas.js";

/**
 * Handler to update an existing Item Type in DatoCMS
 */
export const updateItemTypeHandler = createUpdateHandler({
  domain: "schema",
  schemaName: "update_item_type",
  schema: schemaSchemas.update_item_type,
  entityName: "ItemType",
  idParam: "itemTypeId",
  successMessage: "Item type updated successfully",
  clientAction: async (client, args) => {
    const { 
      itemTypeId, 
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
    
    // Prepare update data (only include fields that are provided)
    const updateData: Record<string, unknown> = {};
    
    if (name !== undefined) updateData.name = name;
    if (apiKey !== undefined) updateData.api_key = apiKey;
    if (allLocalesRequired !== undefined) updateData.all_locales_required = allLocalesRequired;
    if (draftModeActive !== undefined) updateData.draft_mode_active = draftModeActive;
    if (modularBlock !== undefined) updateData.modular_block = modularBlock;
    if (orderingDirection !== undefined) updateData.ordering_direction = orderingDirection;
    if (orderingField !== undefined) updateData.ordering_field = orderingField;
    if (singleton !== undefined) updateData.singleton = singleton;
    if (sortable !== undefined) updateData.sortable = sortable;
    if (titleField !== undefined) updateData.title_field = titleField;
    if (tree !== undefined) updateData.tree = tree;
    
    // Update the item type
    return await client.itemTypes.update(itemTypeId, updateData);
  }
});