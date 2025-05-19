/**
 * Templates for SEO-related field types
 * These are validated examples that work with the DatoCMS API
 */

/**
 * Slug field 
 */
export const slugTemplate = {
  label: "Page Slug",
  api_key: "page_slug",
  field_type: "slug",
  hint: "URL-friendly identifier (used in the page URL)",
  appearance: {
    editor: "slug",
    parameters: {
      url_prefix: "https://example.com/",
      placeholder: "Enter slug here..."
    },
    addons: []
  },
  validators: {
    required: {},
    unique: {},
    slug_title_field: { title_field_id: "title_field_id" }
  }
};

/**
 * SEO field
 */
export const seoTemplate = {
  label: "SEO Metadata",
  api_key: "seo_metadata",
  field_type: "seo",
  hint: "Search engine optimization settings for this content",
  appearance: {
    editor: "seo",
    parameters: {},
    addons: []
  }
};

export default {
  slugTemplate,
  seoTemplate
};