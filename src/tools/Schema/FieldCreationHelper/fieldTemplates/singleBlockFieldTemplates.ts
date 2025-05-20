/**
 * Templates for single_block field type
 */

export const singleBlockTemplate = {
  label: "Hero Block",
  api_key: "hero_block",
  field_type: "single_block",
  hint: "Select a single content block",
  appearance: {
    editor: "framed_single_block",
    parameters: { start_collapsed: false },
    addons: []
  },
  validators: {
    single_block_blocks: { item_types: [] }
  }
};

export default {
  singleBlockTemplate
};
