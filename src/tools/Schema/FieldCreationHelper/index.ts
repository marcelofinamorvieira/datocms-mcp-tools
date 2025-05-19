/**
 * Field Creation Helper Module
 * 
 * This module helps with the creation of DatoCMS fields by providing templates
 * and documentation for different field types and appearances.
 */

import { getFieldTypeInfoHandler } from './handlers/index.js';
import { fieldTemplates, getFieldTemplate, getFieldTypeTemplates, getAvailableFieldTypes, getAvailableAppearances } from './fieldTemplates/index.js';

export {
  // Handlers
  getFieldTypeInfoHandler,
  
  // Templates
  fieldTemplates,
  getFieldTemplate,
  getFieldTypeTemplates,
  getAvailableFieldTypes,
  getAvailableAppearances
};