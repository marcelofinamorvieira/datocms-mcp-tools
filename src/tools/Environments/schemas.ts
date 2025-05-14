import { z } from "zod";
import {
  apiTokenSchema,
  environmentSchema,
  createIdSchema,
  createBaseSchema,
  createRetrieveSchema,
  createListSchema,
  destructiveConfirmationSchema
} from "../../utils/sharedSchemas.js";

/**
 * Environment ID schema with specific validation rules
 */
const environmentIdSchema = z.string()
  .min(1)
  .regex(/^[a-z0-9-]+$/, {
    message: "Environment ID can only contain lowercase letters, numbers and dashes"
  })
  .describe("The ID of the environment to interact with. Can only contain lowercase letters, numbers and dashes.");

/**
 * Schemas for all environment-related actions.
 * These schemas are extracted from the original environment tool definitions
 * and are used for both the environments router and parameter tools.
 */
export const environmentSchemas = {
  // Environment retrieval operations
  retrieve: createRetrieveSchema("environment").extend({
    environmentId: environmentIdSchema,
  }),

  // Environment listing operations
  list: createListSchema(),

  // Environment deletion operations
  delete: createBaseSchema().extend({
    environmentId: environmentIdSchema,
    // Enhanced validation using consistent pattern instead of string-based confirmation
    confirmation: z.union([
      destructiveConfirmationSchema,
      // For backward compatibility, also accept 'confirm' string
      z.literal('confirm').describe("Type 'confirm' to confirm the deletion. This is a destructive action that cannot be undone.")
    ]),
  }),

  // Environment renaming operations
  rename: createBaseSchema().extend({
    environmentId: environmentIdSchema,
    newId: environmentIdSchema.describe("The new ID for the environment."),
  }),

  // Environment promotion operations
  promote: createBaseSchema().extend({
    environmentId: environmentIdSchema,
  }),

  // Environment forking operations
  fork: createBaseSchema().extend({
    environmentId: environmentIdSchema,
    newId: environmentIdSchema.describe("The ID for the new environment."),
    fast: z.boolean()
      .optional()
      .describe("If true, the fork will be created without copying records (faster but incomplete)."),
    force: z.boolean()
      .optional()
      .describe("If true, the fork operation will proceed even if there are warnings.")
  }),

  // Maintenance mode operations
  maintenance_status: createBaseSchema(),

  maintenance_activate: createBaseSchema().extend({
    force: z.boolean()
      .optional()
      .describe("If true, maintenance mode will be activated even if there are active jobs.")
  }),

  maintenance_deactivate: createBaseSchema()
};

// Create an array of all available environment actions for the enum
export const environmentActionsList = Object.keys(environmentSchemas) as Array<keyof typeof environmentSchemas>;