/**
 * @file uploadsClient.ts
 * @description Typed client interfaces and implementation for the Uploads module
 */

import { Client } from '@datocms/cma-client-node';
import {
  Upload, UploadCollection, UploadTag, UploadSmartTag, UploadReference,
  UploadCreateParams, UploadUpdateParams,
  UploadCollectionCreateParams, UploadCollectionUpdateParams,
  UploadsError, UploadsValidationError, UploadsNotFoundError, UploadsAuthorizationError
} from './uploadsTypes.js';

/**
 * Interface for the uploads client with type-safe operations
 */
export interface UploadsClient {
  // Upload operations
  findUpload(id: string): Promise<Upload>;
  listUploads(params?: { 
    ids?: string[] | string;
    query?: string;
    fields?: Record<string, Record<string, unknown>>;
    locale?: string;
    order_by?: string;
    page?: { offset?: number; limit?: number };
  }): Promise<Upload[]>;
  getUploadReferences(id: string, params?: {
    nested?: boolean;
    version?: 'current' | 'published' | 'published-or-current';
  }): Promise<UploadReference[]>;
  createUpload(data: UploadCreateParams): Promise<Upload>;
  updateUpload(id: string, data: UploadUpdateParams): Promise<Upload>;
  deleteUpload(id: string): Promise<void>;
  bulkDeleteUploads(ids: string[]): Promise<{
    successful: string[];
    failed: Record<string, string>;
  }>;
  bulkTagUploads(ids: string[], tags: string[]): Promise<{
    successful: string[];
    failed: Record<string, string>;
  }>;
  bulkSetUploadCollection(ids: string[], collectionId: string | null): Promise<{
    successful: string[];
    failed: Record<string, string>;
  }>;

  // Upload collection operations
  findUploadCollection(id: string): Promise<UploadCollection>;
  listUploadCollections(params?: { 
    ids?: string[] | string;
  }): Promise<UploadCollection[]>;
  createUploadCollection(data: UploadCollectionCreateParams): Promise<UploadCollection>;
  updateUploadCollection(id: string, data: UploadCollectionUpdateParams): Promise<UploadCollection>;
  deleteUploadCollection(id: string): Promise<void>;

  // Tag operations
  listUploadTags(params?: { 
    filter?: string;
  }): Promise<UploadTag[]>;
  createUploadTag(name: string): Promise<UploadTag>;
  listUploadSmartTags(params?: { 
    filter?: { query?: string };
    page?: { offset?: number; limit?: number };
  }): Promise<UploadSmartTag[]>;
}

/**
 * Factory for error objects
 */
export const uploadsErrorFactory = {
  createUploadsError(message: string, details?: string): UploadsError {
    return {
      type: 'uploads_error',
      message,
      details
    };
  },

  createValidationError(message: string, validationErrors: Array<{ field?: string; message: string }>): UploadsValidationError {
    return {
      type: 'uploads_validation_error',
      message,
      validationErrors
    };
  },

  createNotFoundError(resourceId: string, resourceType: 'upload' | 'upload_collection' | 'tag' | 'smart_tag'): UploadsNotFoundError {
    return {
      type: 'uploads_not_found_error',
      message: `${resourceType} with ID '${resourceId}' not found`,
      resourceId,
      resourceType
    };
  },

  createAuthorizationError(message: string = 'Unauthorized'): UploadsAuthorizationError {
    return {
      type: 'uploads_auth_error',
      message
    };
  }
};

/**
 * Adapters to convert API responses to our strongly-typed interfaces
 */
export const uploadsAdapters = {
  toUpload(apiUpload: any): Upload {
    return apiUpload as Upload;
  },

  toUploadCollection(apiUploadCollection: any): UploadCollection {
    return apiUploadCollection as UploadCollection;
  },

  toUploadTag(apiUploadTag: any): UploadTag {
    return apiUploadTag as UploadTag;
  },

  toUploadSmartTag(apiUploadSmartTag: any): UploadSmartTag {
    return apiUploadSmartTag as UploadSmartTag;
  },

  toUploadReference(apiUploadReference: any): UploadReference {
    return apiUploadReference as UploadReference;
  }
};

/**
 * Typed implementation of the UploadsClient interface
 */
