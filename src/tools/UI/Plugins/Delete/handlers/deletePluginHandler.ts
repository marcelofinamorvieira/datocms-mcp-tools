/**
 * @file deletePluginHandler.ts
 * @description Handler for deleting a DatoCMS plugin
 */

import { createDeleteHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { pluginSchemas } from "../../schemas.js";
import { createTypedUIClient } from "../../../uiClient.js";

/**
 * Handler function for deleting a DatoCMS plugin
 */
export const deletePluginHandler = createDeleteHandler({
  domain: "ui.plugin",
  schemaName: "delete",
  schema: pluginSchemas.delete,
  entityName: "Plugin",
  idParam: "pluginId",
  clientAction: async (client, args) => {
    const typedClient = createTypedUIClient(client);
    
    // Delete the plugin
    await typedClient.deletePlugin(args.pluginId);
  }
});