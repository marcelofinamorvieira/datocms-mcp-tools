/**
 * @file uiClient.ts
 * @description Typed client interfaces and implementation for the UI module
 */

import { Client } from '@datocms/cma-client-node';
import {
  MenuItem, MenuItemCreateParams, MenuItemUpdateParams,
  SchemaMenuItem, SchemaMenuItemCreateParams, SchemaMenuItemUpdateParams,
  UploadsFilter, UploadsFilterCreateParams, UploadsFilterUpdateParams,
  ModelFilter, ModelFilterCreateParams, ModelFilterUpdateParams,
  Plugin, PluginCreateParams, PluginUpdateParams,
  UIError, UIValidationError, UINotFoundError, UIAuthorizationError
} from './uiTypes.js';

/**
 * UIClient interface for type-safe operations on UI entities
 */
export interface UIClient {
  // MenuItem operations
  listMenuItems(params?: { offset?: number; limit?: number }): Promise<MenuItem[]>;
  findMenuItem(id: string): Promise<MenuItem>;
  createMenuItem(data: MenuItemCreateParams): Promise<MenuItem>;
  updateMenuItem(id: string, data: MenuItemUpdateParams): Promise<MenuItem>;
  deleteMenuItem(id: string, params?: { force?: boolean }): Promise<void>;

  // SchemaMenuItem operations
  listSchemaMenuItems(params?: { offset?: number; limit?: number }): Promise<SchemaMenuItem[]>;
  findSchemaMenuItem(id: string): Promise<SchemaMenuItem>;
  createSchemaMenuItem(data: SchemaMenuItemCreateParams): Promise<SchemaMenuItem>;
  updateSchemaMenuItem(id: string, data: SchemaMenuItemUpdateParams): Promise<SchemaMenuItem>;
  deleteSchemaMenuItem(id: string): Promise<void>;

  // UploadsFilter operations
  listUploadsFilters(params?: { offset?: number; limit?: number }): Promise<UploadsFilter[]>;
  findUploadsFilter(id: string): Promise<UploadsFilter>;
  createUploadsFilter(data: UploadsFilterCreateParams): Promise<UploadsFilter>;
  updateUploadsFilter(id: string, data: UploadsFilterUpdateParams): Promise<UploadsFilter>;
  deleteUploadsFilter(id: string): Promise<void>;

  // ModelFilter operations
  listModelFilters(params?: { offset?: number; limit?: number }): Promise<ModelFilter[]>;
  findModelFilter(id: string): Promise<ModelFilter>;
  createModelFilter(data: ModelFilterCreateParams): Promise<ModelFilter>;
  updateModelFilter(id: string, data: ModelFilterUpdateParams): Promise<ModelFilter>;
  deleteModelFilter(id: string): Promise<void>;

  // Plugin operations
  listPlugins(params?: { offset?: number; limit?: number }): Promise<Plugin[]>;
  findPlugin(id: string): Promise<Plugin>;
  createPlugin(data: PluginCreateParams): Promise<Plugin>;
  updatePlugin(id: string, data: PluginUpdateParams): Promise<Plugin>;
  deletePlugin(id: string): Promise<void>;
}

/**
 * Adapters to convert API responses to our strongly-typed interfaces
 */
