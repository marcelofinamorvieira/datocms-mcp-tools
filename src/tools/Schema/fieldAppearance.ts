import { z } from "zod";

/**
 * Field appearance schemas for DatoCMS fields
 * 
 * These schemas provide specific validation for different field appearance
 * configurations in DatoCMS.
 * 
 * @see https://www.datocms.com/docs/content-management-api/resources/field
 */

/**
 * Field addon schema
 * For plugins and extensions applied to fields
 */
export const fieldAddonSchema = z.object({
  id: z.string().describe("Unique identifier for the addon"),
  field_extension: z.string().optional().describe("Field extension ID, if applicable"),
  parameters: z.record(z.unknown()).optional().describe("Parameters for the addon")
});

/**
 * Base appearance schema for all field types
 */
const baseAppearanceSchema = z.object({
  addons: z.array(fieldAddonSchema).default([])
    .describe("Field addons to apply. IMPORTANT: Always include this field, at minimum as an empty array.")
});

/**
 * Text field appearance
 * For string and text fields
 */
export const textAppearanceSchema = baseAppearanceSchema.extend({
  editor: z.enum([
    "single_line", "multi_line", "wysiwyg"
  ]).describe("Editor type to use for the field. Common values: 'single_line', 'multi_line', 'wysiwyg'."),
  parameters: z.object({
    heading: z.boolean().optional().default(false).describe("Whether to display as a heading"),
    api_key: z.boolean().optional().default(false).describe("Whether this is an API key field (applies special validation)"),
    monospace: z.boolean().optional().default(false).describe("Whether to use monospace font"),
    disable_code_highlighting: z.boolean().optional().default(false).describe("Whether to disable code highlighting in editor"),
    html_requirements: z.boolean().optional().default(false).describe("Whether to enforce HTML formatting requirements")
  }).optional().default({})
    .describe("Editor parameters. Example: { \"heading\": false }")
});

/**
 * String field appearance
 * Specific to string fields
 */
export const stringAppearanceSchema = textAppearanceSchema.describe("Appearance for string fields. Example: { \"editor\": \"single_line\", \"parameters\": { \"heading\": false }, \"addons\": [] }");

/**
 * Text field appearance
 * Specific to text fields (multi-line)
 */
export const textareaAppearanceSchema = textAppearanceSchema.describe("Appearance for text fields. Example: { \"editor\": \"multi_line\", \"parameters\": { \"rows\": 4 }, \"addons\": [] }");

/**
 * Boolean field appearance
 */
export const booleanAppearanceSchema = baseAppearanceSchema.extend({
  editor: z.enum([
    "boolean", "checkbox", "switch"
  ]).describe("Editor type to use for the field. Common values: 'boolean', 'checkbox', 'switch'."),
  parameters: z.object({
    true_label: z.string().optional().describe("Label to use for true value"),
    false_label: z.string().optional().describe("Label to use for false value")
  }).optional().default({})
    .describe("Editor parameters. Example: { \"true_label\": \"Yes\", \"false_label\": \"No\" }")
}).describe("Appearance for boolean fields. Example: { \"editor\": \"switch\", \"parameters\": {}, \"addons\": [] }");

/**
 * Number field appearance
 * For integer and float fields
 */
export const numberAppearanceSchema = baseAppearanceSchema.extend({
  editor: z.enum([
    "integer", "float", "slider"
  ]).describe("Editor type to use for the field. Common values: 'integer', 'float', 'slider'."),
  parameters: z.object({
    step: z.number().optional().describe("Step increment for slider"),
    min: z.number().optional().describe("Minimum value for slider"),
    max: z.number().optional().describe("Maximum value for slider")
  }).optional().default({})
    .describe("Editor parameters. Example: { \"step\": 1, \"min\": 0, \"max\": 100 }")
}).describe("Appearance for number fields. Example: { \"editor\": \"integer\", \"parameters\": {}, \"addons\": [] }");

/**
 * Date field appearance
 */
export const dateAppearanceSchema = baseAppearanceSchema.extend({
  editor: z.enum([
    "date_picker", "date_time_picker"
  ]).describe("Editor type to use for the field. Common values: 'date_picker', 'date_time_picker'."),
  parameters: z.object({
    time_format: z.enum(["12h", "24h"]).optional().describe("Time format to use"),
    display_format: z.string().optional().describe("Custom display format")
  }).optional().default({})
    .describe("Editor parameters. Example: { \"time_format\": \"24h\" }")
}).describe("Appearance for date fields. Example: { \"editor\": \"date_picker\", \"parameters\": {}, \"addons\": [] }");

/**
 * Enum field appearance
 * For fields with enumerated values
 */
