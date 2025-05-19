/**
 * Index file for field templates
 * Exports all field templates grouped by field type
 */

import stringTemplates from './stringFieldTemplates.js';
import textTemplates from './textFieldTemplates.js';
import locationTemplates from './locationFieldTemplates.js';
import seoTemplates from './seoFieldTemplates.js';
import jsonTemplates from './jsonFieldTemplates.js';
import richTextTemplates from './richTextFieldTemplates.js';
import structuredTextTemplates from './structuredTextFieldTemplates.js';
import singleBlockTemplates from './singleBlockFieldTemplates.js';

// Define field template structure
export interface FieldTemplate {
  label: string;
  api_key: string;
  field_type: string;
  hint?: string;
  appearance: {
    editor: string;
    parameters: Record<string, any>;
    addons: any[];
  };
  validators?: Record<string, any>;
  default_value?: any;
  localized?: boolean;
}

// Define field templates map structure
export interface FieldTemplatesMap {
  [fieldType: string]: {
    [appearance: string]: FieldTemplate;
  };
}

/**
 * All field templates organized by field type
 */
export const fieldTemplates: FieldTemplatesMap = {
  string: {
    single_line: stringTemplates.singleLineStringTemplate,
    string_radio_group: stringTemplates.radioGroupStringTemplate,
    string_select: stringTemplates.selectStringTemplate
  },
  text: {
    textarea: textTemplates.textareaTemplate,
    wysiwyg: textTemplates.wysiwygTemplate,
    markdown: textTemplates.markdownTemplate
  },
  lat_lon: {
    map: locationTemplates.locationTemplate
  },
  slug: {
    slug: seoTemplates.slugTemplate
  },
  seo: {
    seo: seoTemplates.seoTemplate
  },
  json: {
    string_multi_select: jsonTemplates.multiSelectTemplate,
    string_checkbox_group: jsonTemplates.checkboxGroupTemplate
  },
  rich_text: {
    rich_text: richTextTemplates.richTextTemplate
  },
  structured_text: {
    structured_text: structuredTextTemplates.structuredTextTemplate
  },
  single_block: {
    framed_single_block: singleBlockTemplates.singleBlockTemplate
  }
};

/**
 * Get a template for a specific field type and appearance
 */
export function getFieldTemplate(fieldType: string, appearance: string): FieldTemplate | undefined {
  return fieldTemplates[fieldType]?.[appearance];
}

/**
 * Get all templates for a specific field type
 */
export function getFieldTypeTemplates(fieldType: string): Record<string, FieldTemplate> {
  return fieldTemplates[fieldType] || {};
}

/**
 * Get all available field types
 */
export function getAvailableFieldTypes(): string[] {
  return Object.keys(fieldTemplates);
}

/**
 * Get all available appearances for a field type
 */
export function getAvailableAppearances(fieldType: string): string[] {
  return Object.keys(fieldTemplates[fieldType] || {});
}

export default {
  fieldTemplates,
  getFieldTemplate,
  getFieldTypeTemplates,
  getAvailableFieldTypes,
  getAvailableAppearances
};