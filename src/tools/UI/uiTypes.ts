/**
 * @file uiTypes.ts
 * @description Type definitions for the UI module entities
 */

// Common types
export type UIIdentity = string;
export type UIType = 'menu_item' | 'schema_menu_item' | 'uploads_filter' | 'model_filter' | 'plugin';

// Base interface for UI meta information
export interface UIMeta {
  created_at: string;
  updated_at: string;
  publishable?: boolean;
  status?: string;
  creator?: string;
}

// MenuItem types
export type MenuItemIdentity = UIIdentity;
export type MenuItemType = 'menu_item';

/**
 * MenuItem represents a navigational item in the DatoCMS admin area
 */
export interface MenuItem {
  id: MenuItemIdentity;
  type: MenuItemType;
  label: string;
  position?: number;
  external_url?: string | null;
  open_in_new_tab?: boolean;
  parent_id?: string | null;
  item_type_id?: string | null;
  item_type_filter_id?: string | null;
  meta: UIMeta;
}

export interface MenuItemCreateParams {
  label: string;
  position?: number;
  external_url?: string | null;
  open_in_new_tab?: boolean;
  parent_id?: string | null;
  item_type_id?: string | null;
  item_type_filter_id?: string | null;
}

export interface MenuItemUpdateParams {
  label?: string;
  position?: number;
  external_url?: string | null;
  open_in_new_tab?: boolean;
  parent_id?: string | null;
  item_type_id?: string | null;
  item_type_filter_id?: string | null;
}

// SchemaMenuItem types
export type SchemaMenuItemIdentity = UIIdentity;
export type SchemaMenuItemType = 'schema_menu_item';

/**
 * SchemaMenuItem represents a menu item specifically for the schema section
 */
export interface SchemaMenuItem {
  id: SchemaMenuItemIdentity;
  type: SchemaMenuItemType;
  label: string;
  position: number;
  item_type_id?: string | null;
  meta: UIMeta;
}

export interface SchemaMenuItemCreateParams {
  label: string;
  position?: number;
  item_type_id?: string | null;
}

export interface SchemaMenuItemUpdateParams {
  label?: string;
  position?: number;
  item_type_id?: string | null;
}

// UploadsFilter types
export type UploadsFilterIdentity = UIIdentity;
export type UploadsFilterType = 'uploads_filter';

/**
 * UploadsFilter represents a filter for uploads in the media library
 */
export interface UploadsFilter {
  id: UploadsFilterIdentity;
  type: UploadsFilterType;
  name: string;
  filter: {
    type: string;
    attributes: {
      [key: string]: any;
    };
  };
  shared: boolean;
  meta: UIMeta;
}

export interface UploadsFilterCreateParams {
  name: string;
  filter: {
    type: string;
    attributes: {
      [key: string]: any;
    };
  };
  shared?: boolean;
}

export interface UploadsFilterUpdateParams {
  name?: string;
  filter?: {
    type: string;
    attributes: {
      [key: string]: any;
    };
  };
  shared?: boolean;
}

// ModelFilter types
export type ModelFilterIdentity = UIIdentity;
export type ModelFilterType = 'model_filter';

/**
 * ModelFilter represents a filter for content models
 */
export interface ModelFilter {
  id: ModelFilterIdentity;
  type: ModelFilterType;
  name: string;
  filter: {
    type: string;
    attributes: {
      [key: string]: any;
    };
  };
  item_type_id: string;
  shared: boolean;
  meta: UIMeta;
}

export interface ModelFilterCreateParams {
  name: string;
  filter: {
    type: string;
    attributes: {
      [key: string]: any;
    };
  };
  item_type_id: string; // We'll convert this internally to item_type which is what the API expects
  shared?: boolean;
}

export interface ModelFilterUpdateParams {
  name?: string;
  filter?: {
    type: string;
    attributes: {
      [key: string]: any;
    };
  };
  item_type_id?: string;
  shared?: boolean;
}

// Plugin types
export type PluginIdentity = UIIdentity;
export type PluginType = 'plugin';

/**
 * Plugin represents a DatoCMS plugin
 */
export interface Plugin {
  id: PluginIdentity;
  type: PluginType;
  name: string;
  url: string;
  package_name?: string | null;
  parameters_schema?: {
    [key: string]: any;
  } | null;
  field_types?: string[] | null;
  field_extensions?: string[] | null;
  sidebar_extensions?: string[] | null;
  meta: UIMeta;
}

