/**
 * @file retrieveSchemaMenuItemHandler.ts
 * @description Handler for retrieving a single DatoCMS schema menu item
 */

import { createRetrieveHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { schemaMenuItemSchemas } from "../../schemas.js";
import { createTypedUIClient } from "../../../uiClient.js";

/**
 * Handler function for retrieving a single DatoCMS schema menu item
 */
export const retrieveSchemaMenuItemHandler = createRetrieveHandler({
  domain: "ui.schemaMenuItem",
  schemaName: "retrieve",
  schema: schemaMenuItemSchemas.retrieve,
  entityName: "Schema Menu Item",
  idParam: "schemaMenuItemId",
  clientAction: async (client, args) => {
    const typedClient = createTypedUIClient(client);
    
    // Get the schema menu item
    return await typedClient.findSchemaMenuItem(args.schemaMenuItemId);
  }
});
