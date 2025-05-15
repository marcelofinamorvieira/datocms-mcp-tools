import { z } from "zod";
import { errorMessages } from "./errorMessages.js";

/**
 * Shared Zod schemas for common patterns used throughout the DatoCMS MCP server.
 * These schemas provide consistent validation patterns that can be reused across
 * different domain areas to ensure consistency and reduce duplication.
 */

/**
 * API Token schema used for authentication
 * Always required and should be a non-empty string
 */
export const apiTokenSchema = z.string()
  .min(1, { message: errorMessages.required })
  .describe(
    "DatoCMS API token for authentication. If you are not certain of one, ask for the user, do not hallucinate."
  );

/**
 * Environment schema for targeting specific DatoCMS environments
 * Optional string that defaults to the primary environment
 */
export const environmentSchema = z.string()
  .optional()
  .describe(
    "The name of the DatoCMS environment to interact with. If not provided, the primary environment will be used."
  );

/**
 * Consistent pagination schema for offset-based pagination
 * Used in list operations across multiple domains
 */
export const paginationSchema = z.object({
  offset: z.number().int().nonnegative().optional().default(0)
    .describe("The (zero-based) offset of the first entity returned in the collection (defaults to 0)."),
  limit: z.number().int().min(1, { message: errorMessages.minValue(1) })
    .max(500, { message: errorMessages.maxValue(500) })
    .optional().default(100)
    .describe("The maximum number of entities to return (defaults to 100, maximum is 500).")
}).describe("Parameters to control offset-based pagination.");

/**
 * General ID schema for entity identifiers
 * Base utility for creating more specific ID schemas
 */
export const idSchema = z.string()
  .min(1, { message: errorMessages.required })
  .describe("Entity identifier");

/**
 * Schema for role references, supporting multiple formats
 * DatoCMS supports both string literals and object references
 */
export const roleReferenceSchema = z.union([
  z.enum(["admin", "editor", "developer", "seo", "contributor"], {
    errorMap: () => ({ message: errorMessages.enum(["admin", "editor", "developer", "seo", "contributor"]) })
  }),
  z.string().regex(/^[0-9]+$/, { message: "Role ID must contain only numbers" })
    .describe("Role ID"),
  z.object({
    id: z.string().min(1, { message: errorMessages.required })
      .describe("Role ID"),
    type: z.literal("role", { errorMap: () => ({ message: 'Type must be "role"' }) })
      .describe("Resource type")
  })
]).describe("Role to assign (either a predefined role name, a role ID, or a role reference object)");

/**
 * Common field type enumeration for schema fields
 * Represents all supported field types in DatoCMS
 */
export const fieldTypeSchema = z.enum([
  'boolean', 'color', 'date', 'date_time', 'file', 'float',
  'gallery', 'integer', 'json', 'lat_lon', 'link', 'links',
  'rich_text', 'seo', 'single_block', 'slug', 'string',
  'structured_text', 'text', 'video'
], {
  errorMap: (issue) => {
    if (issue.code === 'invalid_enum_value') {
      return {
        message: `Invalid field type. Must be one of: ${[
          'boolean', 'color', 'date', 'date_time', 'file', 'float',
          'gallery', 'integer', 'json', 'lat_lon', 'link', 'links',
          'rich_text', 'seo', 'single_block', 'slug', 'string',
          'structured_text', 'text', 'video'
        ].join(', ')}`
      };
    }
    return { message: errorMessages.invalidFieldType };
  }
}).describe("The type of the field.");

/**
 * Ordering specification schema
 * For specifying sort order in list operations
 */
export const orderBySchema = z.string()
  .regex(/^[a-z0-9_]+_(ASC|DESC)$/i, {
    message: "Use format <field_name>_(ASC|DESC), e.g. 'name_ASC' or 'created_at_DESC'"
  })
  .describe("Field used to order results. Format: <field_name>_(ASC|DESC), where <field_name> can be a model's field API key or metadata fields like id, _updated_at, _created_at, etc.");

/**
 * Versioning enum for record versions (published or current/draft)
 */
export const versionSchema = z.enum(["published", "current"], {
  errorMap: () => ({ message: errorMessages.enum(["published", "current"]) })
})
  .default("current")
  .describe("Whether to retrieve the published version ('published') or the latest draft ('current'). Default is 'current'.");

/**
 * Return format control for API responses
 * Controls whether full objects or just IDs are returned
 */
export const returnOnlyIdsSchema = z.boolean()
  .optional()
  .default(false)
  .describe("If true, returns only an array of record IDs instead of complete records. Use this to save on tokens and context window space when only IDs are needed.");

/**
 * Return confirmation control for API responses
 * For operations where you may not need the full response data
 */
export const returnOnlyConfirmationSchema = z.boolean()
  .optional()
  .default(false)
  .describe("If true, returns only a success confirmation message instead of the full object data. Use this to save on token usage.");

/**
 * Create a strongly-typed ID schema for a specific entity type
 */
export function createIdSchema(entityName: string) {
  return z.string()
    .min(1, { message: `${entityName} ID is required` })
    .describe(`The ID of the ${entityName} to interact with.`);
}

/**
 * Create a base schema with common elements for most operations
 */
export function createBaseSchema() {
  return z.object({
    apiToken: apiTokenSchema,
    environment: environmentSchema
  });
}

/**
 * Create a standard retrieval schema for an entity
 */
export function createRetrieveSchema(entityName: string) {
  return createBaseSchema().extend({
    [`${entityName}Id`]: createIdSchema(entityName)
  });
}

/**
 * Create a standard list schema with pagination
 */
export function createListSchema() {
  return createBaseSchema().extend({
    page: paginationSchema.optional()
  });
}

/**
 * Create a standard deletion schema for an entity
 */
export function createDeleteSchema(entityName: string) {
  return createBaseSchema().extend({
    [`${entityName}Id`]: createIdSchema(entityName)
  });
}