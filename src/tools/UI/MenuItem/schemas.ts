import { z } from "zod";
import { baseToolSchema } from "../../../utils/sharedSchemas.js";

/**
 * Schemas for all menu item-related actions.
 * These schemas are used for both the menu item router and describe tools.
 */
export const menuItemSchemas = {
  // Read operations
  list: baseToolSchema.extend({
    page: z.object({
      offset: z.number().int().optional().default(0).describe("The (zero-based) offset of the first entity returned in the collection (defaults to 0)."),
      limit: z.number().int().optional().default(100).describe("The maximum number of entities to return (defaults to 100, maximum is 500).")
    }).optional().describe("Parameters to control offset-based pagination.")
  }),

  retrieve: baseToolSchema.extend({ 
    menuItemId: z.string().describe("The ID of the specific menu item to retrieve.")
  }),

  // Create operations
  create: baseToolSchema.extend({ 
    label: z.string().describe("The name/label of the menu item."),
    position: z.number().int().optional().describe("Ordering index used to decide the position of this menu item between siblings. If not specified, item will be placed at the end."),
    external_url: z.string().nullable().optional().describe("URL (when pointing to an external resource)."),
    open_in_new_tab: z.boolean().optional().default(false).describe("Whether the link should open in a new browser tab."),
    parent_id: z.string().nullable().optional().describe("ID of the parent menu item (if this is a child menu item)."),
    item_type_id: z.string().nullable().optional().describe("ID of the item type linked by this menu item (if applicable)."),
    item_type_filter_id: z.string().nullable().optional().describe("ID of the filter to apply on the item type (if applicable).")
  }),

  // Update operations
  update: baseToolSchema.extend({ 
    menuItemId: z.string().describe("The ID of the menu item to update."),
    label: z.string().optional().describe("The name/label of the menu item."),
    position: z.number().int().optional().describe("Ordering index used to decide the position of this menu item between siblings."),
    external_url: z.string().nullable().optional().describe("URL (when pointing to an external resource)."),
    open_in_new_tab: z.boolean().optional().describe("Whether the link should open in a new browser tab."),
    parent_id: z.string().nullable().optional().describe("ID of the parent menu item (if this is a child menu item)."),
    item_type_id: z.string().nullable().optional().describe("ID of the item type linked by this menu item (if applicable)."),
    item_type_filter_id: z.string().nullable().optional().describe("ID of the filter to apply on the item type (if applicable).")
  }),

  // Delete operations
  delete: baseToolSchema.extend({ 
    menuItemId: z.string().describe("The ID of the menu item to delete."),
    force: z.boolean().optional().default(false).describe("If true, the item will be deleted even if it has children. If false and the item has children, an error will be returned.")
  })
};

// Create an array of all available menu item actions for the enum
export const menuItemActionsList = Object.keys(menuItemSchemas) as Array<keyof typeof menuItemSchemas>;