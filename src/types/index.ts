/**
 * Central type exports for DatoCMS MCP Server
 * This file re-exports all types from the DatoCMS client library
 * and defines our own type aliases for consistency
 */

// Re-export all types from DatoCMS client
export * from '@datocms/cma-client-node';
export type { 
  Client as DatoCMSClient,
  SimpleSchemaTypes,
  SchemaTypes,
  Resources 
} from '@datocms/cma-client-node';

// Import specific types we use frequently
import type { 
  SimpleSchemaTypes as DatoCMSSimpleTypes
} from '@datocms/cma-client-node';

// Type aliases for easier usage
export type DatoCMSFieldType = DatoCMSSimpleTypes.FieldCreateSchema['field_type'];
export type DatoCMSItemType = DatoCMSSimpleTypes.ItemType;
export type DatoCMSField = DatoCMSSimpleTypes.Field;
export type DatoCMSItem = DatoCMSSimpleTypes.Item;
export type DatoCMSUpload = DatoCMSSimpleTypes.Upload;
export type DatoCMSRole = DatoCMSSimpleTypes.Role;
export type DatoCMSUser = DatoCMSSimpleTypes.User;
export type DatoCMSWebhook = DatoCMSSimpleTypes.Webhook;
export type DatoCMSEnvironment = DatoCMSSimpleTypes.Environment;

// Common response types
export interface CollectionResponse<T> {
  data: T[];
  meta: {
    total_count: number;
    page_count?: number;
  };
}

// Pagination types
export interface PaginationParams {
  page?: {
    offset?: number;
    limit?: number;
  };
}

// Error response types
export interface DatoCMSError {
  id: string;
  status: string;
  code: string;
  title: string;
  detail: string;
  source?: {
    pointer?: string;
    parameter?: string;
  };
}

export interface DatoCMSErrorResponse {
  errors: DatoCMSError[];
}

// Validator types
export interface ValidatorMap {
  required?: Record<string, never>;
  unique?: Record<string, never>;
  length?: { min?: number; max?: number };
  enum?: { values: string[] };
  format?: { predefined_pattern?: string; custom_pattern?: string };
  number_range?: { min?: number; max?: number };
  items_item_type?: { item_types: string[] };
  rich_text_blocks?: { item_types: string[] };
  extension?: { predefined_list?: string };
  file_size?: { min_value?: number; max_value?: number };
  image_dimensions?: { 
    width?: { min?: number; max?: number };
    height?: { min?: number; max?: number };
  };
}

// Appearance parameter types
export interface AppearanceParameters {
  // Common parameters
  heading?: boolean;
  placeholder?: string;
  // Text field parameters
  rows?: number;
  // Select field parameters
  options?: Array<{ value: string; label: string }>;
  // Number field parameters
  step?: number;
  // File field parameters
  file_types?: string[];
  // Add more as needed based on field types
  [key: string]: unknown;
}

// Field appearance types
export interface FieldAppearance {
  editor: string;
  parameters: AppearanceParameters;
  addons: Array<{
    id: string;
    field_extension?: string;
    parameters?: Record<string, unknown>;
  }>;
}

// Export helper types
export type * from './guards.js';
export type * from './zod-helpers.js';
export type * from './client.js';