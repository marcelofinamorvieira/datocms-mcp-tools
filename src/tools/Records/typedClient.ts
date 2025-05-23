/**
 * @file typedClient.ts
 * @description Enhanced type definitions for the DatoCMS CMA client
 * Provides a type-safe interface for interacting with the DatoCMS API
 */

import type { 
  Item, 
  ItemVersion, 
  RecordCreatePayload, 
  RecordUpdatePayload, 
  RecordQueryParams, 
  FieldTypes
} from './types.js';
import { validateItemFields, extractTypedFields, TypedRecord } from './advancedTypes.js';
import { UnifiedClientManager } from '../../utils/unifiedClientManager.js';
import { Client, SimpleSchemaTypes } from '@datocms/cma-client-node';

/**
 * Type-safe client for working with DatoCMS records
 * This wraps the actual CMA client with better typing
 */
export class TypedRecordsClient {
  private client: Client;
  
  /**
   * Create a new typed client using the standard CMA client
   * @param apiToken - DatoCMS API token
   * @param environment - Optional environment name
   */
  constructor(apiToken: string, environment?: string) {
    this.client = UnifiedClientManager.getDefaultClient(apiToken, environment) as Client;
  }
  
  /**
   * Find a record by ID
   * @param id - Record ID
   * @param params - Optional query parameters
   * @returns The record
   */
  async findRecord(id: string, params?: Partial<RecordQueryParams>): Promise<Item> {
    // We need to use an intermediary object to bridge the typing gap
    const clientParams = params ? { ...params } : undefined;
    return this.client.items.find(id, clientParams);
  }
  
  /**
   * Find a record by ID and convert it to a specific record type
   * @template T - Field definitions with expected types
   * @param id - Record ID
   * @param typeDefinition - Type definition for the record
   * @param params - Optional query parameters
   * @returns The record with properly typed fields
   * @throws Error if the record doesn't match the expected type
   */
  async findTypedRecord<T extends Record<string, keyof FieldTypes>>(
    id: string, 
    typeDefinition: T,
    params?: Partial<RecordQueryParams>
  ): Promise<TypedRecord<T>> {
    const item = await this.findRecord(id, params);
    
    // Validate that the item has all the required fields
    if (!validateItemFields(item, typeDefinition)) {
      const missingFields = Object.keys(typeDefinition).filter(field => !(field in item));
      throw new Error(`Record is missing required fields: ${missingFields.join(', ')}`);
    }
    
    // Combine the original item with properly typed fields
    // This preserves the original item structure while adding type safety for specified fields
    const typedFields = extractTypedFields(item, typeDefinition);
    
    // Use spread to merge the original item with the typed fields
    return {
      ...item,
      ...typedFields
    } as TypedRecord<T>;
  }
  
  /**
   * List records with optional filtering
   * @param params - Query parameters
   * @returns Array of records
   */
  async listRecords(params?: Partial<RecordQueryParams>): Promise<Item[]> {
    // Convert our RecordQueryParams to ItemInstancesHrefSchema format
    const apiParams: SimpleSchemaTypes.ItemInstancesHrefSchema = {};
    
    if (params) {
      if (params.page) {
        apiParams.page = params.page;
      }
      if (params.filter) {
        apiParams.filter = params.filter as any; // Type mismatch in filter structure
      }
      if (params.order_by) {
        apiParams.order_by = params.order_by;
      }
      if (params.version) {
        apiParams.version = params.version;
      }
      if (params.nested !== undefined) {
        apiParams.nested = params.nested;
      }
    }
    
    return this.client.items.list(apiParams);
  }
  
  /**
   * Create a new record
   * @param data - Record data
   * @returns The created record
   */
  async createRecord(data: RecordCreatePayload): Promise<Item> {
    return this.client.items.create(data);
  }
  
  /**
   * Update an existing record
   * @param id - Record ID
   * @param data - Update data
   * @returns The updated record
   */
  async updateRecord(id: string, data: RecordUpdatePayload): Promise<Item> {
    return this.client.items.update(id, data);
  }
  
  /**
   * Delete a record
   * @param id - Record ID
   * @returns Promise that resolves when the record is deleted
   */
  async deleteRecord(id: string): Promise<void> {
    await this.client.items.destroy(id);
  }
  
  /**
   * Publish a record
   * @param id - Record ID
   * @param options - Optional publication options
   * @returns The published record
   */
  async publishRecord(
    id: string, 
    options?: {
      content_in_locales?: string[], 
      non_localized_content?: boolean
    },
    _params?: { recursive?: boolean }
  ): Promise<Item> {
    if (options) {
      const publishSchema: SimpleSchemaTypes.ItemPublishSchema = {
        type: "selective_publish_operation",
        content_in_locales: options.content_in_locales || [],
        non_localized_content: options.non_localized_content || false
      };
      return this.client.items.publish(id, publishSchema);
    }
    return this.client.items.publish(id);
  }
  
  /**
   * Unpublish a record
   * @param id - Record ID
   * @param params - Optional parameters
   * @returns The unpublished record
   */
  async unpublishRecord(id: string, params?: { recursive?: boolean }): Promise<Item> {
    if (params?.recursive) {
      const unpublishSchema: SimpleSchemaTypes.ItemUnpublishSchema = {
        type: "selective_unpublish_operation",
        content_in_locales: [] // Empty array unpublishes all locales
      };
      return this.client.items.unpublish(id, unpublishSchema);
    }
    return this.client.items.unpublish(id);
  }
  
  /**
   * Get a specific version of a record
   * @param id - Version ID
   * @returns The version
   */
  async getRecordVersion(id: string): Promise<ItemVersion> {
    return this.client.itemVersions.find(id);
  }
  
  /**
   * List versions of a record
   * @param itemId - Record ID
   * @returns Array of versions
   */
  async listRecordVersions(itemId: string): Promise<ItemVersion[]> {
    return this.client.itemVersions.list(itemId);
  }
  
  /**
   * Restore a record to a specific version
   * @param versionId - Version ID
   * @returns The restore job result
   */
  async restoreRecordVersion(versionId: string): Promise<SimpleSchemaTypes.ItemVersionRestoreJobSchema> {
    return this.client.itemVersions.restore(versionId);
  }
}

/**
 * Create a type-safe records client
 * @param apiToken - DatoCMS API token
 * @param environment - Optional environment name
 * @returns Type-safe client for working with records
 */
export function createTypedRecordsClient(apiToken: string, environment?: string): TypedRecordsClient {
  return new TypedRecordsClient(apiToken, environment);
}