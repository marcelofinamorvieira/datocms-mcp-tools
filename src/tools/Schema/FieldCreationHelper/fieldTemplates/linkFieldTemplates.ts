/**
 * Templates for link and links field types
 */

export const singleLinkTemplate = {
  label: "Primary Author",
  api_key: "primary_author",
  field_type: "link",
  hint: "Select the primary author",
  appearance: {
    editor: "link_select",
    parameters: {},
    addons: []
  },
  validators: {
    item_item_type: { item_types: ["model_id"] }
  }
};

export const multipleLinksTemplate = {
  label: "Related Articles",
  api_key: "related_articles",
  field_type: "links",
  hint: "Select related articles",
  appearance: {
    editor: "links_select",
    parameters: {},
    addons: []
  },
  validators: {
    items_item_type: { item_types: ["model_id"] },
    size: { min: 0, max: 3 }
  }
};

export default {
  singleLinkTemplate,
  multipleLinksTemplate
};
