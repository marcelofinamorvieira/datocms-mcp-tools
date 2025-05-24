import { z } from "zod";
import { 
  environmentSchema,
  paginationSchema,
  createBaseSchema,
  versionSchema as versionEnumSchema,
  returnOnlyIdsSchema,
  returnOnlyConfirmationSchema,
  orderBySchema
} from "../../utils/sharedSchemas.js";
import { filterConditions } from "./filterCondition.js";

/**
 * Record ID schema with validation
 */
const recordIdSchema = z.string()
  .min(1)
  .describe("The ID of the specific DatoCMS record.");

/**
 * Schema for building a record editor URL using project URL and item type
 */
const recordEditorUrlSchema = z.object({
  projectUrl: z.string()
    .describe(
      "DatoCMS project URL. If the user did not provide one yet, use the datocms_project tool with action 'get_info' to retrieve it. The URL will be under the internal_domain property."
    ),
  itemTypeId: z.string().describe(
    "The item type ID from DatoCMS, typically available in the item.item_type.id property of a record."
  ),
  itemId: recordIdSchema,
  environment: environmentSchema,
});

/**
 * Schemas for all record-related actions.
 * These schemas are extracted from the original record tool definitions
 * and are used for both the records router and describe tools.
 */
export const recordsSchemas = {
  // Read operations
  query: createBaseSchema().extend({
    textSearch: z.string().optional()
      .describe("SIMPLE TEXT SEARCH ONLY. Enter ONLY the raw search term (like 'searchTerm') with NO additional syntax. NOT a GraphQL query. NOT a filter. ONLY the exact word or phrase you want to find across all records. Examples: 'potato', 'dog', 'content management'."),
    ids: z.string().optional()
      .describe("Comma-separated list of DatoCMS record IDs to fetch (with no spaces), e.g.: 'abc123,def456'. Records can be from different models."),
    modelId: z.string().optional()
      .describe("Model ID to restrict results to. REQUIRED when using 'fields' parameter for field filtering."),
    modelName: z.string().optional()
      .describe("Model name to restrict results to. REQUIRED when using 'fields' parameter for field filtering."),
    fields: filterConditions.optional()
      .describe("Field filters to apply within a specific model. REQUIRES 'modelId' or 'modelName' to be specified. Example: {\"modelName\": \"author\", \"fields\": {\"name\": \"Emily\"}} finds authors named Emily. Supports operators: {\"name\": {\"eq\": \"value\"}} or simple equality: {\"name\": \"value\"}. Note: Filtering is applied after fetching records from the specified model."),
    locale: z.string().optional()
      .describe("Optional locale to use when filtering by localized fields. If not specified, environment's main locale will be used."),
    order_by: orderBySchema.optional(),
    version: versionEnumSchema,
    returnAllLocales: z.boolean().optional().default(false)
      .describe("If true, returns all locale versions for each field instead of only the most populated locale. Default is false to save on token usage."),
    returnOnlyIds: returnOnlyIdsSchema,
    page: paginationSchema.optional(),
    nested: z.boolean().optional().default(true)
      .describe("For Modular Content, Structured Text and Single Block fields. If set to true, returns full payload for nested blocks instead of just their IDs. Default is true."),
  }).refine((data) => {
    // Validate that field filtering requires model specification
    if (data.fields && Object.keys(data.fields).length > 0 && !data.modelId && !data.modelName && !data.textSearch) {
      return false;
    }
    return true;
  }, {
    message: "Field filtering requires either 'modelId' or 'modelName' to be specified. DatoCMS does not support cross-model field filtering.",
    path: ["fields"]
  }),

  get: createBaseSchema().extend({ 
    itemId: recordIdSchema,
    version: versionEnumSchema.optional().default("published"),
    returnAllLocales: z.boolean().optional().default(false)
      .describe("If true, returns all locale versions for each field instead of only the most populated locale. Default is false to save on token usage."),
    nested: z.boolean().optional().default(true)
      .describe("For Modular Content, Structured Text and Single Block fields. If set to true, returns full payload for nested blocks instead of just their IDs. Default is true."),
  }),

  references: createBaseSchema().extend({ 
    itemId: recordIdSchema,
    version: versionEnumSchema.optional().default("current"),
    returnAllLocales: z.boolean().optional().default(false)
      .describe("If true, returns all locale versions for each field instead of only the most populated locale. Default is false to save on token usage."),
    nested: z.boolean().optional().default(true)
      .describe("For Modular Content, Structured Text and Single Block fields. If set to true, returns full payload for nested blocks instead of just their IDs. Default is true."),
    returnOnlyIds: z.boolean().optional().default(true)
      .describe("If true, returns only an array of record IDs instead of complete records. Use this to save on tokens and context window space when only IDs are needed. Default is true."),
  }),

  record_url: recordEditorUrlSchema,

  // Create operations
  create: createBaseSchema().extend({
    itemType: z.string()
      .describe("The ID of the DatoCMS item type (model) for which to create a record."),
    data: z.record(z.unknown())
      .describe("The field values for the new record. For localized fields, provide an object with locale codes as keys (e.g., { title: { en: 'English Title', es: 'Spanish Title' } }). For non-localized fields, provide values directly (e.g., { count: 5 }). The structure depends on the field types in your model. You can use the Schema tools to check which fields are localized. Refer to DatoCMS Content Management API documentation for field type values: https://www.datocms.com/docs/content-management-api/resources/item/create#field-type-values."),
    meta: z.object({
      current_version: z.string().optional(),
      status: z.enum(["draft", "updated", "published"] as const).optional()
    }).optional()
      .describe("Optional metadata for the record"),
    returnOnlyConfirmation: returnOnlyConfirmationSchema,
  }),

  update: createBaseSchema().extend({
    itemId: recordIdSchema,
    data: z.record(z.unknown())
      .describe("The field values to update. Only include fields you want to modify. For localized fields, you MUST include values for ALL locales that should be preserved, not just the ones you're updating. Example: if a field 'title' already has values for 'en' and 'es' locales, and you want to update only the 'es' value, you must provide { title: { en: 'existing English title', es: 'new Spanish title' } }, otherwise the 'en' value will be deleted. The structure depends on the field types in your model. Use the Schema tools to check which fields are localized. Refer to DatoCMS Content Management API documentation for field type values: https://www.datocms.com/docs/content-management-api/resources/item/update#updating-fields."),
    version: z.string().optional()
      .describe("Optional version for optimistic locking. If provided, the update will fail if the record has been modified since this version."),
    meta: z.object({
      current_version: z.string().optional(),
      stage: z.string().optional()
    }).optional()
      .describe("Optional metadata for the record update, including version and workflow stage information"),
    returnOnlyConfirmation: returnOnlyConfirmationSchema,
  }),

  duplicate: createBaseSchema().extend({
    itemId: recordIdSchema,
    returnOnlyConfirmation: returnOnlyConfirmationSchema,
  }),

  // Delete operations
  destroy: createBaseSchema().extend({ 
    itemId: recordIdSchema,
    returnOnlyConfirmation: returnOnlyConfirmationSchema,
  }),

  bulk_destroy: createBaseSchema().extend({ 
    itemIds: z.array(z.string()).min(1)
      .describe("Array of record IDs to destroy."),
  }),

  // Publication operations
  publish: createBaseSchema().extend({ 
    itemId: recordIdSchema,
    content_in_locales: z.array(z.string()).optional()
      .describe("Optional array of locale codes to publish. If not provided, all locales will be published. If provided, non_localized_content must be provided as well."),
    non_localized_content: z.boolean().optional()
      .describe("Whether non-localized content will be published. If not provided and content_in_locales is missing, all content will be published. If provided, content_in_locales must be provided as well."),
    recursive: z.boolean().optional().default(false)
      .describe("When true, if the record belongs to a tree-like collection and any parent records aren't published, those parent records will be published as well. When false, an UNPUBLISHED_PARENT error will occur in such cases."),
  }).refine(
    data => {
      // If one of content_in_locales or non_localized_content is provided, both must be provided
      return (
        (data.content_in_locales === undefined && data.non_localized_content === undefined) ||
        (data.content_in_locales !== undefined && data.non_localized_content !== undefined)
      );
    },
    {
      message: "If content_in_locales is provided, non_localized_content must also be provided, and vice versa."
    }
  ),

  bulk_publish: createBaseSchema().extend({ 
    itemIds: z.array(z.string()).min(1)
      .describe("Array of record IDs to publish."),
    content_in_locales: z.array(z.string()).optional()
      .describe("Optional array of locale codes to publish. If not provided, all locales will be published. If provided, non_localized_content must be provided as well."),
    non_localized_content: z.boolean().optional()
      .describe("Whether non-localized content will be published. If not provided and content_in_locales is missing, all content will be published. If provided, content_in_locales must be provided as well."),
    recursive: z.boolean().optional().default(false)
      .describe("When true, if the record belongs to a tree-like collection and any parent records aren't published, those parent records will be published as well. When false, an UNPUBLISHED_PARENT error will occur in such cases."),
  }).refine(
    data => {
      // If one of content_in_locales or non_localized_content is provided, both must be provided
      return (
        (data.content_in_locales === undefined && data.non_localized_content === undefined) ||
        (data.content_in_locales !== undefined && data.non_localized_content !== undefined)
      );
    },
    {
      message: "If content_in_locales is provided, non_localized_content must also be provided, and vice versa."
    }
  ),

  unpublish: createBaseSchema().extend({ 
    itemId: recordIdSchema,
    recursive: z.boolean().optional().default(false)
      .describe("When true, if the record belongs to a tree-like collection and any child records are published, those child records will be unpublished as well. When false, a PUBLISHED_CHILDREN error will occur in such cases."),
  }),

  bulk_unpublish: createBaseSchema().extend({ 
    itemIds: z.array(z.string()).min(1)
      .describe("Array of record IDs to unpublish."),
    recursive: z.boolean().optional().default(false)
      .describe("When true, if the record belongs to a tree-like collection and any child records are published, those child records will be unpublished as well. When false, a PUBLISHED_CHILDREN error will occur in such cases."),
  }),

  // Publication scheduling operations
  schedule_publication: createBaseSchema().extend({ 
    itemId: recordIdSchema,
    publication_scheduled_at: z.string()
      .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/, {
        message: "Must be a valid ISO8601 timestamp (YYYY-MM-DDTHH:MM:SSZ)"
      })
      .describe("The ISO8601 timestamp when the record should be automatically published (e.g., '2023-12-31T23:59:59Z')."),
  }),

  cancel_scheduled_publication: createBaseSchema().extend({ 
    itemId: recordIdSchema,
  }),

  schedule_unpublication: createBaseSchema().extend({ 
    itemId: recordIdSchema,
    unpublishing_scheduled_at: z.string()
      .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/, {
        message: "Must be a valid ISO8601 timestamp (YYYY-MM-DDTHH:MM:SSZ)"
      })
      .describe("The ISO8601 timestamp when the record should be automatically unpublished (e.g., '2023-12-31T23:59:59Z')."),
  }),

  cancel_scheduled_unpublication: createBaseSchema().extend({ 
    itemId: recordIdSchema,
  }),

  // Version operations
  versions_list: createBaseSchema().extend({ 
    itemId: recordIdSchema,
    returnOnlyIds: z.boolean().optional().default(true)
      .describe("If true, returns only an array of version IDs and their timestamps instead of complete version records. This saves on token usage and response size. Default is true."),
    page: paginationSchema.optional(),
  }),

  version_get: createBaseSchema().extend({ 
    itemId: recordIdSchema,
    versionId: z.string().describe("The ID of the version to retrieve."),
  }),

  version_restore: createBaseSchema().extend({ 
    itemId: recordIdSchema,
    versionId: z.string().describe("The ID of the version to restore."),
  })
};

// Create an array of all available record actions for the enum
export const recordActionsList = Object.keys(recordsSchemas) as Array<keyof typeof recordsSchemas>;
