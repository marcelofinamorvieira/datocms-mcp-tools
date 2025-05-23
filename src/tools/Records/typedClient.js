/**
 * @file typedClient.ts
 * @description Enhanced type definitions for the DatoCMS CMA client
 * Provides a type-safe interface for interacting with the DatoCMS API
 */
import { validateItemFields, extractTypedFields } from './advancedTypes.js';
import { UnifiedClientManager } from '../../utils/unifiedClientManager.js';
/**
 * Type-safe client for working with DatoCMS records
 * This wraps the actual CMA client with better typing
 */
export class TypedRecordsClient {
    /**
     * Create a new typed client using the standard CMA client
     * @param apiToken - DatoCMS API token
     * @param environment - Optional environment name
     */
    constructor(apiToken, environment) {
        this.client = UnifiedClientManager.getDefaultClient(apiToken, environment);
    }
    /**
     * Find a record by ID
     * @param id - Record ID
     * @param params - Optional query parameters
     * @returns The record
     */
    async findRecord(id, params) {
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
    async findTypedRecord(id, typeDefinition, params) {
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
        };
    }
    /**
     * List records with optional filtering
     * @param params - Query parameters
     * @returns Array of records
     */
    async listRecords(params) {
        if (typeof this.client.items.list === 'function') {
            return this.client.items.list(params);
        }
        if (typeof this.client.items.all === 'function') {
            return this.client.items.all(params);
        }
        throw new Error('DatoCMS client does not support listing items');
    }
    /**
     * Create a new record
     * @param data - Record data
     * @returns The created record
     */
    async createRecord(data) {
        return this.client.items.create(data);
    }
    /**
     * Update an existing record
     * @param id - Record ID
     * @param data - Update data
     * @returns The updated record
     */
    async updateRecord(id, data) {
        return this.client.items.update(id, data);
    }
    /**
     * Delete a record
     * @param id - Record ID
     * @returns Promise that resolves when the record is deleted
     */
    async deleteRecord(id) {
        return this.client.items.destroy(id);
    }
    /**
     * Publish a record
     * @param id - Record ID
     * @param options - Optional publication options
     * @returns The published record
     */
    async publishRecord(id, options, params) {
        return this.client.items.publish(id, options, params);
    }
    /**
     * Unpublish a record
     * @param id - Record ID
     * @param params - Optional parameters
     * @returns The unpublished record
     */
    async unpublishRecord(id, params) {
        return this.client.items.unpublish(id, params);
    }
    /**
     * Get a specific version of a record
     * @param id - Version ID
     * @returns The version
     */
    async getRecordVersion(id) {
        return this.client.itemVersions.find(id);
    }
    /**
     * List versions of a record
     * @param itemId - Record ID
     * @returns Array of versions
     */
    async listRecordVersions(itemId) {
        if (typeof this.client.itemVersions.list === 'function') {
            return this.client.itemVersions.list(itemId);
        }
        if (typeof this.client.itemVersions.all === 'function') {
            return this.client.itemVersions.all({ item_id: itemId });
        }
        throw new Error('DatoCMS client does not support listing record versions');
    }
    /**
     * Restore a record to a specific version
     * @param versionId - Version ID
     * @returns The restored record
     */
    async restoreRecordVersion(versionId) {
        return this.client.itemVersions.restore(versionId);
    }
}
/**
 * Create a type-safe records client
 * @param apiToken - DatoCMS API token
 * @param environment - Optional environment name
 * @returns Type-safe client for working with records
 */
export function createTypedRecordsClient(apiToken, environment) {
    return new TypedRecordsClient(apiToken, environment);
}
