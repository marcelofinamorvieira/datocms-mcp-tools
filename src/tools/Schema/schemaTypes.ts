/**
 * Schema Module Type Definitions
 * 
 * This file contains type definitions for the Schema module, including
 * ItemTypes, Fields, and Fieldsets. These types are aligned with the DatoCMS API
 * but adapted to our specific needs.
 */

// Base API types from DatoCMS SimpleSchemaTypes
export type ItemTypeIdentity = string;
export type FieldIdentity = string;
export type FieldsetIdentity = string;

export type FieldType = 'field';
export type ItemTypeType = 'item_type';
export type FieldsetType = 'fieldset';

// Re-export field types for better documentation and type safety
export type DatoCMSFieldType = 
  | 'boolean' 
  | 'color' 
  | 'date' 
  | 'date_time' 
  | 'file' 
  | 'float' 
  | 'gallery' 
  | 'integer' 
  | 'json' 
  | 'lat_lon' 
  | 'link' 
  | 'links' 
  | 'rich_text' 
  | 'seo' 
  | 'single_block' 
  | 'slug' 
  | 'string' 
  | 'structured_text' 
  | 'text' 
  | 'video';

// Collection appearance types
export type CollectionAppearance = 'compact' | 'table';

// Ordering direction types
export type OrderingDirection = 'asc' | 'desc';

// Metadata for schema objects
export interface SchemaMeta {
  created_at: string;
  updated_at: string;
}

/**
 * ItemType represents a content model in DatoCMS
 */
export interface ItemType {
  id: ItemTypeIdentity;
  type: ItemTypeType;
  name: string;
  api_key: string;
  singleton: boolean;
  sortable: boolean;
  modular_block: boolean;
  draft_mode_active: boolean;
  all_locales_required: boolean;
  collection_appearance: CollectionAppearance;
  tree: boolean;
  ordering_direction?: OrderingDirection;
  ordering_field?: string | null;
  title_field?: string | null;
  workflow_enabled?: boolean;
  hint?: string | null;
  inverse_relationships_enabled?: boolean;
  meta: SchemaMeta;
}

/**
 * Field represents a content field within an ItemType
 */
export interface Field {
  id: FieldIdentity;
  type: FieldType;
  label: string;
  field_type: DatoCMSFieldType;
  api_key: string;
  hint: string | null;
  localized: boolean;
  validators: Record<string, unknown>;
  position: number;
  apperance?: {
    editor: string;
    parameters: Record<string, unknown>;
    addons?: Array<{
      id: string;
      field_extension?: string;
      parameters: Record<string, unknown>;
    }>;
  };
  default_value: boolean | null | string | number | Record<string, unknown>;
  fieldset_id?: string | null;
  item_type_id: string;
  meta: SchemaMeta;
}

/**
 * Fieldset represents a grouping of fields in DatoCMS
 */
export interface Fieldset {
  id: FieldsetIdentity;
  type: FieldsetType;
  title: string;
  hint: string | null;
  position: number;
  collapsible: boolean;
  start_collapsed: boolean;
  item_type_id: string;
  meta: SchemaMeta;
}

// Error types
export interface DatoCMSApiError {
  code: string;
  status: number;
  message: string;
}

export interface DatoCMSValidationError extends DatoCMSApiError {
  code: 'VALIDATION_ERROR';
  status: 422;
  errors?: Array<{
    field?: string;
    message: string;
    details?: unknown;
  }>;
}

export interface DatoCMSNotFoundError extends DatoCMSApiError {
  code: 'ENTITY_NOT_FOUND';
  status: 404;
}

export interface DatoCMSAuthorizationError extends DatoCMSApiError {
  code: 'UNAUTHORIZED';
  status: 401;
}

// Type guards for error handling
export function isDatoCMSValidationError(error: unknown): error is DatoCMSValidationError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'VALIDATION_ERROR' &&
    'status' in error &&
    error.status === 422
  );
}

export function isDatoCMSNotFoundError(error: unknown): error is DatoCMSNotFoundError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'ENTITY_NOT_FOUND' &&
    'status' in error &&
    error.status === 404
  );
}

export function isDatoCMSAuthorizationError(error: unknown): error is DatoCMSAuthorizationError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'UNAUTHORIZED' &&
    'status' in error &&
    error.status === 401
  );
}