export const uiAdapters = {
  // MenuItem adapters
  toMenuItem(apiMenuItem: any): MenuItem {
    // Add safety checks for undefined objects
    if (!apiMenuItem || !apiMenuItem.attributes) {
      throw new Error('Invalid menu item structure: missing attributes');
    }
    
    return {
      id: apiMenuItem.id,
      type: apiMenuItem.type,
      label: apiMenuItem.attributes.label,
      position: apiMenuItem.attributes.position,
      external_url: apiMenuItem.attributes.external_url,
      open_in_new_tab: apiMenuItem.attributes.open_in_new_tab,
      parent_id: apiMenuItem.attributes.parent_id,
      item_type_id: apiMenuItem.attributes.item_type_id,
      item_type_filter_id: apiMenuItem.attributes.item_type_filter_id,
      meta: {
        created_at: apiMenuItem.meta?.created_at,
        updated_at: apiMenuItem.meta?.updated_at
      }
    };
  },

  // SchemaMenuItem adapters
  toSchemaMenuItem(apiSchemaMenuItem: any): SchemaMenuItem {
    // Add safety checks for undefined objects
    if (!apiSchemaMenuItem || !apiSchemaMenuItem.attributes) {
      throw new Error('Invalid schema menu item structure: missing attributes');
    }
    
    return {
      id: apiSchemaMenuItem.id,
      type: apiSchemaMenuItem.type,
      label: apiSchemaMenuItem.attributes.label,
      position: apiSchemaMenuItem.attributes.position,
      item_type_id: apiSchemaMenuItem.attributes.item_type_id,
      meta: {
        created_at: apiSchemaMenuItem.meta?.created_at,
        updated_at: apiSchemaMenuItem.meta?.updated_at
      }
    };
  },

  // UploadsFilter adapters
  toUploadsFilter(apiUploadsFilter: any): UploadsFilter {
    // Add safety checks for undefined objects
    if (!apiUploadsFilter || !apiUploadsFilter.attributes) {
      throw new Error('Invalid uploads filter structure: missing attributes');
    }
    
    return {
      id: apiUploadsFilter.id,
      type: apiUploadsFilter.type,
      name: apiUploadsFilter.attributes.name,
      filter: apiUploadsFilter.attributes.filter,
      shared: apiUploadsFilter.attributes.shared,
      meta: {
        created_at: apiUploadsFilter.meta?.created_at,
        updated_at: apiUploadsFilter.meta?.updated_at
      }
    };
  },

  // ModelFilter adapters
  toModelFilter(apiModelFilter: any): ModelFilter {
    // Add safety checks for undefined objects
    if (!apiModelFilter || !apiModelFilter.attributes) {
      throw new Error('Invalid model filter structure: missing attributes');
    }
    
    return {
      id: apiModelFilter.id,
      type: apiModelFilter.type,
      name: apiModelFilter.attributes.name,
      filter: apiModelFilter.attributes.filter,
      item_type_id: apiModelFilter.attributes.item_type_id,
      shared: apiModelFilter.attributes.shared,
      meta: {
        created_at: apiModelFilter.meta?.created_at,
        updated_at: apiModelFilter.meta?.updated_at
      }
    };
  },

  // Plugin adapters
  toPlugin(apiPlugin: any): Plugin {
    // Add safety checks for undefined objects
    if (!apiPlugin || !apiPlugin.attributes) {
      throw new Error('Invalid plugin structure: missing attributes');
    }
    
    return {
      id: apiPlugin.id,
      type: apiPlugin.type,
      name: apiPlugin.attributes.name,
      url: apiPlugin.attributes.url,
      package_name: apiPlugin.attributes.package_name,
      parameters_schema: apiPlugin.attributes.parameters_schema,
      field_types: apiPlugin.attributes.field_types,
      field_extensions: apiPlugin.attributes.field_extensions,
      sidebar_extensions: apiPlugin.attributes.sidebar_extensions,
      meta: {
        created_at: apiPlugin.meta?.created_at,
        updated_at: apiPlugin.meta?.updated_at
      }
    };
  }
};

/**
 * Error factory functions
 */
export const uiErrorFactory = {
  createUIError(message: string, details?: string): UIError {
    return {
      type: 'ui_error',
      message,
      details
    };
  },

  createValidationError(message: string, validationErrors: Array<{ field?: string; message: string }>): UIValidationError {
    return {
      type: 'ui_validation_error',
      message,
      validationErrors
    };
  },

  createNotFoundError(resourceId: string, resourceType: 'menu_item' | 'schema_menu_item' | 'uploads_filter' | 'model_filter' | 'plugin'): UINotFoundError {
    return {
      type: 'ui_not_found_error',
      message: `${resourceType} with ID '${resourceId}' not found`,
      resourceId,
      resourceType
    };
  },

  createAuthorizationError(message: string = 'Unauthorized'): UIAuthorizationError {
    return {
      type: 'ui_auth_error',
      message
    };
  }
};

/**
 * Typed implementation of the UIClient interface
 */
