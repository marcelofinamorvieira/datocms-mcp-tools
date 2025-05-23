/**
 * @file listPluginsHandler.ts
 * @description Handler for listing DatoCMS plugins
 */

import { createListHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { pluginSchemas } from "../../schemas.js";
import { createTypedUIClient } from "../../../uiClient.js";

/**
 * Handler function for listing DatoCMS plugins
 */
export const listPluginsHandler = createListHandler({
  domain: "ui.plugin",
  schemaName: "list",
  schema: pluginSchemas.list,
  entityName: "Plugin",
  clientAction: async (client, args) => {
    const typedClient = createTypedUIClient(client);
    
    // Get plugins with pagination parameters
    const plugins = await typedClient.listPlugins(args.page);
    
    return plugins;
  }
});