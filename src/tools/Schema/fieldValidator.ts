
/**
 * Simple field validator based on DatoCMS API requirements
 * Reference: https://www.datocms.com/docs/content-management-api/resources/field/create
 */

interface FieldConfig {
  field_type: string;
  validators?: Record<string, unknown>;
  appearance?: {
    editor: string;
    parameters?: Record<string, unknown>;
    addons?: unknown[];
  };
}

/**
 * Default editors for each field type based on DatoCMS documentation
 */
const DEFAULT_EDITORS: Record<string, string> = {
  string: "single_line",
  text: "textarea",
  rich_text: "rich_text",
  structured_text: "structured_text",
  boolean: "boolean",
  integer: "integer",
  float: "float",
  date: "date_picker",
  date_time: "date_time_picker",
  file: "file",
  gallery: "gallery",
  link: "link_select",
  links: "links_select",
  color: "color_picker",
  json: "json_editor",
  lat_lon: "map",
  seo: "seo",
  video: "video",
  slug: "slug",
  single_block: "framed_single_block"
};

/**
 * Field types that require specific validators
 */
const REQUIRED_VALIDATORS: Record<string, string> = {
  rich_text: "rich_text_blocks",
  structured_text: "structured_text_blocks",
  single_block: "single_block_blocks",
  link: "item_item_type",
  links: "items_item_type",
  slug: "slug_title_field"
};

/**
 * Field types that don't support the 'required' validator
 */
const NO_REQUIRED_VALIDATOR = ["gallery", "links", "rich_text"];

/**
 * Validates and prepares field configuration for DatoCMS API
 */
export function validateAndPrepareField(config: FieldConfig): FieldConfig {
  const { field_type, validators = {}, appearance } = config;
  
  // Check for required validators
  const requiredValidator = REQUIRED_VALIDATORS[field_type];
  if (requiredValidator && !validators[requiredValidator]) {
    throw new Error(
      `Field type '${field_type}' requires '${requiredValidator}' validator. ` +
      `See https://www.datocms.com/docs/content-management-api/resources/field/create`
    );
  }
  
  // Check for invalid 'required' validator
  if (validators.required !== undefined && NO_REQUIRED_VALIDATOR.includes(field_type)) {
    throw new Error(
      `Field type '${field_type}' does not support the 'required' validator.`
    );
  }
  
  // Prepare appearance with defaults
  let processedAppearance = appearance || {
    editor: DEFAULT_EDITORS[field_type] || "default_editor",
    parameters: {},
    addons: []
  };
  
  // Ensure addons array exists
  if (!processedAppearance.addons) {
    processedAppearance.addons = [];
  }
  
  // Apply field-specific defaults
  switch (field_type) {
    case "string":
      // String fields with single_line editor need heading parameter
      if (processedAppearance.editor === "single_line" && !processedAppearance.parameters?.heading) {
        processedAppearance.parameters = {
          ...processedAppearance.parameters,
          heading: false
        };
      }
      // String fields with radio/select need enum validator
      if (["string_radio_group", "string_select"].includes(processedAppearance.editor) && !validators.enum) {
        throw new Error(
          `String field with '${processedAppearance.editor}' editor requires 'enum' validator.`
        );
      }
      break;
      
    case "color":
      // Force correct editor for color fields
      processedAppearance.editor = "color_picker";
      processedAppearance.parameters = {
        enable_alpha: false,
        ...processedAppearance.parameters
      };
      break;
      
    case "structured_text":
      // Default parameters for structured text
      processedAppearance.parameters = {
        blocks_start_collapsed: false,
        show_links_target_blank: true,
        show_links_meta_editor: true,
        ...processedAppearance.parameters
      };
      break;
      
    case "lat_lon":
      // Ensure correct editor name
      if (processedAppearance.editor === "lat_lon_editor") {
        processedAppearance.editor = "map";
      }
      break;
  }
  
  return {
    ...config,
    validators,
    appearance: processedAppearance
  };
}

/**
 * Get field type information
 */
export function getFieldTypeInfo(fieldType: string): { 
  defaultEditor: string; 
  requiredValidator?: string;
  supportsRequired: boolean;
} {
  return {
    defaultEditor: DEFAULT_EDITORS[fieldType] || "default_editor",
    requiredValidator: REQUIRED_VALIDATORS[fieldType],
    supportsRequired: !NO_REQUIRED_VALIDATOR.includes(fieldType)
  };
}