/**
 * Templates for structured_text field type
 */

export const structuredTextTemplate = {
  label: "Structured Content",
  api_key: "structured_content",
  field_type: "structured_text",
  hint: "Structured text content",
  appearance: {
    editor: "structured_text",
    parameters: {},
    addons: []
  },
  validators: {
    structured_text_blocks: { item_types: [] }
  }
};

export default {
  structuredTextTemplate
};
