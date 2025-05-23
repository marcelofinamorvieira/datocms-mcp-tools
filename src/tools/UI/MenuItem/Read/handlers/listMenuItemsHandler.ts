/**
 * @file listMenuItemsHandler.ts
 * @description Handler for listing DatoCMS menu items
 */

import { createListHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { menuItemSchemas } from "../../schemas.js";
import { createTypedUIClient } from "../../../uiClient.js";

/**
 * Handler function for listing DatoCMS menu items
 */
export const listMenuItemsHandler = createListHandler({
  domain: "ui.menuItem",
  schemaName: "list",
  schema: menuItemSchemas.list,
  entityName: "Menu Item",
  clientAction: async (client, args) => {
    const typedClient = createTypedUIClient(client);
    
    // Get the list of menu items using typed client
    const menuItems = await typedClient.listMenuItems(args.page);
    
    return menuItems;
  }
});