import { z } from "zod";

/**
 * Schemas for all plugin-related actions.
 * These schemas are used for both the plugin router and describe tools.
 */

// Define the permission schema
const permissionSchema = z.string().describe("Permission for the plugin.");

// Define the parameters schema as a flexible record
const parametersSchema = z.record(z.any()).describe("Configuration object for the plugin.");

// Define the base schema for plugin operations (common parameters)
const pluginBaseSchema = z.object({
  apiToken: z.string().describe("DatoCMS API token for authentication. If you are not certain of one, ask for the user, do not hallucinate."),
  environment: z.string().optional().describe("The name of the DatoCMS environment to interact with. If not provided, the primary environment will be used.")
});

// Define the plugin schemas for all operations
export const pluginSchemas = {
  // Read operations
  list: pluginBaseSchema.extend({
    page: z.object({
      offset: z.number().int().optional().default(0).describe("The (zero-based) offset of the first entity returned in the collection (defaults to 0)."),
      limit: z.number().int().optional().default(100).describe("The maximum number of entities to return (defaults to 100, maximum is 500).")
    }).optional().describe("Parameters to control offset-based pagination.")
  }),

  retrieve: pluginBaseSchema.extend({
    pluginId: z.string().describe("The ID of the specific plugin to retrieve.")
  }),

  // Create operations
  create: pluginBaseSchema.extend({
    name: z.string().describe("The name of the plugin."),
    description: z.string().optional().describe("A description of the plugin."),
    url: z.string().describe("The URL of the plugin's entry point."),
    parameters: parametersSchema.optional().describe("A configuration object for the plugin."),
    package_name: z.string().optional().describe("The NPM package name of the plugin."),
    package_version: z.string().optional().describe("The version of the NPM package."),
    permissions: z.array(permissionSchema).optional().describe("Array of permissions granted to the plugin.")
  }),

  // Update operations
  update: pluginBaseSchema.extend({
    pluginId: z.string().describe("The ID of the plugin to update."),
    name: z.string().optional().describe("The name of the plugin."),
    description: z.string().optional().describe("A description of the plugin."),
    url: z.string().optional().describe("The URL of the plugin's entry point."),
    parameters: parametersSchema.optional().describe("A configuration object for the plugin."),
    package_name: z.string().optional().describe("The NPM package name of the plugin."),
    package_version: z.string().optional().describe("The version of the NPM package."),
    permissions: z.array(permissionSchema).optional().describe("Array of permissions granted to the plugin.")
  }),

  // Delete operations
  delete: pluginBaseSchema.extend({
    pluginId: z.string().describe("The ID of the plugin to delete.")
  }),

  // Fields operation
  fields: pluginBaseSchema.extend({
    pluginId: z.string().describe("The ID of the plugin to retrieve fields for.")
  })
};

// Create an array of all available plugin actions for the enum
export const pluginActionsList = Object.keys(pluginSchemas) as Array<keyof typeof pluginSchemas>;