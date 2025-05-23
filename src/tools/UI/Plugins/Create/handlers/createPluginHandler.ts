/**
 * @file createPluginHandler.ts
 * @description Handler for creating a DatoCMS plugin
 */

import { createCreateHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { pluginSchemas } from "../../schemas.js";
import { createTypedUIClient } from "../../../uiClient.js";
import { z } from "zod";

/**
 * Handler function for creating a DatoCMS plugin
 */
export const createPluginHandler = createCreateHandler({
  domain: "ui.plugin",
  schemaName: "create",
  schema: pluginSchemas.create,
  entityName: "Plugin",
  successMessage: (result: any) => `Successfully created plugin '${result.name}' with ID ${result.id}`,
  clientAction: async (client, args: z.infer<typeof pluginSchemas.create>) => {
    const typedClient = createTypedUIClient(client);
    
    // Create plugin payload
    // Note: description, parameters, package_version, and permissions are part of the schema
    // but not in the type definition. We pass them directly to the API which accepts them
    const payload: any = {
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