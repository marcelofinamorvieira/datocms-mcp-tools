/**
 * Templates for rich_text field type
 */

export const richTextTemplate = {
  label: "Rich Text Content",
  api_key: "rich_text_content",
  field_type: "rich_text",
  hint: "Rich text content",
  appearance: {
    editor: "rich_text",
    parameters: { start_collapsed: false },
    addons: []
  },
  validators: {
    rich_text_blocks: { item_types: ["block_model_id1", "block_model_id2"] }
  }
};

export default {
  richTextTemplate
};
