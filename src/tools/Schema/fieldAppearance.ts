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
  addons: z.array(fieldAddonSchema).optional()
    .describe("Field addons to apply")
});

/**
 * Text field appearance
 * For string and text fields
 */
export const textAppearanceSchema = baseAppearanceSchema.extend({
  editor: z.enum([
    "single_line", "multi_line", "wysiwyg"
  ]).describe("Editor type to use for the field"),
  parameters: z.object({
    heading: z.boolean().optional().describe("Whether to display as a heading"),
    api_key: z.boolean().optional().describe("Whether this is an API key field (applies special validation)"),
    monospace: z.boolean().optional().describe("Whether to use monospace font"),
    disable_code_highlighting: z.boolean().optional().describe("Whether to disable code highlighting in editor"),
    html_requirements: z.boolean().optional().describe("Whether to enforce HTML formatting requirements")
  }).optional()
});

/**
 * String field appearance
 * Specific to string fields
 */
export const stringAppearanceSchema = textAppearanceSchema;

/**
 * Text field appearance
 * Specific to text fields (multi-line)
 */
export const textareaAppearanceSchema = textAppearanceSchema;

/**
 * Boolean field appearance
 */
export const booleanAppearanceSchema = baseAppearanceSchema.extend({
  editor: z.enum([
    "boolean", "checkbox", "switch"
  ]).describe("Editor type to use for the field"),
  parameters: z.object({
    true_label: z.string().optional().describe("Label to use for true value"),
    false_label: z.string().optional().describe("Label to use for false value")
  }).optional()
});

/**
 * Number field appearance
 * For integer and float fields
 */
export const numberAppearanceSchema = baseAppearanceSchema.extend({
  editor: z.enum([
    "integer", "float", "slider"
  ]).describe("Editor type to use for the field"),
  parameters: z.object({
    step: z.number().optional().describe("Step increment for slider"),
    min: z.number().optional().describe("Minimum value for slider"),
    max: z.number().optional().describe("Maximum value for slider")
  }).optional()
});

/**
 * Date field appearance
 */
export const dateAppearanceSchema = baseAppearanceSchema.extend({
  editor: z.enum([
    "date_picker", "date_time_picker"
  ]).describe("Editor type to use for the field"),
  parameters: z.object({
    time_format: z.enum(["12h", "24h"]).optional().describe("Time format to use"),
    display_format: z.string().optional().describe("Custom display format")
  }).optional()
});

/**
 * Enum field appearance
 * For fields with enumerated values
 */
export const enumAppearanceSchema = baseAppearanceSchema.extend({
  editor: z.enum([
    "dropdown", "radio_group", "checkbox_group", "select"
  ]).describe("Editor type to use for the field"),
  parameters: z.object({
    presentation_mode: z.enum(["list", "grid"]).optional().describe("How to present the options")
  }).optional()
});

/**
 * Modular content field appearance
 * For rich_text, structured_text fields
 */
export const modularContentAppearanceSchema = baseAppearanceSchema.extend({
  editor: z.enum([
    "rich_text", "structured_text", "markdown"
  ]).describe("Editor type to use for the field"),
  parameters: z.object({
    toolbar_options: z.array(z.string()).optional().describe("Toolbar options to include"),
    enable_paste_filters: z.boolean().optional().describe("Whether to enable paste filters")
  }).optional()
});

/**
 * Link field appearance
 * For link and links fields
 */
export const linkAppearanceSchema = baseAppearanceSchema.extend({
  editor: z.enum([
    "link_editor", "links_editor", "embedded"
  ]).describe("Editor type to use for the field"),
  parameters: z.object({
    display_mode: z.enum(["list", "grid", "table"]).optional().describe("How to display linked items"),
    filter_types: z.array(z.string()).optional().describe("Types to filter in selection UI")
  }).optional()
});

/**
 * Media field appearance
 * For file and gallery fields
 */
export const mediaAppearanceSchema = baseAppearanceSchema.extend({
  editor: z.enum([
    "file", "gallery", "media_gallery"
  ]).describe("Editor type to use for the field"),
  parameters: z.object({
    allow_uploader: z.boolean().optional().describe("Whether to allow uploading files"),
    media_library_per_upload_config: z.record(z.unknown()).optional().describe("Per-upload media library configuration")
  }).optional()
});

/**
 * Color field appearance
 */
export const colorAppearanceSchema = baseAppearanceSchema.extend({
  editor: z.literal("color_picker").describe("Editor type for color field"),
  parameters: z.object({
    color_format: z.enum(["hex", "rgb", "rgba"]).optional().describe("Format to use for color value"),
    preset_colors: z.array(z.string()).optional().describe("Preset colors to offer in picker")
  }).optional()
});

/**
 * JSON field appearance
 */
export const jsonAppearanceSchema = baseAppearanceSchema.extend({
  editor: z.literal("json_editor").describe("Editor type for JSON field"),
  parameters: z.object({
    schema: z.record(z.unknown()).optional().describe("JSON schema to use for validation"),
    collapse_properties: z.boolean().optional().describe("Whether to collapse properties by default")
  }).optional()
});

/**
 * Geo coordinates field appearance
 */
export const geoAppearanceSchema = baseAppearanceSchema.extend({
  editor: z.literal("lat_lon_editor").describe("Editor type for geo coordinates field"),
  parameters: z.object({
    map_provider: z.enum(["google", "mapbox"]).optional().describe("Map provider to use"),
    default_zoom: z.number().int().min(1).max(22).optional().describe("Default zoom level")
  }).optional()
});

/**
 * SEO field appearance
 */
export const seoAppearanceSchema = baseAppearanceSchema.extend({
  editor: z.literal("seo").describe("Editor type for SEO field")
});

/**
 * Video field appearance
 */
export const videoAppearanceSchema = baseAppearanceSchema.extend({
  editor: z.literal("video").describe("Editor type for video field")
});

/**
 * Creates a field appearance schema based on field type
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

  return appearanceSchemas[fieldType] || baseAppearanceSchema.extend({
    editor: z.string().describe("Editor type to use for the field"),
    parameters: z.record(z.unknown()).optional().describe("Editor parameters")
  });
}

export default {
  createAppearanceSchema,
  fieldAddonSchema,
  baseAppearanceSchema
};