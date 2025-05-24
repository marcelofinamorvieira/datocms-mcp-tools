/**
 * Typed client wrapper for DatoCMS operations
 * Provides type-safe access to the DatoCMS API client
 */

import { Client } from '@datocms/cma-client-node';
import type { SimpleSchemaTypes } from '@datocms/cma-client-node';

/**
 * Configuration options for creating a DatoCMS client
 */
export interface ClientConfig {
  apiToken: string;
  environment?: string;
  baseUrl?: string;
}

/**
 * Create a properly typed DatoCMS client
 */
export function createTypedClient(config: ClientConfig): Client {
  const clientOptions: ConstructorParameters<typeof Client>[0] = {
    apiToken: config.apiToken,
  };

  if (config.environment) {
    clientOptions.environment = config.environment;
  }

  if (config.baseUrl) {
    clientOptions.baseUrl = config.baseUrl;
  }

  return new Client(clientOptions);
}

/**
 * Type-safe wrapper around the DatoCMS client
 * Provides additional type safety and utility methods
 */
export class TypedDatoCMSClient {
  private client: Client;

  constructor(config: ClientConfig) {
    this.client = createTypedClient(config);
  }

  /**
   * Get the underlying client instance
   */
  getClient(): Client {
    return this.client;
  }

  /**
   * Type-safe access to resources
   */
  get items() {
    return this.client.items;
  }

  get itemTypes() {
    return this.client.itemTypes;
  }

  get fields() {
    return this.client.fields;
  }

  get fieldsets() {
    return this.client.fieldsets;
  }

  get uploads() {
    return this.client.uploads;
  }

  get uploadTags() {
    return this.client.uploadTags;
  }

  get uploadSmartTags() {
    return this.client.uploadSmartTags;
  }

  get users() {
    return this.client.users;
  }

  get roles() {
    return this.client.roles;
  }

  get accessTokens() {
    return this.client.accessTokens;
  }

  get webhooks() {
    return this.client.webhooks;
  }

  get webhookCalls() {
    return this.client.webhookCalls;
  }

  get buildTriggers() {
    return this.client.buildTriggers;
  }

  get environments() {
    return this.client.environments;
  }

  get maintenanceMode() {
    return this.client.maintenanceMode;
  }

  // Note: deployEvents might not be available in all client versions
  // get deployEvents() {
  //   return this.client.deployEvents;
  // }

  get site() {
    return this.client.site;
  }

  get menuItems() {
    return this.client.menuItems;
  }

  get schemaMenuItems() {
    return this.client.schemaMenuItems;
  }

  get plugins() {
    return this.client.plugins;
  }

  get jobResults() {
    return this.client.jobResults;
  }

  get scheduledPublication() {
    return this.client.scheduledPublication;
  }

  get scheduledUnpublishing() {
    return this.client.scheduledUnpublishing;
  }

  /**
   * Utility methods for common operations
   */

  /**
   * Find an item type by API key
   */
  async findItemTypeByApiKey(apiKey: string): Promise<SimpleSchemaTypes.ItemType | null> {
    try {
      const itemTypes = await this.client.itemTypes.list();
      return itemTypes.find(it => it.api_key === apiKey) || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Find a field by API key within an item type
   */
  async findFieldByApiKey(
    itemTypeId: string,
    fieldApiKey: string
  ): Promise<SimpleSchemaTypes.Field | null> {
    try {
      const fields = await this.client.fields.list(itemTypeId);
      return fields.find(f => f.api_key === fieldApiKey) || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if an environment exists
   */
  async environmentExists(environmentId: string): Promise<boolean> {
    try {
      await this.client.environments.find(environmentId);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get all records of a specific type
   */
  async getRecordsByType(itemTypeId: string): Promise<SimpleSchemaTypes.Item[]> {
    const allRecords: SimpleSchemaTypes.Item[] = [];
    
    for await (const record of this.client.items.listPagedIterator({
      filter: { type: itemTypeId },
      page: { limit: 100 }
    })) {
      allRecords.push(record);
    }

    return allRecords;
  }

  /**
   * Safely update a record with partial data
   */
  async updateRecord(
    itemId: string,
    data: Partial<SimpleSchemaTypes.ItemUpdateSchema>
  ): Promise<SimpleSchemaTypes.Item> {
    return await this.client.items.update(itemId, data);
  }

  /**
   * Bulk operations with proper typing
   */
  async bulkPublishRecords(itemIds: string[]): Promise<SimpleSchemaTypes.JobResult | null> {
    const result = await this.client.items.bulkPublish({
      items: itemIds.map(id => ({ id, type: 'item' }))
    });
    // The bulkPublish method returns an array, need to handle properly
    return Array.isArray(result) ? null : result;
  }

  async bulkUnpublishRecords(itemIds: string[]): Promise<SimpleSchemaTypes.JobResult | null> {
    const result = await this.client.items.bulkUnpublish({
      items: itemIds.map(id => ({ id, type: 'item' }))
    });
    // The bulkUnpublish method returns an array, need to handle properly
    return Array.isArray(result) ? null : result;
  }

  /**
   * Upload operations with progress tracking
   */
  async uploadFile(
    filePathOrUrl: string,
    options?: {
      defaultFieldMetadata?: SimpleSchemaTypes.UploadCreateSchema['default_field_metadata'];
      notes?: string;
      tags?: string[];
      onProgress?: (info: { progress: number }) => void;
    }
  ): Promise<SimpleSchemaTypes.Upload> {
    if (filePathOrUrl.startsWith('http://') || filePathOrUrl.startsWith('https://')) {
      // Create from URL
      return await this.client.uploads.createFromUrl({
        url: filePathOrUrl,
        default_field_metadata: options?.defaultFieldMetadata || {},
        notes: options?.notes,
        tags: options?.tags
      });
    } else {
      // Create from file path - this is Node.js specific functionality
      // The type definitions might not include this method
      const uploadData: any = {
        path: filePathOrUrl,
        default_field_metadata: options?.defaultFieldMetadata || {},
        notes: options?.notes,
        tags: options?.tags
      };
      
      // Using any here temporarily as the Node client has this method but types might be incomplete
      return await (this.client.uploads as any).createFromFileOrUrl(uploadData, {
        onProgress: options?.onProgress
      });
    }
  }
}

/**
 * Export the Client type for use in other files
 */
export type { Client as DatoCMSClientType } from '@datocms/cma-client-node';