export const enumAppearanceSchema = baseAppearanceSchema.extend({
  editor: z.enum([
    "dropdown", "radio_group", "checkbox_group", "select"
  ]).describe("Editor type to use for the field. Common values: 'dropdown', 'radio_group', 'checkbox_group'."),
  parameters: z.object({
    presentation_mode: z.enum(["list", "grid"]).optional().describe("How to present the options")
  }).optional().default({})
    .describe("Editor parameters. Example: { \"presentation_mode\": \"list\" }")
}).describe("Appearance for enum fields. Example: { \"editor\": \"dropdown\", \"parameters\": {}, \"addons\": [] }");

/**
 * Modular content field appearance
 * For rich_text, structured_text fields
 */
export const modularContentAppearanceSchema = baseAppearanceSchema.extend({
  editor: z.enum([
    "rich_text", "structured_text", "markdown"
  ]).describe("Editor type to use for the field. For rich_text fields, use 'rich_text'."),
  parameters: z.object({
    toolbar_options: z.array(z.string()).optional().describe("Toolbar options to include"),
    enable_paste_filters: z.boolean().optional().default(true).describe("Whether to enable paste filters"),
    start_collapsed: z.boolean().optional().default(false).describe("Whether to start in collapsed state")
  }).optional().default({ start_collapsed: false })
    .describe("Editor parameters. Example: { \"start_collapsed\": false }")
}).describe("Appearance for rich text and structured text fields. Example: { \"editor\": \"rich_text\", \"parameters\": { \"start_collapsed\": false }, \"addons\": [] }");

/**
 * Link field appearance
 * For link and links fields
 */
export const linkAppearanceSchema = baseAppearanceSchema.extend({
  editor: z.enum([
    "link_editor", "links_editor", "embedded"
  ]).describe("Editor type to use for the field. For single links use 'link_editor', for multiple 'links_editor'."),
  parameters: z.object({
    display_mode: z.enum(["list", "grid", "table"]).optional().describe("How to display linked items"),
    filter_types: z.array(z.string()).optional().describe("Types to filter in selection UI")
  }).optional().default({})
    .describe("Editor parameters. Example: { \"display_mode\": \"list\" }")
}).describe("Appearance for link fields. Example: { \"editor\": \"link_editor\", \"parameters\": {}, \"addons\": [] }");

/**
 * Media field appearance
 * For file and gallery fields
 */
export const mediaAppearanceSchema = baseAppearanceSchema.extend({
  editor: z.enum([
    "file", "gallery", "media_gallery"
  ]).describe("Editor type to use for the field. For single files use 'file', for multiple 'gallery'."),
  parameters: z.object({
    allow_uploader: z.boolean().optional().default(true).describe("Whether to allow uploading files"),
    media_library_per_upload_config: z.record(z.unknown()).optional().describe("Per-upload media library configuration")
  }).optional().default({ allow_uploader: true })
    .describe("Editor parameters. Example: { \"allow_uploader\": true }")
}).describe("Appearance for media fields. Example: { \"editor\": \"file\", \"parameters\": {}, \"addons\": [] }");

/**
 * Color field appearance
 */
export const colorAppearanceSchema = baseAppearanceSchema.extend({
  editor: z.literal("color_picker").describe("Editor type for color field. Use 'color_picker'."),
  parameters: z.object({
    color_format: z.enum(["hex", "rgb", "rgba"]).optional().describe("Format to use for color value"),
    preset_colors: z.array(z.string()).optional().describe("Preset colors to offer in picker")
  }).optional().default({})
    .describe("Editor parameters. Example: { \"color_format\": \"hex\" }")
}).describe("Appearance for color fields. Example: { \"editor\": \"color_picker\", \"parameters\": {}, \"addons\": [] }");

/**
 * JSON field appearance
 * IMPORTANT: For json fields, there are three editor types:
 * 1. "json_editor" - Standard JSON editor
 * 2. "string_multi_select" - Multi-select dropdown
 * 3. "string_checkbox_group" - Multiple checkbox selection (use "options" parameter)
 */
export const jsonAppearanceSchema = baseAppearanceSchema.extend({
  editor: z.enum(["json_editor", "string_multi_select", "string_checkbox_group"])
    .describe("Editor type for JSON field. Use 'json_editor' for raw JSON editing, 'string_multi_select' for dropdown multi-select, or 'string_checkbox_group' for checkbox group."),
  parameters: z.record(z.unknown()).optional().default({})
    .describe("Editor parameters. For string_checkbox_group, use 'options' not 'checkboxes'. Example for checkbox_group: { \"options\": [{\"label\": \"Option\", \"value\": \"option\"}] }")
}).describe("Appearance for JSON fields with proper configuration. Example: { \"editor\": \"json_editor\", \"parameters\": {}, \"addons\": [] }");

/**
 * Geo coordinates field appearance
 * IMPORTANT: Use "map" as the editor name for the API
 */
