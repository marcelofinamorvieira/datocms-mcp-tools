/**
 * @file retrievePluginHandler.ts
 * @description Handler for retrieving a single DatoCMS plugin
 */

import { createRetrieveHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { pluginSchemas } from "../../schemas.js";
import { createTypedUIClient } from "../../../uiClient.js";

/**
 * Handler function for retrieving a single DatoCMS plugin
 */
export const retrievePluginHandler = createRetrieveHandler({
  domain: "ui.plugin",
  schemaName: "retrieve",
  schema: pluginSchemas.retrieve,
  entityName: "Plugin",
  idParam: "pluginId",
  clientAction: async (client, args) => {
    const typedClient = createTypedUIClient(client);
    
    // Get the plugin
    return await typedClient.findPlugin(args.pluginId);
  }
});