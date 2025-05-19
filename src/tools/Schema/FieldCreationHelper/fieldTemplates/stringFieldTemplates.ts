/**
 * Templates for string field types with various appearances
 * These are validated examples that work with the DatoCMS API
 */

/**
 * String field with single_line appearance
 */
export const singleLineStringTemplate = {
  label: "Single Line String",
  api_key: "single_line_string",
  field_type: "string",
  hint: "Enter a single line of text",
  appearance: {
    editor: "single_line",
    parameters: {
      heading: false
    },
    addons: []
  },
  validators: {
    required: {}
  }
};

/**
 * String field with string_radio_group appearance
 */
export const radioGroupStringTemplate = {
  label: "Radio Group String",
  api_key: "radio_group_string",
  field_type: "string",
  hint: "Select one option from the radio group",
  appearance: {
    editor: "string_radio_group",
    parameters: {
      radios: [
        { label: "Option A", value: "option_a" },
        { label: "Option B", value: "option_b" },
        { label: "Option C", value: "option_c" }
      ]
    },
    addons: []
  },
  validators: {
    required: {},
    enum: { values: ["option_a", "option_b", "option_c"] }
  }
};

/**
 * String field with string_select appearance
 */
export const selectStringTemplate = {
  label: "String Select",
  api_key: "string_select",
  field_type: "string",
  hint: "Select one option from the dropdown",
  appearance: {
    editor: "string_select",
    parameters: {
      options: [
        { label: "Option A", value: "option_a" },
        { label: "Option B", value: "option_b" },
        { label: "Option C", value: "option_c" }
      ]
    },
    addons: []
  },
  validators: {
    required: {},
    enum: { values: ["option_a", "option_b", "option_c"] }
  }
};

export default {
  singleLineStringTemplate,
  radioGroupStringTemplate,
  selectStringTemplate
};