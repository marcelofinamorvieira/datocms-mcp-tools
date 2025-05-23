/**
 * @file createMenuItemHandler.ts
 * @description Handler for creating a DatoCMS menu item
 */

import { createCreateHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { menuItemSchemas } from "../../schemas.js";
import { createTypedUIClient } from "../../../uiClient.js";
import { MenuItemCreateParams } from "../../../uiTypes.js";

/**
 * Handler function for creating a DatoCMS menu item
 */
export const createMenuItemHandler = createCreateHandler({
  domain: "ui.menuItem",
  schemaName: "create",
  schema: menuItemSchemas.create,
  entityName: "Menu Item",
  successMessage: (result: any) => `Successfully created menu item '${result.label}' with ID ${result.id}`,
  clientAction: async (client, args) => {
    const typedClient = createTypedUIClient(client);
    
    // Create menu item payload with proper typing
    const payload: MenuItemCreateParams = {
      label: args.label
    };

    // Add optional fields if they are defined
    if (args.position !== undefined) payload.position = args.position;
    if (args.external_url !== undefined) payload.external_url = args.external_url;
    if (args.open_in_new_tab !== undefined) payload.open_in_new_tab = args.open_in_new_tab;
    if (args.parent_id !== undefined) payload.parent_id = args.parent_id;
    if (args.item_type_id !== undefined) payload.item_type_id = args.item_type_id;
    if (args.item_type_filter_id !== undefined) payload.item_type_filter_id = args.item_type_filter_id;
    
    // Create the menu item using typed client
    return await typedClient.createMenuItem(payload);
  }
});