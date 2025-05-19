/**
 * Templates for text field types with various appearances
 * These are validated examples that work with the DatoCMS API
 */

/**
 * Text field with textarea appearance
 */
export const textareaTemplate = {
  label: "Description Textarea",
  api_key: "description_textarea",
  field_type: "text",
  hint: "Enter a detailed description",
  appearance: {
    editor: "textarea",
    parameters: {
      placeholder: "Enter detailed description here..."
    },
    addons: []
  },
  validators: {
    required: {}
  }
};

/**
 * Text field with wysiwyg appearance
 */
export const wysiwygTemplate = {
  label: "WYSIWYG Content",
  api_key: "wysiwyg_content",
  field_type: "text",
  hint: "Enter rich text content with formatting",
  appearance: {
    editor: "wysiwyg",
    parameters: {},
    addons: []
  },
  validators: {
    required: {}
  }
};

/**
 * Text field with markdown appearance
 */
export const markdownTemplate = {
  label: "Markdown Content",
  api_key: "markdown_content",
  field_type: "text",
  hint: "Enter content in markdown format",
  appearance: {
    editor: "markdown",
    parameters: {},
    addons: []
  },
  validators: {
    required: {}
  }
};

export default {
  textareaTemplate,
  wysiwygTemplate,
  markdownTemplate
};