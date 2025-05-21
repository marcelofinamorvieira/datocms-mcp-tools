import { z } from "zod";
import {
  apiTokenSchema,
  environmentSchema,
  createBaseSchema,
  createRetrieveSchema,
  createListSchema,
  createDeleteSchema,
  paginationSchema,
  fieldTypeSchema
} from "../../utils/sharedSchemas.js";

import { createValidatorsSchema } from "./fieldValidators.js";
import { createAppearanceSchema, fieldAddonSchema } from "./fieldAppearance.js";
import { stringFieldExample, richTextFieldExample, textFieldExample } from "./fieldExamples.js";

/**
 * API key validation pattern
 * Ensures API keys follow the correct format (lowercase letters, numbers, underscores)
 */
const apiKeyPattern = /^[a-z][a-z0-9_]*$/;

/**
 * Schemas for all schema-related actions (Item Types, Fieldsets, and Fields)
 * These schemas are used for both the schema router and describe tools.
 * 
 * IMPORTANT CONSTRAINTS TO BE AWARE OF:
 * 
 * 1. Item Type Constraints:
 *    - orderingField and orderingDirection must be provided together or neither should be provided
 *    - An item type cannot be both singleton and sortable at the same time
 *    - When changing a sortable item type to singleton, first update to remove sortable, then set singleton
 *    - When changing a singleton item type to sortable, first update to remove singleton, then set sortable
 * 
 * 2. Field Constraints:
 *    - When updating a field, the existing fieldset relationship will be maintained if not explicitly changed
 *    - Field types have specific validator requirements (e.g., rich_text fields require the rich_text_blocks validator)
 *    - Field appearance must be compatible with the field type
 *    - Field appearance configurations must always include an "addons" array (even if empty)
 * 
 * 3. Validation Rules:
 *    - API keys must start with a lowercase letter and contain only lowercase letters, numbers, and underscores
 *    - Most update operations require at least one field to be updated
 *    - Validators must be appropriate for the field type
 */