// Parameter types for operations
export interface ItemTypeCreateParams {
  name: string;
  api_key: string;
  all_locales_required?: boolean;
  collection_appearance?: CollectionAppearance;
  draft_mode_active?: boolean;
  modular_block?: boolean;
  ordering_direction?: OrderingDirection;
  ordering_field?: string;
  singleton?: boolean;
  sortable?: boolean;
  title_field?: string;
  tree?: boolean;
  inverse_relationships_enabled?: boolean;
  workflow_enabled?: boolean;
  hint?: string | null;
}

export interface ItemTypeUpdateParams {
  name?: string;
  api_key?: string;
  all_locales_required?: boolean;
  collection_appearance?: CollectionAppearance;
  draft_mode_active?: boolean;
  modular_block?: boolean;
  ordering_direction?: OrderingDirection;
  ordering_field?: string;
  singleton?: boolean;
  sortable?: boolean;
  title_field?: string;
  tree?: boolean;
  inverse_relationships_enabled?: boolean;
  workflow_enabled?: boolean;
  hint?: string | null;
}

export interface FieldsetCreateParams {
  title: string;
  hint?: string | null;
  position?: number;
  collapsible?: boolean;
  start_collapsed?: boolean;
}

export interface FieldsetUpdateParams {
  title?: string;
  hint?: string | null;
  position?: number;
  collapsible?: boolean;
  start_collapsed?: boolean;
}

export interface FieldCreateParams {
  label: string;
  api_key: string;
  field_type: DatoCMSFieldType;
  validators?: Record<string, unknown>;
  appearance?: {
    editor: string;
    parameters: Record<string, unknown>;
    addons?: Array<{
      id: string;
      field_extension?: string;
      parameters: Record<string, unknown>;
    }>;
  };
  position?: number;
  hint?: string | null;
  localized?: boolean;
  fieldset_id?: string;
  default_value?: boolean | null | string | number | Record<string, unknown>;
}

export interface FieldUpdateParams {
  label?: string;
  api_key?: string;
  field_type?: DatoCMSFieldType;
  validators?: Record<string, unknown>;
  appearance?: {
    editor: string;
    parameters: Record<string, unknown>;
    addons?: Array<{
      id: string;
      field_extension?: string;
      parameters: Record<string, unknown>;
    }>;
  };
  position?: number;
  hint?: string | null;
  localized?: boolean;
  fieldset_id?: string;
  default_value?: boolean | null | string | number | Record<string, unknown>;
}

// Type adapter functions to convert between API and internal types
export function adaptApiItemType(apiItemType: any): ItemType {
  return {
    id: apiItemType.id,
    type: apiItemType.type,
    name: apiItemType.name,
    api_key: apiItemType.api_key,
    singleton: apiItemType.singleton,
    sortable: apiItemType.sortable,
    modular_block: apiItemType.modular_block,
    draft_mode_active: apiItemType.draft_mode_active,
    all_locales_required: apiItemType.all_locales_required,
    collection_appearance: apiItemType.collection_appearance,
    tree: apiItemType.tree,
    ordering_direction: apiItemType.ordering_direction,
    ordering_field: apiItemType.ordering_field,
    title_field: apiItemType.title_field,
    workflow_enabled: apiItemType.workflow_enabled,
    hint: apiItemType.hint,
    inverse_relationships_enabled: apiItemType.inverse_relationships_enabled,
    meta: {
      created_at: apiItemType.meta?.created_at || new Date().toISOString(),
      updated_at: apiItemType.meta?.updated_at || new Date().toISOString()
    }
  };
}

export function adaptApiField(apiField: any): Field {
  return {
    id: apiField.id,
    type: apiField.type,
    label: apiField.label,
    field_type: apiField.field_type,
    api_key: apiField.api_key,
    hint: apiField.hint,
    localized: apiField.localized,
    validators: apiField.validators || {},
    position: apiField.position,
    apperance: apiField.apperance,
    default_value: apiField.default_value,
    fieldset_id: apiField.fieldset_id,
    item_type_id: apiField.item_type_id,
    meta: {
      created_at: apiField.meta?.created_at || new Date().toISOString(),
      updated_at: apiField.meta?.updated_at || new Date().toISOString()
    }
  };
}

export function adaptApiFieldset(apiFieldset: any): Fieldset {
  return {
    id: apiFieldset.id,
    type: apiFieldset.type,
    title: apiFieldset.title,
    hint: apiFieldset.hint,
    position: apiFieldset.position,
    collapsible: apiFieldset.collapsible,
    start_collapsed: apiFieldset.start_collapsed,
    item_type_id: apiFieldset.item_type_id,
    meta: {
      created_at: apiFieldset.meta?.created_at || new Date().toISOString(),
      updated_at: apiFieldset.meta?.updated_at || new Date().toISOString()
    }
  };
}