import { z } from "zod";
import { baseToolSchema } from "../../utils/sharedSchemas.js";

/**
 * Schemas for all project-related actions.
 * These schemas are extracted from the original project tool definitions
 * and are used for both the projects router and parameter tools.
 */
export const projectSchemas = {
  // Project info operations
  get_info: baseToolSchema,

  // Site settings operations
  update_site_settings: baseToolSchema.extend({
    settings: z.record(z.any()).describe("Object containing site settings to update. Keys can include 'name', 'locales', 'timezone', etc. Only the fields you want to update need to be included.")
  })
};

// Create an array of all available project actions for the enum
export const projectActionsList = Object.keys(projectSchemas) as Array<keyof typeof projectSchemas>;