export const schemaSchemas = {
  // FieldCreationHelper operations
  get_field_type_info: z.object({
    apiToken: apiTokenSchema,
    environment: environmentSchema.optional().default("main"),
    fieldType: z.string().optional().describe("Optional field type to get specific information about (e.g., 'string', 'text', 'lat_lon', 'json'). If not provided, returns a list of all available field types with their supported appearances."),
    appearance: z.string().optional().describe("Optional appearance type to get specific template for (e.g., 'string_radio_group', 'map', 'string_checkbox_group'). If provided, fieldType must also be provided.")
  }).describe("Get verified field templates with working configurations to prevent validation errors in DatoCMS. Provides correct structure for problematic field types that commonly fail in creation requests. Includes templates for string_radio_group, string_select, textarea, wysiwyg, markdown, lat_lon, slug, and json fields with various appearances. All templates include the critical 'addons' array, proper editor names, and required validator configurations. For specialized fields, returns specific guidance (e.g., \"Use string_multi_select instead of json_editor\", \"Use map instead of lat_lon_editor\", \"Remember to match enum validators with option values\")."),

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
      .describe("The direction of the ordering. IMPORTANT: Must be provided together with orderingField."),
    orderingField: z.string().optional()
      .describe("The field to use for ordering. IMPORTANT: Must be provided together with orderingDirection."),
    singleton: z.boolean().optional().default(false)
      .describe("Whether the item type is a singleton. IMPORTANT: Cannot be true when sortable is true."),
    sortable: z.boolean().optional().default(false)
      .describe("Whether the item type is sortable. IMPORTANT: Cannot be true when singleton is true."),
    titleField: z.string().optional()
      .describe("The field to use as the title."),
    tree: z.boolean().optional().default(false)
      .describe("Whether the item type is structured as a tree.")
  })
  .refine(
    data => {
      // Both orderingField and orderingDirection must be provided together or neither should be provided
      return (data.orderingField === undefined && data.orderingDirection === undefined) || 
             (data.orderingField !== undefined && data.orderingDirection !== undefined);
    },
    {
      message: "orderingField and orderingDirection must be provided together or neither should be provided"
    }
  )
  .refine(
    data => {
      // Item type cannot be both singleton and sortable
      return !(data.singleton === true && data.sortable === true);
    },
    {
      message: "Item type cannot be both singleton and sortable"
    }
  ),

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
      .describe("The direction of the ordering. IMPORTANT: Must be provided together with orderingField."),
    orderingField: z.string().optional()
      .describe("The field to use for ordering. IMPORTANT: Must be provided together with orderingDirection."),
    singleton: z.boolean().optional()
      .describe("Whether the item type is a singleton. IMPORTANT: Cannot be true when sortable is true. If changing a sortable item type to singleton, first set sortable to false in a separate update."),
    sortable: z.boolean().optional()
      .describe("Whether the item type is sortable. IMPORTANT: Cannot be true when singleton is true. If changing a singleton item type to sortable, first set singleton to false in a separate update."),
    titleField: z.string().optional()
      .describe("The field to use as the title."),
    tree: z.boolean().optional()
      .describe("Whether the item type is structured as a tree.")
  }).refine(
    data => Object.keys(data).length > 2, // apiToken + environment + at least one field
    {
      message: "At least one field to update must be provided"
    }
  ).refine(
    data => {
      // Both orderingField and orderingDirection must be provided together or neither should be provided
      return (data.orderingField === undefined && data.orderingDirection === undefined) || 
             (data.orderingField !== undefined && data.orderingDirection !== undefined);
    },
    {
      message: "orderingField and orderingDirection must be provided together or neither should be provided"
    }
  ).refine(
    data => {
      // Item type cannot be both singleton and sortable
      return !(data.singleton === true && data.sortable === true);
    },
    {
      message: "Item type cannot be both singleton and sortable"
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
    itemTypeId: z.string().min(1)
      .describe("ID of the item type to which this field belongs."),
    label: z.string().min(1)
      .describe("The human-readable name of the field that appears in the CMS interface."),
    api_key: z.string().min(1).regex(apiKeyPattern, {
      message: "API key must start with a lowercase letter and contain only lowercase letters, numbers, and underscores"
    }).describe("The machine-readable identifier for the field. Must start with lowercase letter and contain only lowercase letters, numbers, and underscores."),
    field_type: fieldTypeSchema
      .describe(
        "The type of field to create. Each type requires specific validators and appearance configurations. " +
          "If you're requesting a generic text field and haven't explicitly asked for a markdown or wysiwyg editor, " +
          "prefer 'structured_text' over 'text' so you can use record links and modular blocks."
      ),
    validators: z.lazy(() => z.record(z.unknown())
      .describe("Validators for the field. CRITICAL VALIDATORS BY TYPE:\n- For string_radio_group/string_select: MUST include { \"enum\": { \"values\": [\"option_a\", \"option_b\"] } } with values matching your options\n- For link fields: MUST include { \"item_item_type\": { \"item_types\": [\"your_item_type_id\"] } }\n- For links fields: MUST include { \"items_item_type\": { \"item_types\": [\"your_item_type_id\"] } }\n- For slug fields: Use { \"required\": {}, \"unique\": {} }\n- For rich_text fields: MUST include { \"rich_text_blocks\": { \"item_types\": [\"block_model_id1\", \"block_model_id2\"] } }")),
    appearance: z.lazy(() => z.object({
      editor: z.string()
        .describe(`The editor type to use for this field. CRITICAL MAPPINGS:
- string fields: "single_line", "string_radio_group", or "string_select"
- text fields: "textarea", "wysiwyg", or "markdown"
- lat_lon fields: "map" (IMPORTANT: use "map" not "lat_lon_editor")
- json fields: "string_multi_select" or "string_checkbox_group" (json_editor currently fails)
- link fields: "link_select"
- slug fields: "slug"
- boolean fields: "boolean"
- color fields: "color_picker"`),
      parameters: z.record(z.unknown()).default({})
        .describe("Editor-specific parameters. Common examples:\n- For string_radio_group: { \"radios\": [{\"label\": \"Option A\", \"value\": \"option_a\"}] }\n- For string_select: { \"options\": [{\"label\": \"Option A\", \"value\": \"option_a\"}] }\n- For string_checkbox_group: { \"options\": [{\"label\": \"Feature\", \"value\": \"feature\"}] } (not \"checkboxes\")\n- For slug: { \"url_prefix\": \"https://example.com/\" }"),
      addons: z.array(fieldAddonSchema).default([])
        .describe("Field addons to apply. IMPORTANT: Always include this field, at minimum as an empty array.")
    }).describe("Appearance configuration for the field. Structure depends on field_type. IMPORTANT: Always include 'addons' array even if empty.")),
    position: z.number().int().nonnegative().optional()
      .describe("Position index for ordering fields."),
    hint: z.string().nullable().optional()
      .describe("Additional hint text for the field, shown to content editors."),
    localized: z.boolean().default(false)
      .describe("Whether the field is localized (translatable). Include this parameter even when using the default value."),
    fieldset_id: z.string().optional()
      .describe("The ID of the fieldset to assign the field to. Recommended for organization. You will need to include this when updating the field later."),
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
      message: "Validators or appearance configuration is not valid for the specified field type. Each field type requires specific validators and appearance settings. See examples for guidance."
    }
  ).describe(`Schema for creating a field in DatoCMS. Each field type has specific requirements.

🔴 COMPLETE WORKING EXAMPLES BY FIELD TYPE:

1. String with radio group (most commonly fails):
{
  "action": "create_field",
  "args": {
    "apiToken": "your_api_token",
    "itemTypeId": "your_item_type_id",
    "label": "Category",
    "api_key": "category",
    "field_type": "string",
    "validators": {
      "enum": {"values": ["option_a", "option_b"]}
    },
    "appearance": {
      "editor": "string_radio_group",
      "parameters": {"radios": [{"label": "Option A", "value": "option_a"}, {"label": "Option B", "value": "option_b"}]},
      "addons": []
    },
    "localized": false
  }
}

2. Text with textarea appearance (commonly fails):
{
  "action": "create_field",
  "args": {
    "apiToken": "your_api_token",
    "itemTypeId": "your_item_type_id",
    "label": "Description",
    "api_key": "description",
    "field_type": "text",
    "appearance": {
      "editor": "textarea",
      "parameters": {"placeholder": "Enter text..."},
      "addons": []
    },
    "validators": {},
    "localized": false
  }
}

3. Location field (REQUIRES "map" editor):
{
  "action": "create_field",
  "args": {
    "apiToken": "your_api_token",
    "itemTypeId": "your_item_type_id",
    "label": "Location",
    "api_key": "location",
    "field_type": "lat_lon",
    "appearance": {
      "editor": "map",
      "parameters": {},
      "addons": []
    },
    "validators": {"required": {}},
    "localized": false
  }
}

4. JSON field (checkbox group):
{
  "action": "create_field",
  "args": {
    "apiToken": "your_api_token",
    "itemTypeId": "your_item_type_id",
    "label": "Features",
    "api_key": "features",
    "field_type": "json",
    "appearance": {
      "editor": "string_checkbox_group",
      "parameters": {"options": [{"label": "Feature A", "value": "feature_a"}, {"label": "Feature B", "value": "feature_b"}]},
      "addons": []
    },
    "validators": {},
    "localized": false
  }
}

5. Slug field:
{
  "action": "create_field",
  "args": {
    "apiToken": "your_api_token",
    "itemTypeId": "your_item_type_id",
    "label": "URL Slug",
    "api_key": "url_slug",
    "field_type": "slug",
    "appearance": {
      "editor": "slug",
      "parameters": {"url_prefix": "https://example.com/"},
      "addons": []
    },
    "validators": {"required": {}, "unique": {}},
    "localized": false
  }
}

🔴 CRITICAL REQUIREMENTS:
- ALWAYS include 'addons: []' in appearance
- For location (lat_lon) fields, use "editor": "map" (not "lat_lon_editor")
- For string fields with radio/select, enum validator values MUST match option values
- For JSON checkbox groups, use "options" parameter (not "checkboxes")
`),

  update_field: createBaseSchema().extend({
    fieldId: z.string().min(1).describe("The ID of the field to update."),
    label: z.string().min(1).optional().describe("The updated human-readable name of the field."),
    api_key: z.string().min(1).regex(apiKeyPattern, {
      message: "API key must start with a lowercase letter and contain only lowercase letters, numbers, and underscores"
    }).optional().describe("The updated API key to identify the field."),
    field_type: fieldTypeSchema.optional().describe(
      "The updated type of the field. If switching from a basic text field and no specific editor is required, consider using 'structured_text' instead of 'text' to enable record links and modular blocks."
    ),
    validators: z.record(z.unknown()).optional()
      .describe("Updated validators for the field. Required validators vary by field_type - for example, rich_text fields REQUIRE the rich_text_blocks validator."),
    appearance: z.object({
      editor: z.string().describe("Editor type to use for the field. Must be compatible with the field_type."),
      parameters: z.record(z.unknown()).default({}),
      addons: z.array(fieldAddonSchema).default([])
        .describe("Field addons to apply. IMPORTANT: Always include this field, at minimum as an empty array.")
    }).optional()
      .describe("Updated appearance options for the field. IMPORTANT: Always include 'addons' array even if empty."),
    position: z.number().int().nonnegative().optional().describe("Updated position index for ordering fields."),
    hint: z.string().nullable().optional().describe("Updated additional hint text for the field."),
    localized: z.boolean().optional().describe("Whether the field is localized (translatable)."),
    fieldset_id: z.string().optional().describe("The updated ID of the fieldset to assign the field to. If not provided, the existing fieldset relationship will be maintained.")
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
      message: "Validators or appearance configuration is not valid for the specified field type. Each field type requires specific validators and appearance settings."
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

// Field Type Documentation
export const fieldTypeDocumentationIds = [
  "get_field_type_info"
];