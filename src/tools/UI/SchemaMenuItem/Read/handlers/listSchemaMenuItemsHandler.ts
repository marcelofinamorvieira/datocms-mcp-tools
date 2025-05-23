/**
 * @file listSchemaMenuItemsHandler.ts
 * @description Handler for listing DatoCMS schema menu items
 */

import { createListHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { schemaMenuItemSchemas } from "../../schemas.js";
import { createTypedUIClient } from "../../../uiClient.js";

/**
 * Handler function for listing DatoCMS schema menu items
 */
export const listSchemaMenuItemsHandler = createListHandler({
  domain: "ui.schemaMenuItem",
  schemaName: "list",
  schema: schemaMenuItemSchemas.list,
  entityName: "Schema Menu Item",
  listGetter: async (client, args) => {
    const typedClient = createTypedUIClient(client);
    
    // Get the list of schema menu items
    const schemaMenuItems = await typedClient.listSchemaMenuItems(args.page);
    
    return schemaMenuItems;
  },
  countGetter: async (client) => {
    const typedClient = createTypedUIClient(client);
    
    // Get all schema menu items to count them (API doesn't provide count endpoint)
    const allItems = await typedClient.listSchemaMenuItems();
    
    return allItems.length;
  }
});
