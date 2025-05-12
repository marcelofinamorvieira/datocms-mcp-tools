import { z } from "zod";

/**
 * Schemas for all uploads filter-related actions.
 * These schemas are used for both the uploads filter router and describe tools.
 */
export const uploadsFilterSchemas = {
  // Read operations
  list: z.object({
    apiToken: z.string().describe("DatoCMS API token for authentication. If you are not certain of one, ask for the user, do not halucinate."),
    page: z.object({
      offset: z.number().int().optional().default(0).describe("The (zero-based) offset of the first entity returned in the collection (defaults to 0)."),
      limit: z.number().int().optional().default(100).describe("The maximum number of entities to return (defaults to 100, maximum is 500).")
    }).optional().describe("Parameters to control offset-based pagination."),
    environment: z.string().optional().describe("The name of the DatoCMS environment to interact with. If not provided, the primary environment will be used.")
  }),

  retrieve: z.object({ 
    apiToken: z.string().describe("DatoCMS API token for authentication. If you are not certain of one, ask for the user, do not halucinate."),
    uploadsFilterId: z.string().describe("The ID of the specific uploads filter to retrieve."),
    environment: z.string().optional().describe("The name of the DatoCMS environment to interact with. If not provided, the primary environment will be used.")
  }),

  // Create operations
  create: z.object({ 
    apiToken: z.string().describe("DatoCMS API token for authentication."),
    name: z.string().describe("The name of the uploads filter."),
    payload: z.record(z.any()).describe("The filter payload. The payload structure depends on the filter type."),
    environment: z.string().optional().describe("The name of the DatoCMS environment to interact with. If not provided, the primary environment will be used.")
  }),

  // Update operations
  update: z.object({ 
    apiToken: z.string().describe("DatoCMS API token for authentication."),
    uploadsFilterId: z.string().describe("The ID of the uploads filter to update."),
    name: z.string().optional().describe("The name of the uploads filter."),
    payload: z.record(z.any()).optional().describe("The filter payload. The payload structure depends on the filter type."),
    environment: z.string().optional().describe("The name of the DatoCMS environment to interact with. If not provided, the primary environment will be used.")
  }),

  // Delete operations
  delete: z.object({ 
    apiToken: z.string().describe("DatoCMS API token for authentication."),
    uploadsFilterId: z.string().describe("The ID of the uploads filter to delete."),
    environment: z.string().optional().describe("The name of the DatoCMS environment to interact with. If not provided, the primary environment will be used.")
  })
};

// Create an array of all available uploads filter actions for the enum
export const uploadsFilterActionsList = Object.keys(uploadsFilterSchemas) as Array<keyof typeof uploadsFilterSchemas>;