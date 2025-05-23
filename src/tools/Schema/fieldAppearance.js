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
    editor: z.enum(["textarea", "wysiwyg", "markdown"]).describe("Editor type to use for text fields. Use 'textarea', 'wysiwyg', or 'markdown'."),
    parameters: z
        .object({
        placeholder: z
            .string()
            .optional()
            .describe("Placeholder text shown when field is empty")
    })
        .optional()
        .default({})
        .describe("Editor parameters. Example: { \"placeholder\": \"Enter text...\" }")
});
/**
 * String field appearance
 * Specific to string fields
 */
export const stringAppearanceSchema = baseAppearanceSchema.extend({
    editor: z.enum([
        "single_line",
        "string_radio_group",
        "string_select"
    ]).describe("Editor type to use for string fields. Use 'single_line', 'string_radio_group', or 'string_select'."),
    parameters: z.record(z.unknown()).optional().default({}).describe("Editor parameters. For radio/select editors use 'radios' or 'options' arrays as appropriate.")
}).describe("Appearance for string fields. Example: { \"editor\": \"single_line\", \"parameters\": {}, \"addons\": [] }");
/**
 * Text field appearance
 * Specific to text fields (multi-line)
 */
export const textareaAppearanceSchema = textAppearanceSchema.describe("Appearance for text fields. Example: { \"editor\": \"textarea\", \"parameters\": { \"placeholder\": \"Enter text...\" }, \"addons\": [] }");
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
 * Rich text field appearance
 */
export const richTextAppearanceSchema = baseAppearanceSchema.extend({
    editor: z.literal("rich_text").describe("Editor type for rich_text fields. Use 'rich_text'."),
    parameters: z
        .object({
        start_collapsed: z
            .boolean()
            .optional()
            .default(false)
            .describe("Whether you want block records collapsed by default")
    })
        .optional()
        .default({ start_collapsed: false })
        .describe("Editor parameters for rich text fields. Example: { \"start_collapsed\": false }")
}).describe("Appearance for rich text fields. Example: { \"editor\": \"rich_text\", \"parameters\": { \"start_collapsed\": false }, \"addons\": [] }");
/**
 * Structured text field appearance
 */
export const structuredTextAppearanceSchema = baseAppearanceSchema.extend({
    editor: z.literal("structured_text").describe("Editor type for structured_text fields. Use 'structured_text'."),
    parameters: z
        .object({
        nodes: z
            .array(z.enum(["blockquote", "code", "heading", "link", "list", "thematicBreak"]))
            .optional()
            .describe("Specify which nodes the field should allow."),
        marks: z
            .array(z.enum([
            "strong",
            "emphasis",
            "underline",
            "strikethrough",
            "code",
            "highlight"
        ]))
            .optional()
            .describe("Specify which marks the field should allow."),
        heading_levels: z
            .array(z.number().int().min(1).max(6))
            .optional()
            .describe("If nodes includes 'heading', specify which heading levels the field should allow."),
        blocks_start_collapsed: z
            .boolean()
            .optional()
            .describe("Whether you want block nodes collapsed by default"),
        show_links_target_blank: z
            .boolean()
            .optional()
            .describe("Show the 'Open this link in a new tab?' checkbox"),
        show_links_meta_editor: z
            .boolean()
            .optional()
            .describe("Show the complete meta editor for links")
    })
        .optional()
        .default({})
        .describe("Editor parameters for structured text fields. Example: { \"nodes\": [\"heading\"], \"show_links_target_blank\": true }")
}).describe("Appearance for structured text fields. Example: { \"editor\": \"structured_text\", \"parameters\": { \"nodes\": [\"heading\"] }, \"addons\": [] }");
/**
 * Link field appearance
 * For link and links fields
 */
export const linkAppearanceSchema = baseAppearanceSchema.extend({
    editor: z
        .enum(["link_select", "links_select"])
        .describe("Editor type to use for the field. Use 'link_select' for single links or 'links_select' for multiple."),
    parameters: z.object({
        display_mode: z.enum(["list", "grid", "table"]).optional().describe("How to display linked items"),
        filter_types: z.array(z.string()).optional().describe("Types to filter in selection UI")
    }).optional().default({})
        .describe("Editor parameters. Example: { \"display_mode\": \"list\" }")
}).describe("Appearance for link fields. Example: { \"editor\": \"link_select\", \"parameters\": {}, \"addons\": [] }");
/**
 * Single block field appearance
 */