export interface PluginCreateParams {
  name: string;
  url: string;
  package_name?: string | null;
  parameters_schema?: {
    [key: string]: any;
  } | null;
  field_types?: string[] | null;
  field_extensions?: string[] | null;
  sidebar_extensions?: string[] | null;
}

export interface PluginUpdateParams {
  name?: string;
  url?: string;
  package_name?: string | null;
  parameters_schema?: {
    [key: string]: any;
  } | null;
  field_types?: string[] | null;
  field_extensions?: string[] | null;
  sidebar_extensions?: string[] | null;
}

// Error types
export type UIErrorType = 'ui_error' | 'ui_validation_error' | 'ui_not_found_error' | 'ui_auth_error';

export interface UIError {
  type: UIErrorType;
  message: string;
  details?: string;
}

export interface UIValidationError extends UIError {
  type: 'ui_validation_error';
  validationErrors: Array<{
    field?: string;
    message: string;
  }>;
}

export interface UINotFoundError extends UIError {
  type: 'ui_not_found_error';
  resourceId: string;
  resourceType: UIType;
}

export interface UIAuthorizationError extends UIError {
  type: 'ui_auth_error';
}

// Type guards for error handling
export function isUIError(error: unknown): error is UIError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    typeof (error as UIError).type === 'string' &&
    (error as UIError).type.startsWith('ui_') &&
    'message' in error &&
    typeof (error as UIError).message === 'string'
  );
}

export function isUIValidationError(error: unknown): error is UIValidationError {
  return (
    isUIError(error) &&
    (error as UIError).type === 'ui_validation_error' &&
    'validationErrors' in error &&
    Array.isArray((error as UIValidationError).validationErrors)
  );
}

export function isUINotFoundError(error: unknown): error is UINotFoundError {
  return (
    isUIError(error) &&
    (error as UIError).type === 'ui_not_found_error' &&
    'resourceId' in error &&
    'resourceType' in error
  );
}

export function isUIAuthorizationError(error: unknown): error is UIAuthorizationError {
  return isUIError(error) && (error as UIError).type === 'ui_auth_error';
}

// Response types
export interface UISuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface UIErrorResponse {
  success: false;
  error: string;
  message?: string;
  validationErrors?: Array<{
    field?: string;
    message: string;
  }>;
}

export type UIResponse<T> = UISuccessResponse<T> | UIErrorResponse;

// Menu item responses
export type GetMenuItemResponse = UIResponse<MenuItem>;
export type ListMenuItemsResponse = UIResponse<MenuItem[]>;
export type CreateMenuItemResponse = UIResponse<MenuItem>;
export type UpdateMenuItemResponse = UIResponse<MenuItem>;
export type DeleteMenuItemResponse = UIResponse<void>;

// Schema menu item responses
export type GetSchemaMenuItemResponse = UIResponse<SchemaMenuItem>;
export type ListSchemaMenuItemsResponse = UIResponse<SchemaMenuItem[]>;
export type CreateSchemaMenuItemResponse = UIResponse<SchemaMenuItem>;
export type UpdateSchemaMenuItemResponse = UIResponse<SchemaMenuItem>;
export type DeleteSchemaMenuItemResponse = UIResponse<void>;

// Uploads filter responses
export type GetUploadsFilterResponse = UIResponse<UploadsFilter>;
export type ListUploadsFiltersResponse = UIResponse<UploadsFilter[]>;
export type CreateUploadsFilterResponse = UIResponse<UploadsFilter>;
export type UpdateUploadsFilterResponse = UIResponse<UploadsFilter>;
export type DeleteUploadsFilterResponse = UIResponse<void>;

// Model filter responses
export type GetModelFilterResponse = UIResponse<ModelFilter>;
export type ListModelFiltersResponse = UIResponse<ModelFilter[]>;
export type CreateModelFilterResponse = UIResponse<ModelFilter>;
export type UpdateModelFilterResponse = UIResponse<ModelFilter>;
export type DeleteModelFilterResponse = UIResponse<void>;

// Plugin responses
export type GetPluginResponse = UIResponse<Plugin>;
export type ListPluginsResponse = UIResponse<Plugin[]>;
export type CreatePluginResponse = UIResponse<Plugin>;
export type UpdatePluginResponse = UIResponse<Plugin>;
export type DeletePluginResponse = UIResponse<void>;