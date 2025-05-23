/**
 * @file createPluginHandler.ts
 * @description Handler for creating a DatoCMS plugin
 */

import { createCreateHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { pluginSchemas } from "../../schemas.js";
import { createTypedUIClient } from "../../../uiClient.js";
import { PluginCreateParams } from "../../../uiTypes.js";

/**
 * Handler function for creating a DatoCMS plugin
 */
export const createPluginHandler = createCreateHandler({
  domain: "ui.plugin",
  schemaName: "create",
  schema: pluginSchemas.create,
  entityName: "Plugin",
  clientAction: async (client, args) => {
    const typedClient = createTypedUIClient(client);
    
    // Create plugin payload
    const payload: PluginCreateParams = {
      name: args.name,
      url: args.url
    };

    // Add optional fields if they are defined
    if (args.description !== undefined) payload.description = args.description;
    if (args.parameters !== undefined) payload.parameters = args.parameters;
    if (args.package_name !== undefined) payload.package_name = args.package_name;
    if (args.package_version !== undefined) payload.package_version = args.package_version;
    if (args.permissions !== undefined) payload.permissions = args.permissions;
    
    // Create the plugin
    return await typedClient.createPlugin(payload);
  }
});