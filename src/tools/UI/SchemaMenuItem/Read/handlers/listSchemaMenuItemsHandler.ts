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
  clientAction: async (client, args) => {
    const typedClient = createTypedUIClient(client);
    
    // Get the list of schema menu items
    const schemaMenuItems = await typedClient.listSchemaMenuItems(args.page);
    
    return schemaMenuItems;
  }
});
