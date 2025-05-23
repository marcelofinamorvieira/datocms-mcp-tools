import { z } from "zod";
import { baseToolSchema } from "../../../utils/sharedSchemas.js";

/**
 * Schemas for all plugin-related actions.
 * These schemas are used for both the plugin router and describe tools.
 */

// Define the permission schema
const permissionSchema = z.string().describe("Permission for the plugin.");

// Define the parameters schema as a flexible record
const parametersSchema = z.record(z.any()).describe("Configuration object for the plugin.");

// Define the plugin schemas for all operations
export const pluginSchemas = {
  // Read operations
  list: baseToolSchema.extend({
    page: z.object({
      offset: z.number().int().optional().default(0).describe("The (zero-based) offset of the first entity returned in the collection (defaults to 0)."),
      limit: z.number().int().optional().default(100).describe("The maximum number of entities to return (defaults to 100, maximum is 500).")
    }).optional().describe("Parameters to control offset-based pagination.")
  }),

  retrieve: baseToolSchema.extend({
    pluginId: z.string().describe("The ID of the specific plugin to retrieve.")
  }),

  // Create operations
  create: baseToolSchema.extend({
    name: z.string().describe("The name of the plugin."),
    description: z.string().optional().describe("A description of the plugin."),
    url: z.string().describe("The URL of the plugin's entry point."),
    parameters: parametersSchema.optional().describe("A configuration object for the plugin."),
    package_name: z.string().optional().describe("The NPM package name of the plugin."),
    package_version: z.string().optional().describe("The version of the NPM package."),
    permissions: z.array(permissionSchema).optional().describe("Array of permissions granted to the plugin.")
  }),

  // Update operations
  update: baseToolSchema.extend({
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
  delete: baseToolSchema.extend({
    pluginId: z.string().describe("The ID of the plugin to delete.")
  }),

  // Fields operation
  fields: baseToolSchema.extend({
    pluginId: z.string().describe("The ID of the plugin to retrieve fields for.")
  })
};

// Create an array of all available plugin actions for the enum
export const pluginActionsList = Object.keys(pluginSchemas) as Array<keyof typeof pluginSchemas>;