export class TypedUIClient implements UIClient {
  private client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  // MenuItem methods
  async listMenuItems(_params?: { offset?: number; limit?: number }): Promise<MenuItem[]> {
    try {
      // Using default parameters as the API requires specific format
      const response = await this.client.menuItems.list();
      
      // Filter out any invalid items and map valid ones
      const validItems: MenuItem[] = [];
      for (const item of response) {
        try {
          validItems.push(uiAdapters.toMenuItem(item));
        } catch (conversionError) {
          // Log the error (will be captured in debug info if DEBUG=true)
          console.error('Failed to convert menu item:', conversionError, 'Raw item:', item);
          // Skip this item and continue with others
        }
      }
      
      return validItems;
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }

  async findMenuItem(id: string): Promise<MenuItem> {
    try {
      const response = await this.client.menuItems.find(id);
      if (!response) {
        throw uiErrorFactory.createNotFoundError(id, 'menu_item');
      }
      return uiAdapters.toMenuItem(response);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }

  async createMenuItem(data: MenuItemCreateParams): Promise<MenuItem> {
    try {
      const response = await this.client.menuItems.create(data);
      return uiAdapters.toMenuItem(response);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }

  async updateMenuItem(id: string, data: MenuItemUpdateParams): Promise<MenuItem> {
    try {
      const response = await this.client.menuItems.update(id, data);
      return uiAdapters.toMenuItem(response);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }

  async deleteMenuItem(id: string, _params?: { force?: boolean }): Promise<void> {
    try {
      await this.client.menuItems.destroy(id);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }

  // SchemaMenuItem methods
  async listSchemaMenuItems(_params?: { offset?: number; limit?: number }): Promise<SchemaMenuItem[]> {
    try {
      // Using default parameters as the API requires specific format
      const response = await this.client.schemaMenuItems.list();
      return response.map(uiAdapters.toSchemaMenuItem);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }

  async findSchemaMenuItem(id: string): Promise<SchemaMenuItem> {
    try {
      const response = await this.client.schemaMenuItems.find(id);
      if (!response) {
        throw uiErrorFactory.createNotFoundError(id, 'schema_menu_item');
      }
      return uiAdapters.toSchemaMenuItem(response);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }

  async createSchemaMenuItem(data: SchemaMenuItemCreateParams): Promise<SchemaMenuItem> {
    try {
      const response = await this.client.schemaMenuItems.create({
        ...data,
        kind: 'item_type'
      });
      return uiAdapters.toSchemaMenuItem(response);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }

  async updateSchemaMenuItem(id: string, data: SchemaMenuItemUpdateParams): Promise<SchemaMenuItem> {
    try {
      const response = await this.client.schemaMenuItems.update(id, data);
      return uiAdapters.toSchemaMenuItem(response);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }

  async deleteSchemaMenuItem(id: string): Promise<void> {
    try {
      await this.client.schemaMenuItems.destroy(id);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }

  // UploadsFilter methods
  async listUploadsFilters(_params?: { offset?: number; limit?: number }): Promise<UploadsFilter[]> {
    try {
      const response = await this.client.uploadFilters.list();
      return response.map(uiAdapters.toUploadsFilter);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }

  async findUploadsFilter(id: string): Promise<UploadsFilter> {
    try {
      const response = await this.client.uploadFilters.find(id);
      if (!response) {
        throw uiErrorFactory.createNotFoundError(id, 'uploads_filter');
      }
      return uiAdapters.toUploadsFilter(response);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }

  async createUploadsFilter(data: UploadsFilterCreateParams): Promise<UploadsFilter> {
    try {
      const response = await this.client.uploadFilters.create({
        ...data,
        shared: data.shared || false
      });
      return uiAdapters.toUploadsFilter(response);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }

  async updateUploadsFilter(id: string, data: UploadsFilterUpdateParams): Promise<UploadsFilter> {
    try {
      // CMA client requires full data, but we can't get the current filter to merge
      // So we'll construct a complete update object with safe defaults for any missing fields
      const updateData = {
        name: data.name || 'Uploads Filter', // Provide a default if not specified
        filter: data.filter || { type: 'filter', attributes: {} }, // Provide a default if not specified
        shared: data.shared !== undefined ? data.shared : false // Default to false if not specified
      };
      
      const response = await this.client.uploadFilters.update(id, updateData);
      return uiAdapters.toUploadsFilter(response);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }

  async deleteUploadsFilter(id: string): Promise<void> {
    try {
      await this.client.uploadFilters.destroy(id);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }

  // ModelFilter methods
  async listModelFilters(_params?: { offset?: number; limit?: number }): Promise<ModelFilter[]> {
    try {
      // NOTE: Using itemTypeFilters to maintain compatibility with the DatoCMS CMA client
      const response = await this.client.itemTypeFilters.list();
      return response.map(uiAdapters.toModelFilter);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }

  async findModelFilter(id: string): Promise<ModelFilter> {
    try {
      const response = await this.client.itemTypeFilters.find(id);
      if (!response) {
        throw uiErrorFactory.createNotFoundError(id, 'model_filter');
      }
      return uiAdapters.toModelFilter(response);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }

  async createModelFilter(data: ModelFilterCreateParams): Promise<ModelFilter> {
    try {
      // Construct the proper data format expected by the API
      const modelFilterData = {
        name: data.name,
        filter: data.filter,
        item_type: { id: data.item_type_id, type: "item_type" as const }, // Explicitly type as const
        shared: data.shared || false
      };
      
      const response = await this.client.itemTypeFilters.create(modelFilterData);
      return uiAdapters.toModelFilter(response);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }

  async updateModelFilter(id: string, data: ModelFilterUpdateParams): Promise<ModelFilter> {
    try {
      const response = await this.client.itemTypeFilters.update(id, data);
      return uiAdapters.toModelFilter(response);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }

  async deleteModelFilter(id: string): Promise<void> {
    try {
      await this.client.itemTypeFilters.destroy(id);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }

  // Plugin methods
  async listPlugins(_params?: { offset?: number; limit?: number }): Promise<Plugin[]> {
    try {
      const response = await this.client.plugins.list();
      return response.map(uiAdapters.toPlugin);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }

  async findPlugin(id: string): Promise<Plugin> {
    try {
      const response = await this.client.plugins.find(id);
      if (!response) {
        throw uiErrorFactory.createNotFoundError(id, 'plugin');
      }
      return uiAdapters.toPlugin(response);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }

  async createPlugin(data: PluginCreateParams): Promise<Plugin> {
    try {
      // Convert to specific field types accepted by the API
      const fieldTypes = data.field_types ? 
        data.field_types.filter(type => typeof type === 'string') as 
          Array<"string" | "boolean" | "text" | "integer" | "float" | "date" | "date_time" | "json" | "link" | "links" | "file" | "gallery" | "seo" | "color" | "video" | "lat_lon" | "rich_text" | "slug"> 
        : undefined;
        
      const response = await this.client.plugins.create({
        ...data,
        field_types: fieldTypes
      });
      return uiAdapters.toPlugin(response);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }

  async updatePlugin(id: string, data: PluginUpdateParams): Promise<Plugin> {
    try {
      const response = await this.client.plugins.update(id, data);
      return uiAdapters.toPlugin(response);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }

  async deletePlugin(id: string): Promise<void> {
    try {
      await this.client.plugins.destroy(id);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }

  // Common error handling for all API calls
  private handleAPIError(error: any): never {
    // Handle authentication errors
    if (error.statusCode === 401) {
      throw uiErrorFactory.createAuthorizationError();
    }

    // Handle not found errors
    if (error.statusCode === 404) {
      const resourceId = error.pathSegments?.[error.pathSegments.length - 1] || 'unknown';
      const resourceType = error.pathSegments?.[error.pathSegments.length - 2]?.replace(/s$/, '') || 'unknown';
      throw uiErrorFactory.createNotFoundError(resourceId, resourceType as any);
    }

    // Handle validation errors
    if (error.statusCode === 422 && error.message === 'Unprocessable Entity' && error.errors) {
      const validationErrors = Object.entries(error.errors).map(([field, messages]) => ({
        field,
        message: Array.isArray(messages) ? messages.join(', ') : String(messages)
      }));
      throw uiErrorFactory.createValidationError('Validation failed', validationErrors);
    }

    // Handle generic errors
    throw uiErrorFactory.createUIError(
      error.message || 'Unknown error',
      error.stack || undefined
    );
  }
}

/**
 * Factory function to create a typed UI client
 */
export function createTypedUIClient(client: Client): UIClient {
  return new TypedUIClient(client);
}