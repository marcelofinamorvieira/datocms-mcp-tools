/**
 * @file retrieveMenuItemHandler.ts
 * @description Handler for retrieving a single DatoCMS menu item
 */

import { createRetrieveHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { menuItemSchemas } from "../../schemas.js";
import { createTypedUIClient } from "../../../uiClient.js";

/**
 * Handler function for retrieving a single DatoCMS menu item
 */
export const retrieveMenuItemHandler = createRetrieveHandler({
  domain: "ui.menuItem",
  schemaName: "retrieve",
  schema: menuItemSchemas.retrieve,
  entityName: "Menu Item",
  idParam: "menuItemId",
  clientAction: async (client, args) => {
    const typedClient = createTypedUIClient(client);
    
    // Get the menu item using typed client
    return await typedClient.findMenuItem(args.menuItemId);
  }
});