export const singleBlockAppearanceSchema = baseAppearanceSchema.extend({
    editor: z.enum(["framed_single_block", "frameless_single_block"]).describe("Editor type for single_block fields. Use 'framed_single_block' or 'frameless_single_block'."),
    parameters: z
        .object({
        start_collapsed: z
            .boolean()
            .optional()
            .default(false)
            .describe("Whether you want the block collapsed by default")
    })
        .optional()
        .default({ start_collapsed: false })
        .describe("Editor parameters for single block fields. Example: { \"start_collapsed\": false }")
}).describe("Appearance for single_block fields. Example: { \"editor\": \"framed_single_block\", \"parameters\": { \"start_collapsed\": false }, \"addons\": [] }");
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
 * IMPORTANT: For json fields, two stable editor types are supported:
 * 1. "string_multi_select" - Multi-select dropdown
 * 2. "string_checkbox_group" - Multiple checkbox selection (use "options" parameter)
 * The "json_editor" appearance is documented but currently rejected by the API.
 */
export const jsonAppearanceSchema = baseAppearanceSchema.extend({
    editor: z.enum(["string_multi_select", "string_checkbox_group"])
        .describe("Editor type for JSON field. Use 'string_multi_select' for dropdown multi-select or 'string_checkbox_group' for checkbox group."),
    parameters: z.record(z.unknown()).optional().default({})
        .describe("Editor parameters. For string_checkbox_group, use 'options' not 'checkboxes'. Example for checkbox_group: { \"options\": [{\"label\": \"Option\", \"value\": \"option\"}] }")
}).describe("Appearance for JSON fields with proper configuration. Example: { \"editor\": \"string_multi_select\", \"parameters\": { \"options\": [] }, \"addons\": [] }");
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
 * Slug field appearance
 * IMPORTANT: Always include addons array, even if empty
 */
export const slugAppearanceSchema = baseAppearanceSchema.extend({
    editor: z.literal("slug").describe("Editor type for slug field. Use 'slug'."),
    parameters: z
        .object({
        url_prefix: z.string().optional().describe("URL prefix displayed before the slug"),
        placeholder: z.string().optional().describe("Placeholder text for the slug field")
    })
        .optional()
        .default({})
        .describe("Editor parameters for slug fields. Example: { \"url_prefix\": \"https://example.com/\" }")
}).describe("Appearance for slug fields. Example: { \"editor\": \"slug\", \"parameters\": { \"url_prefix\": \"https://example.com/\" }, \"addons\": [] }");
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
 * IMPORTANT: For `lat_lon` fields the correct API value is "map".
 * "lat_lon_editor" remains for legacy compatibility but may fail validation.
 * For string fields, "string_radio_group" and "string_select" require matching enum validators.
 * For json fields, "string_multi_select" and "string_checkbox_group" require properly formatted options.
 */
const fieldTypeToEditorMap = {
    string: ["single_line", "string_radio_group", "string_select"],
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
    link: ["link_select"],
    links: ["links_select"],
    color: ["color_picker"],
    json: ["string_multi_select", "string_checkbox_group"],
    lat_lon: ["map", "lat_lon_editor"],
    seo: ["seo"],
    video: ["video"],
    slug: ["slug"],
    single_block: ["framed_single_block", "frameless_single_block"]
};
/**
 * Creates a field appearance schema based on field type with helpful examples
 */
export function createAppearanceSchema(fieldType) {
    const appearanceSchemas = {
        string: stringAppearanceSchema,
        text: textareaAppearanceSchema,
        boolean: booleanAppearanceSchema,
        integer: numberAppearanceSchema,
        float: numberAppearanceSchema,
        date: dateAppearanceSchema,
        date_time: dateAppearanceSchema,
        enum: enumAppearanceSchema,
        rich_text: richTextAppearanceSchema,
        structured_text: structuredTextAppearanceSchema,
        link: linkAppearanceSchema,
        links: linkAppearanceSchema,
        file: mediaAppearanceSchema,
        gallery: mediaAppearanceSchema,
        color: colorAppearanceSchema,
        json: jsonAppearanceSchema,
        lat_lon: geoAppearanceSchema,
        seo: seoAppearanceSchema,
        video: videoAppearanceSchema,
        slug: slugAppearanceSchema,
        single_block: singleBlockAppearanceSchema
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