export class TypedUploadsClient implements UploadsClient {
  private client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  // Upload methods
  async findUpload(id: string): Promise<Upload> {
    try {
      const response = await this.client.uploads.find(id);
      if (!response) {
        throw uploadsErrorFactory.createNotFoundError(id, 'upload');
      }
      return uploadsAdapters.toUpload(response);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }

  async listUploads(params?: { 
    ids?: string[] | string;
    query?: string;
    fields?: Record<string, Record<string, unknown>>;
    locale?: string;
    order_by?: string;
    page?: { offset?: number; limit?: number };
  }): Promise<Upload[]> {
    try {
      // Convert params to API format
      const apiParams: any = {};
      
      if (params?.ids) {
        apiParams.filter = { ids: params.ids };
      }
      
      if (params?.query) {
        apiParams.filter = { ...apiParams.filter, query: params.query };
      }
      
      if (params?.fields) {
        apiParams.filter = { ...apiParams.filter, fields: params.fields };
      }
      
      if (params?.locale) {
        apiParams.filter = { ...apiParams.filter, locale: params.locale };
      }
      
      if (params?.order_by) {
        apiParams.order_by = params.order_by;
      }
      
      if (params?.page) {
        apiParams.page = params.page;
      }
      
      const response = await this.client.uploads.list(apiParams);
      return response.map(uploadsAdapters.toUpload);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }

  async getUploadReferences(id: string, params?: {
    nested?: boolean;
    version?: 'current' | 'published' | 'published-or-current';
  }): Promise<UploadReference[]> {
    try {
      const response = await this.client.uploads.references(id, params);
      return response.map(uploadsAdapters.toUploadReference);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }

  async createUpload(data: UploadCreateParams): Promise<Upload> {
    try {
      // Ensure we have required properties based on API expectations
      // If path is undefined, url must be present and vice versa
      const uploadData: any = { ...data };
      if (!uploadData.path && !uploadData.url) {
        throw uploadsErrorFactory.createValidationError(
          'Validation error', 
          [{ field: 'path/url', message: 'Either path or url must be provided' }]
        );
      }
      
      const response = await this.client.uploads.create(uploadData);
      return uploadsAdapters.toUpload(response);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }

  async updateUpload(id: string, data: UploadUpdateParams): Promise<Upload> {
    try {
      const response = await this.client.uploads.update(id, data);
      return uploadsAdapters.toUpload(response);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }

  async deleteUpload(id: string): Promise<void> {
    try {
      await this.client.uploads.destroy(id);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }

  async bulkDeleteUploads(ids: string[]): Promise<{
    successful: string[];
    failed: Record<string, string>;
  }> {
    try {
      // Convert string[] to upload objects with required format
      const uploadObjects = ids.map(id => ({ id, type: 'upload' }));
      
      // The API expects { uploads: UploadData[] }
      const response = await this.client.uploads.bulkDestroy({ uploads: uploadObjects as any });
      return {
        successful: (response as any).results?.success || [],
        failed: (response as any).results?.failures || {}
      };
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }

  async bulkTagUploads(ids: string[], tags: string[]): Promise<{
    successful: string[];
    failed: Record<string, string>;
  }> {
    try {
      // Convert string[] to upload objects
      const uploadObjects = ids.map(id => ({ id, type: 'upload' }));
      
      const response = await this.client.uploads.bulkTag({
        uploads: uploadObjects as any,
        tags: tags
      });
      return {
        successful: (response as any).results?.success || [],
        failed: (response as any).results?.failures || {}
      };
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }

  async bulkSetUploadCollection(ids: string[], collectionId: string | null): Promise<{
    successful: string[];
    failed: Record<string, string>;
  }> {
    try {
      const collectionData = collectionId 
        ? { type: 'upload_collection' as const, id: collectionId } 
        : null;
      
      // Update uploads one by one as the bulk operations API doesn't support collection changes
      const successful: string[] = [];
      const failed: Record<string, string> = {};
      
      for (const id of ids) {
        try {
          await this.client.uploads.update(id, {
            upload_collection: collectionData
          });
          successful.push(id);
        } catch (err: any) {
          failed[id] = err.message || 'Unknown error';
        }
      }
      
      return { successful, failed };
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }

  // Upload collection methods
  async findUploadCollection(id: string): Promise<UploadCollection> {
    try {
      const response = await this.client.uploadCollections.find(id);
      if (!response) {
        throw uploadsErrorFactory.createNotFoundError(id, 'upload_collection');
      }
      return uploadsAdapters.toUploadCollection(response);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }

  async listUploadCollections(params?: { 
    ids?: string[] | string;
  }): Promise<UploadCollection[]> {
    try {
      // Convert params to API format
      const apiParams: any = {};
      
      if (params?.ids) {
        apiParams.filter = { ids: params.ids };
      }
      
      const response = await this.client.uploadCollections.list(apiParams);
      return response.map(uploadsAdapters.toUploadCollection);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }

  async createUploadCollection(data: UploadCollectionCreateParams): Promise<UploadCollection> {
    try {
      const response = await this.client.uploadCollections.create(data);
      return uploadsAdapters.toUploadCollection(response);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }

  async updateUploadCollection(id: string, data: UploadCollectionUpdateParams): Promise<UploadCollection> {
    try {
      const response = await this.client.uploadCollections.update(id, data);
      return uploadsAdapters.toUploadCollection(response);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }

  async deleteUploadCollection(id: string): Promise<void> {
    try {
      await this.client.uploadCollections.destroy(id);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }

  // Tag methods
  async listUploadTags(params?: { 
    filter?: string;
  }): Promise<UploadTag[]> {
    try {
      // Convert string filter to object format expected by API
      const apiParams = params?.filter 
        ? { filter: { query: params.filter } }
        : undefined;
        
      const response = await this.client.uploadTags.list(apiParams);
      return response.map(uploadsAdapters.toUploadTag);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }

  async createUploadTag(name: string): Promise<UploadTag> {
    try {
      const response = await this.client.uploadTags.create({ name });
      return uploadsAdapters.toUploadTag(response);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }

  async listUploadSmartTags(params?: { 
    filter?: { query?: string };
    page?: { offset?: number; limit?: number };
  }): Promise<UploadSmartTag[]> {
    try {
      const response = await this.client.uploadSmartTags.list(params);
      return response.map(uploadsAdapters.toUploadSmartTag);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }

  // Common error handling for all API calls
  private handleAPIError(error: any): never {
    // Handle authentication errors
    if (error.statusCode === 401) {
      throw uploadsErrorFactory.createAuthorizationError();
    }

    // Handle not found errors
    if (error.statusCode === 404) {
      const resourceId = error.pathSegments?.[error.pathSegments.length - 1] || 'unknown';
      const resourceType = this.determineResourceType(error.pathSegments) || 'upload';
      throw uploadsErrorFactory.createNotFoundError(resourceId, resourceType as any);
    }

    // Handle validation errors
    if (error.statusCode === 422 && error.message === 'Unprocessable Entity' && error.errors) {
      const validationErrors = Object.entries(error.errors).map(([field, messages]) => ({
        field,
        message: Array.isArray(messages) ? messages.join(', ') : String(messages)
      }));
      throw uploadsErrorFactory.createValidationError('Validation failed', validationErrors);
    }

    // Handle generic errors
    throw uploadsErrorFactory.createUploadsError(
      error.message || 'Unknown error',
      error.stack || undefined
    );
  }
  
  // Helper to determine resource type from API path segments
  private determineResourceType(pathSegments: string[] | undefined): 'upload' | 'upload_collection' | 'tag' | 'smart_tag' | undefined {
    if (!pathSegments) return undefined;
    
    const pathSegment = pathSegments.find(segment => 
      ['uploads', 'upload_collections', 'upload_tags', 'upload_smart_tags'].includes(segment)
    );
    
    switch (pathSegment) {
      case 'uploads': return 'upload';
      case 'upload_collections': return 'upload_collection';
      case 'upload_tags': return 'tag';
      case 'upload_smart_tags': return 'smart_tag';
      default: return undefined;
    }
  }
}

/**
 * Factory function to create a typed uploads client
 */
export function createTypedUploadsClient(client: Client): UploadsClient {
  return new TypedUploadsClient(client);
}