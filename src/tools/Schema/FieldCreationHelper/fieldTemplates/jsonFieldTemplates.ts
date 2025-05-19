/**
 * Templates for JSON field types with various appearances
 * These are validated examples that work with the DatoCMS API
 */

/**
 * JSON field with json editor appearance
 */
export const jsonEditorTemplate = {
  label: "Advanced Settings",
  api_key: "advanced_settings",
  field_type: "json",
  hint: "Enter JSON data for advanced configuration options",
  appearance: {
    editor: "json_editor",
    parameters: {},
    addons: []
  },
  validators: {
    required: {}
  }
};

/**
 * JSON field with string_multi_select appearance
 */
export const multiSelectTemplate = {
  label: "Content Tags",
  api_key: "content_tags",
  field_type: "json",
  hint: "Select all applicable tags for this content",
  appearance: {
    editor: "string_multi_select",
    parameters: {
      options: [
        { label: "Technology", value: "technology" },
        { label: "Design", value: "design" },
        { label: "Marketing", value: "marketing" }
      ]
    },
    addons: []
  },
  validators: {
    required: {}
  }
};

/**
 * JSON field with string_checkbox_group appearance
 * IMPORTANT: Use "options" parameter, NOT "checkboxes"
 */
export const checkboxGroupTemplate = {
  label: "Features",
  api_key: "features",
  field_type: "json",
  hint: "Select all applicable features",
  appearance: {
    editor: "string_checkbox_group",
    parameters: {
      options: [
        { label: "Premium Support", value: "premium_support" },
        { label: "Fast Delivery", value: "fast_delivery" },
        { label: "Money Back Guarantee", value: "money_back" }
      ]
    },
    addons: []
  },
  validators: {
    required: {}
  }
};

export default {
  jsonEditorTemplate,
  multiSelectTemplate,
  checkboxGroupTemplate
};