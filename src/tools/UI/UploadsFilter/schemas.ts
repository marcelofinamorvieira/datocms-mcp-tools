import { z } from "zod";
import { baseToolSchema } from "../../../utils/sharedSchemas.js";

/**
 * Schemas for all uploads filter-related actions.
 * These schemas are used for both the uploads filter router and describe tools.
 */
export const uploadsFilterSchemas = {
  // Read operations
  list: baseToolSchema.extend({
    page: z.object({
      offset: z.number().int().optional().default(0).describe("The (zero-based) offset of the first entity returned in the collection (defaults to 0)."),
      limit: z.number().int().optional().default(100).describe("The maximum number of entities to return (defaults to 100, maximum is 500).")
    }).optional().describe("Parameters to control offset-based pagination.")
  }),

  retrieve: baseToolSchema.extend({ 
    uploadsFilterId: z.string().describe("The ID of the specific uploads filter to retrieve.")
  }),

  // Create operations
  create: baseToolSchema.extend({ 
    name: z.string().describe("The name of the uploads filter."),
    payload: z.record(z.any()).describe("The filter payload. The payload structure depends on the filter type.")
  }),

  // Update operations
  update: baseToolSchema.extend({ 
    uploadsFilterId: z.string().describe("The ID of the uploads filter to update."),
    name: z.string().optional().describe("The name of the uploads filter."),
    payload: z.record(z.any()).optional().describe("The filter payload. The payload structure depends on the filter type.")
  }),

  // Delete operations
  delete: baseToolSchema.extend({ 
    uploadsFilterId: z.string().describe("The ID of the uploads filter to delete.")
  })
};

// Create an array of all available uploads filter actions for the enum
export const uploadsFilterActionsList = Object.keys(uploadsFilterSchemas) as Array<keyof typeof uploadsFilterSchemas>;