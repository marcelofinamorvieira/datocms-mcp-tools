/**
 * Templates for color field type
 */

export const colorPickerTemplate = {
  label: "Brand Color",
  api_key: "brand_color",
  field_type: "color",
  hint: "Select the primary brand color",
  appearance: {
    editor: "color_picker",
    parameters: { enable_alpha: false },
    addons: []
  },
  validators: {
    required: {}
  }
};

export default {
  colorPickerTemplate
};
