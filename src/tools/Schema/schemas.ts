import { z } from "zod";
import {
  apiTokenSchema,
  environmentSchema,
  createBaseSchema,
  createRetrieveSchema,
  createListSchema,
  createDeleteSchema,
  paginationSchema,
  destructiveConfirmationSchema,
  fieldTypeSchema
} from "../../utils/sharedSchemas.js";

import { createValidatorsSchema } from "./fieldValidators.js";
import { createAppearanceSchema, fieldAddonSchema } from "./fieldAppearance.js";

/**
 * API key validation pattern
 * Ensures API keys follow the correct format (lowercase letters, numbers, underscores)
 */
const apiKeyPattern = /^[a-z][a-z0-9_]*$/;

/**
 * Schemas for all schema-related actions (Item Types, Fieldsets, and Fields)
 * These schemas are used for both the schema router and describe tools.
 */
export const schemaSchemas = {
  // ItemType operations
  create_item_type: createBaseSchema().extend({
    name: z.string().min(1).describe("The name of the new Item Type (model)."),
    apiKey: z.string().min(1).regex(apiKeyPattern, {
      message: "API key must start with a lowercase letter and contain only lowercase letters, numbers, and underscores"
    }).describe("The API key to identify the item type (API-safe identifier)."),
    allLocalesRequired: z.boolean().optional().default(false)
      .describe("Whether the item type requires content to be provided for all locales."),
    draftModeActive: z.boolean().optional().default(true)
      .describe("Whether draft mode is active for this item type."),
    modularBlock: z.boolean().optional().default(false)
      .describe("Whether the item type is a modular block."),
    orderingDirection: z.enum(["asc", "desc"]).optional()
      .describe("The direction of the ordering."),
    orderingField: z.string().optional()
      .describe("The field to use for ordering."),
    singleton: z.boolean().optional().default(false)
      .describe("Whether the item type is a singleton."),
    sortable: z.boolean().optional().default(false)
      .describe("Whether the item type is sortable."),
    titleField: z.string().optional()
      .describe("The field to use as the title."),
    tree: z.boolean().optional().default(false)
      .describe("Whether the item type is structured as a tree.")
  }),

  duplicate_item_type: createBaseSchema().extend({
    itemTypeId: z.string().min(1).describe("The ID of the item type to duplicate."),
    name: z.string().min(1).describe("The name for the duplicated item type."),
    apiKey: z.string().min(1).regex(apiKeyPattern, {
      message: "API key must start with a lowercase letter and contain only lowercase letters, numbers, and underscores"
    }).describe("The API key for the duplicated item type (must be unique).")
  }),

  get_item_type: createRetrieveSchema("itemType"),

  list_item_types: createListSchema(),

  update_item_type: createBaseSchema().extend({
    itemTypeId: z.string().min(1).describe("The ID of the item type to update."),
    name: z.string().min(1).optional().describe("The updated name of the item type."),
    apiKey: z.string().min(1).regex(apiKeyPattern, {
      message: "API key must start with a lowercase letter and contain only lowercase letters, numbers, and underscores"
    }).optional().describe("The updated API key for the item type."),
    allLocalesRequired: z.boolean().optional()
      .describe("Whether the item type requires content to be provided for all locales."),
    draftModeActive: z.boolean().optional()
      .describe("Whether draft mode is active for this item type."),
    modularBlock: z.boolean().optional()
      .describe("Whether the item type is a modular block."),
    orderingDirection: z.enum(["asc", "desc"]).optional()
      .describe("The direction of the ordering."),
    orderingField: z.string().optional()
      .describe("The field to use for ordering."),
    singleton: z.boolean().optional()
      .describe("Whether the item type is a singleton."),
    sortable: z.boolean().optional()
      .describe("Whether the item type is sortable."),
    titleField: z.string().optional()
      .describe("The field to use as the title."),
    tree: z.boolean().optional()
      .describe("Whether the item type is structured as a tree.")
  }).refine(
    data => Object.keys(data).length > 2, // apiToken + environment + at least one field
    {
      message: "At least one field to update must be provided"
    }
  ),

  delete_item_type: createDeleteSchema("itemType"),

  // Fieldset operations
  create_fieldset: createBaseSchema().extend({
    itemTypeId: z.string().min(1).describe("ID of the item type to which this fieldset belongs."),
    title: z.string().min(1).describe("The name of the fieldset."),
    hint: z.string().nullable().optional().describe("Additional hint text for the fieldset."),
    position: z.number().int().nonnegative().optional().describe("Position index for ordering fieldsets."),
    collapsible: z.boolean().optional().default(false).describe("Whether the fieldset can be collapsed."),
    start_collapsed: z.boolean().optional().default(false).describe("Whether the fieldset should be initially collapsed.")
  }),

  update_fieldset: createBaseSchema().extend({
    fieldsetId: z.string().min(1).describe("The ID of the fieldset to update."),
    title: z.string().min(1).optional().describe("The updated name of the fieldset."),
    hint: z.string().nullable().optional().describe("Updated additional hint text for the fieldset."),
    position: z.number().int().nonnegative().optional().describe("Updated position index for ordering fieldsets."),
    collapsible: z.boolean().optional().describe("Whether the fieldset can be collapsed."),
    start_collapsed: z.boolean().optional().describe("Whether the fieldset should be initially collapsed.")
  }).refine(
    data => Object.keys(data).length > 2, // apiToken + environment + at least one field
    {
      message: "At least one field to update must be provided"
    }
  ),

  list_fieldsets: createBaseSchema().extend({
    itemTypeId: z.string().min(1).describe("ID of the item type to filter fieldsets by. This is required by the DatoCMS API."),
    page: paginationSchema.optional()
  }),

  get_fieldset: createRetrieveSchema("fieldset"),

  delete_fieldset: createDeleteSchema("fieldset"),

  // Field operations
  create_field: z.object({
    apiToken: apiTokenSchema,
    itemTypeId: z.string().min(1).describe("ID of the item type to which this field belongs."),
    label: z.string().min(1).describe("The human-readable name of the field."),
    api_key: z.string().min(1).regex(apiKeyPattern, {
      message: "API key must start with a lowercase letter and contain only lowercase letters, numbers, and underscores"
    }).describe("The API key to identify the field (API-safe identifier)."),
    field_type: fieldTypeSchema,
    validators: z.lazy(() => z.record(z.unknown()).optional()
      .describe("Validators for the field (structure depends on field_type).")),
    appearance: z.lazy(() => z.object({
      editor: z.string(),
      parameters: z.record(z.unknown()),
      addons: z.array(fieldAddonSchema).optional()
    }).optional()
      .describe("Appearance options for the field (structure depends on field_type).")),
    position: z.number().int().nonnegative().optional().describe("Position index for ordering fields."),
    hint: z.string().nullable().optional().describe("Additional hint text for the field."),
    localized: z.boolean().optional().default(false).describe("Whether the field is localized (translatable)."),
    fieldset_id: z.string().optional().describe("The ID of the fieldset to assign the field to."),
    environment: environmentSchema
  }).refine(
    (data) => {
      if (!data.field_type) return true;
      
      // Dynamically validate validators based on field type
      if (data.validators) {
        try {
          createValidatorsSchema(data.field_type).parse(data.validators);
        } catch (error) {
          return false;
        }
      }
      
      // Dynamically validate appearance based on field type
      if (data.appearance) {
        try {
          createAppearanceSchema(data.field_type).parse(data.appearance);
        } catch (error) {
          return false;
        }
      }
      
      return true;
    },
    {
      message: "Validators or appearance configuration is not valid for the specified field type"
    }
  ),

  update_field: createBaseSchema().extend({
    fieldId: z.string().min(1).describe("The ID of the field to update."),
    label: z.string().min(1).optional().describe("The updated human-readable name of the field."),
    api_key: z.string().min(1).regex(apiKeyPattern, {
      message: "API key must start with a lowercase letter and contain only lowercase letters, numbers, and underscores"
    }).optional().describe("The updated API key to identify the field."),
    field_type: fieldTypeSchema.optional().describe("The updated type of the field."),
    validators: z.record(z.unknown()).optional().describe("Updated validators for the field."),
    appearance: z.object({
      editor: z.string(),
      parameters: z.record(z.unknown()),
      addons: z.array(fieldAddonSchema).optional()
    }).optional().describe("Updated appearance options for the field."),
    position: z.number().int().nonnegative().optional().describe("Updated position index for ordering fields."),
    hint: z.string().nullable().optional().describe("Updated additional hint text for the field."),
    localized: z.boolean().optional().describe("Whether the field is localized (translatable)."),
    fieldset_id: z.string().optional().describe("The updated ID of the fieldset to assign the field to.")
  }).refine(
    data => Object.keys(data).length > 2, // apiToken + environment + at least one field
    {
      message: "At least one field to update must be provided"
    }
  ).refine(
    (data) => {
      // Skip validation if field_type not provided
      if (!data.field_type) return true;
      
      // Dynamically validate validators based on field type
      if (data.validators) {
        try {
          createValidatorsSchema(data.field_type).parse(data.validators);
        } catch (error) {
          return false;
        }
      }
      
      // Dynamically validate appearance based on field type
      if (data.appearance) {
        try {
          createAppearanceSchema(data.field_type).parse(data.appearance);
        } catch (error) {
          return false;
        }
      }
      
      return true;
    },
    {
      message: "Validators or appearance configuration is not valid for the specified field type"
    }
  ),

  get_field: createRetrieveSchema("field"),

  list_fields: createBaseSchema().extend({
    itemTypeId: z.string().min(1).describe("ID of the item type to filter fields by."),
    page: paginationSchema.optional()
  }),

  delete_field: createDeleteSchema("field")
};

// Create an array of all available schema actions for the enum
export const schemaActionsList = Object.keys(schemaSchemas) as Array<keyof typeof schemaSchemas>;