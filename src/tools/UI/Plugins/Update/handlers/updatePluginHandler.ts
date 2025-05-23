/**
 * @file updatePluginHandler.ts
 * @description Handler for updating a DatoCMS plugin
 */

import { createUpdateHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { pluginSchemas } from "../../schemas.js";
import { createTypedUIClient } from "../../../uiClient.js";
import { PluginUpdateParams } from "../../../uiTypes.js";

/**
 * Handler function for updating a DatoCMS plugin
 */
export const updatePluginHandler = createUpdateHandler({
  domain: "ui.plugin",
  schemaName: "update",
  schema: pluginSchemas.update,
  entityName: "Plugin",
  idParam: "pluginId",
  clientAction: async (client, args) => {
    const typedClient = createTypedUIClient(client);
    
    // Create update payload with only provided fields
    const payload: PluginUpdateParams = {};

    // Add fields that are defined
    if (args.name !== undefined) payload.name = args.name;
    if (args.description !== undefined) payload.description = args.description;
    if (args.url !== undefined) payload.url = args.url;
    if (args.parameters !== undefined) payload.parameters = args.parameters;
    if (args.package_name !== undefined) payload.package_name = args.package_name;
    if (args.package_version !== undefined) payload.package_version = args.package_version;
    if (args.permissions !== undefined) payload.permissions = args.permissions;
    
    // Update the plugin
    return await typedClient.updatePlugin(args.pluginId, payload);
  }
});