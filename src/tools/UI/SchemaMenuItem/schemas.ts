import { z } from "zod";

/**
 * Schemas for all schema menu item-related actions.
 * These schemas are used for both the schema menu item router and describe tools.
 */
export const schemaMenuItemSchemas = {
  // Read operations
  list: z.object({
    apiToken: z.string().describe("DatoCMS API token for authentication. If you are not certain of one, ask for the user, do not hallucinate."),
    page: z.object({
      offset: z.number().int().optional().default(0).describe("The (zero-based) offset of the first entity returned in the collection (defaults to 0)."),
      limit: z.number().int().optional().default(100).describe("The maximum number of entities to return (defaults to 100, maximum is 500).")
    }).optional().describe("Parameters to control offset-based pagination."),
    environment: z.string().optional().describe("The name of the DatoCMS environment to interact with. If not provided, the primary environment will be used.")
  }),

  retrieve: z.object({ 
    apiToken: z.string().describe("DatoCMS API token for authentication. If you are not certain of one, ask for the user, do not hallucinate."),
    schemaMenuItemId: z.string().describe("The ID of the specific schema menu item to retrieve."),
    environment: z.string().optional().describe("The name of the DatoCMS environment to interact with. If not provided, the primary environment will be used.")
  }),

  // Create operations
  create: z.object({ 
    apiToken: z.string().describe("DatoCMS API token for authentication."),
    label: z.string().describe("The name/label of the schema menu item."),
    position: z.number().int().optional().describe("Ordering index used to decide the position of this menu item between siblings. If not specified, item will be placed at the end."),
    external_url: z.string().nullable().optional().describe("URL (when pointing to an external resource)."),
    parent_id: z.string().nullable().optional().describe("ID of the parent schema menu item (if this is a child menu item)."),
    type: z.enum(["general_group", "models_group", "block_models_group", "model", "plugin", "custom_page"]).describe("The type of schema menu item. One of: general_group, models_group, block_models_group, model, plugin, custom_page."),
    attributes: z.object({
      model_id: z.string().optional().describe("ID of the model linked by this menu item (required only when type=model)."),
      custom_page_id: z.string().optional().describe("ID of the custom page linked by this menu item (required only when type=custom_page)."),
      plugin_id: z.string().optional().describe("ID of the plugin linked by this menu item (required only when type=plugin)."),
      models_filter: z.string().optional().describe("Filter to apply on models (only for models_group type)"),
      block_models_filter: z.string().optional().describe("Filter to apply on block models (only for block_models_group type)"),
      plugin_base_url: z.string().optional().describe("Base URL for the plugin (only for plugin type)"),
      plugin_parameters: z.record(z.any()).optional().describe("Parameters for the plugin (only for plugin type)"),
      plugin_name: z.string().optional().describe("Name of the plugin (only for plugin type)"),
      plugin_icon_url: z.string().optional().describe("URL of the plugin icon (only for plugin type)")
    }).optional().describe("Additional attributes based on the type of schema menu item."),
    environment: z.string().optional().describe("The name of the DatoCMS environment to interact with. If not provided, the primary environment will be used.")
  }),

  // Update operations
  update: z.object({ 
    apiToken: z.string().describe("DatoCMS API token for authentication."),
    schemaMenuItemId: z.string().describe("The ID of the schema menu item to update."),
    label: z.string().optional().describe("The name/label of the schema menu item."),
    position: z.number().int().optional().describe("Ordering index used to decide the position of this menu item between siblings."),
    external_url: z.string().nullable().optional().describe("URL (when pointing to an external resource)."),
    parent_id: z.string().nullable().optional().describe("ID of the parent schema menu item (if this is a child menu item)."),
    type: z.enum(["general_group", "models_group", "block_models_group", "model", "plugin", "custom_page"]).optional().describe("The type of schema menu item. One of: general_group, models_group, block_models_group, model, plugin, custom_page."),
    attributes: z.object({
      model_id: z.string().optional().describe("ID of the model linked by this menu item (required only when type=model)."),
      custom_page_id: z.string().optional().describe("ID of the custom page linked by this menu item (required only when type=custom_page)."),
      plugin_id: z.string().optional().describe("ID of the plugin linked by this menu item (required only when type=plugin)."),
      models_filter: z.string().optional().describe("Filter to apply on models (only for models_group type)"),
      block_models_filter: z.string().optional().describe("Filter to apply on block models (only for block_models_group type)"),
      plugin_base_url: z.string().optional().describe("Base URL for the plugin (only for plugin type)"),
      plugin_parameters: z.record(z.any()).optional().describe("Parameters for the plugin (only for plugin type)"),
      plugin_name: z.string().optional().describe("Name of the plugin (only for plugin type)"),
      plugin_icon_url: z.string().optional().describe("URL of the plugin icon (only for plugin type)")
    }).optional().describe("Additional attributes based on the type of schema menu item."),
    environment: z.string().optional().describe("The name of the DatoCMS environment to interact with. If not provided, the primary environment will be used.")
  }),

  // Delete operations
  delete: z.object({ 
    apiToken: z.string().describe("DatoCMS API token for authentication."),
    schemaMenuItemId: z.string().describe("The ID of the schema menu item to delete."),
    environment: z.string().optional().describe("The name of the DatoCMS environment to interact with. If not provided, the primary environment will be used.")
  })
};

// Create an array of all available schema menu item actions for the enum
export const schemaMenuItemActionsList = Object.keys(schemaMenuItemSchemas) as Array<keyof typeof schemaMenuItemSchemas>;