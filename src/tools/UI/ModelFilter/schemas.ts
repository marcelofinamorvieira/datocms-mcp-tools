import { z } from "zod";

const modelFilterBaseSchema = z.object({
  apiToken: z.string().describe("DatoCMS API token for authentication."),
  environment: z.string().optional().describe("The environment to use; if not specified, the primary environment is used."),
});

const columnSchema = z.object({
  name: z.string().describe("Name of the column."),
  width: z.number().describe("Width of the column (sum of all columns should be 1.0)."),
});

const filterSchema = z.object({
  query: z.string().optional().describe("Search query for filtering."),
  fields: z.record(z.any()).optional().describe("Field-specific filters."),
}).optional();

// Schema for model filter operations
export const modelFilterSchemas = {
  // List operation
  list: modelFilterBaseSchema,

  // Retrieve operation
  retrieve: modelFilterBaseSchema.extend({
    modelFilterId: z.string().describe("ID of the model filter to retrieve."),
  }),

  // Create operation
  create: modelFilterBaseSchema.extend({
    name: z.string().describe("Name of the model filter."),
    item_type: z.string().describe("ID of the item type this filter applies to."),
    filter: filterSchema,
    columns: z.array(columnSchema).optional().describe("Columns to display in the records view."),
    order_by: z.string().optional().describe("Field to order records by, e.g., '_updated_at_ASC'."),
    shared: z.boolean().optional().default(false).describe("Whether this filter is shared with all users."),
  }),

  // Update operation
  update: modelFilterBaseSchema.extend({
    modelFilterId: z.string().describe("ID of the model filter to update."),
    name: z.string().optional().describe("Name of the model filter."),
    filter: filterSchema,
    columns: z.array(columnSchema).optional().describe("Columns to display in the records view."),
    order_by: z.string().optional().describe("Field to order records by, e.g., '_updated_at_ASC'."),
    shared: z.boolean().optional().describe("Whether this filter is shared with all users."),
  }),

  // Delete operation
  delete: modelFilterBaseSchema.extend({
    modelFilterId: z.string().describe("ID of the model filter to delete."),
  }),
};

export const modelFilterSchemaKeys = Object.keys(modelFilterSchemas) as (keyof typeof modelFilterSchemas)[];