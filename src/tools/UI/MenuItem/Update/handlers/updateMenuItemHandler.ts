/**
 * @file updateMenuItemHandler.ts
 * @description Handler for updating a DatoCMS menu item
 */

import { createUpdateHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { menuItemSchemas } from "../../schemas.js";
import { createTypedUIClient } from "../../../uiClient.js";
import { MenuItemUpdateParams } from "../../../uiTypes.js";

/**
 * Handler function for updating a DatoCMS menu item
 */
export const updateMenuItemHandler = createUpdateHandler({
  domain: "ui.menuItem",
  schemaName: "update",
  schema: menuItemSchemas.update,
  entityName: "Menu Item",
  idParam: "menuItemId",
  clientAction: async (client, args) => {
    const typedClient = createTypedUIClient(client);
    
    // Create menu item update payload (only including defined fields)
    const payload: MenuItemUpdateParams = {};

    // Add fields only if they are defined
    if (args.label !== undefined) payload.label = args.label;
    if (args.position !== undefined) payload.position = args.position;
    if (args.external_url !== undefined) payload.external_url = args.external_url;
    if (args.open_in_new_tab !== undefined) payload.open_in_new_tab = args.open_in_new_tab;
    if (args.parent_id !== undefined) payload.parent_id = args.parent_id;
    if (args.item_type_id !== undefined) payload.item_type_id = args.item_type_id;
    if (args.item_type_filter_id !== undefined) payload.item_type_filter_id = args.item_type_filter_id;
    
    // Update the menu item
    return await typedClient.updateMenuItem(args.menuItemId, payload);
  }
});