export const geoAppearanceSchema = baseAppearanceSchema.extend({
  editor: z.enum(["map", "lat_lon_editor"])
    .describe("Editor type for geo coordinates field. IMPORTANT: Use 'map' with the API, not 'lat_lon_editor'."),
  parameters: z.object({
    map_provider: z.enum(["google", "mapbox"]).optional().describe("Map provider to use"),
    default_zoom: z.number().int().min(1).max(22).optional().describe("Default zoom level")
  }).optional().default({})
    .describe("Editor parameters. Example: { \"default_zoom\": 10 }")
}).describe("Appearance for geo coordinate fields. Example: { \"editor\": \"map\", \"parameters\": {}, \"addons\": [] }");

/**
 * SEO field appearance
 * IMPORTANT: Always include addons array, even if empty
 */
export const seoAppearanceSchema = baseAppearanceSchema.extend({
  editor: z.literal("seo").describe("Editor type for SEO field. Use 'seo'."),
  parameters: z.object({}).optional().default({})
    .describe("Editor parameters (none required for SEO fields)")
}).describe("Appearance for SEO fields. Example: { \"editor\": \"seo\", \"parameters\": {}, \"addons\": [] }");

/**
 * Video field appearance
 * IMPORTANT: Always include addons array, even if empty
 */
export const videoAppearanceSchema = baseAppearanceSchema.extend({
  editor: z.literal("video").describe("Editor type for video field. Use 'video'."),
  parameters: z.object({}).optional().default({})
    .describe("Editor parameters (none required for video fields)")
}).describe("Appearance for video fields. Example: { \"editor\": \"video\", \"parameters\": {}, \"addons\": [] }");

/**
 * Map of field types to appropriate editor values
 * IMPORTANT: For `lat_lon` fields, both "lat_lon_editor" and "map" are included,
 * but "lat_lon_editor" is strongly recommended as it works more reliably.
 * For string fields, "string_radio_group" and "string_select" require matching enum validators.
 * For json fields, "string_multi_select" and "string_checkbox_group" require properly formatted options.
 */
const fieldTypeToEditorMap: Record<string, string[]> = {
  string: ["single_line", "textarea", "wysiwyg", "string_radio_group", "string_select"],
  text: ["textarea", "wysiwyg", "markdown"],
  rich_text: ["rich_text"],
  structured_text: ["structured_text"],
  boolean: ["boolean", "checkbox", "switch"],
  integer: ["integer", "slider"],
  float: ["float", "slider"],
  date: ["date_picker"],
  date_time: ["date_time_picker"],
  file: ["file"],
  gallery: ["gallery", "media_gallery"],
  link: ["link_editor", "embedded", "link_select"],
  links: ["links_editor", "links_select"],
  color: ["color_picker"],
  json: ["json_editor", "string_multi_select", "string_checkbox_group"],
  lat_lon: ["lat_lon_editor", "map"],
  seo: ["seo"],
  video: ["video"],
  slug: ["slug"],
  single_block: ["framed_single_block"]
};

/**
 * Creates a field appearance schema based on field type with helpful examples
 */
export function createAppearanceSchema(fieldType: string) {
  const appearanceSchemas: Record<string, z.ZodObject<any>> = {
    string: stringAppearanceSchema,
    text: textareaAppearanceSchema,
    boolean: booleanAppearanceSchema,
    integer: numberAppearanceSchema,
    float: numberAppearanceSchema,
    date: dateAppearanceSchema,
    date_time: dateAppearanceSchema,
    enum: enumAppearanceSchema,
    rich_text: modularContentAppearanceSchema,
    structured_text: modularContentAppearanceSchema,
    link: linkAppearanceSchema,
    links: linkAppearanceSchema,
    file: mediaAppearanceSchema,
    gallery: mediaAppearanceSchema,
    color: colorAppearanceSchema,
    json: jsonAppearanceSchema,
    lat_lon: geoAppearanceSchema,
    seo: seoAppearanceSchema,
    video: videoAppearanceSchema,
    slug: stringAppearanceSchema,
    single_block: linkAppearanceSchema
  };

  const validEditors = fieldTypeToEditorMap[fieldType] || ["default_editor"];
  const editorExample = validEditors[0] || "default_editor";
  
  const schema = appearanceSchemas[fieldType] || baseAppearanceSchema.extend({
    editor: z.string().describe(`Editor type to use for the field. For ${fieldType} fields, common values are: ${validEditors.join(', ')}.`),
    parameters: z.record(z.unknown()).optional().default({}).describe("Editor parameters (specific to the chosen editor)")
  });
  
  const description = `Appearance configuration for ${fieldType} field. IMPORTANT: Always include 'addons' array even if empty. Example: { "editor": "${editorExample}", "parameters": {}, "addons": [] }`;
  
  return schema.describe(description);
}

export default {
  createAppearanceSchema,
  fieldAddonSchema,
  baseAppearanceSchema
};