/**
 * @file updatePluginHandler.ts
 * @description Handler for updating a DatoCMS plugin
 */

import { createUpdateHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { pluginSchemas } from "../../schemas.js";
import { createTypedUIClient } from "../../../uiClient.js";
import { z } from "zod";

/**
 * Handler function for updating a DatoCMS plugin
 */
export const updatePluginHandler = createUpdateHandler({
  domain: "ui.plugin",
  schemaName: "update",
  schema: pluginSchemas.update,
  entityName: "Plugin",
  idParam: "pluginId",
  clientAction: async (client, args: z.infer<typeof pluginSchemas.update>) => {
    const typedClient = createTypedUIClient(client);
    
    // Create update payload with only provided fields
    // Note: description, parameters, package_version, and permissions are part of the schema
    // but not in the type definition. We pass them directly to the API which accepts them
    const payload: any = {};

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