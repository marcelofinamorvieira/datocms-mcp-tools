/**
 * @file unifiedClientManager.ts
 * @description Unified client management system for DatoCMS MCP handlers
 * Provides centralized client creation, caching, and lifecycle management
 */
import { buildClient } from "@datocms/cma-client-node";
import { TypedRecordsClient } from "../tools/Records/typedClient.js";
import { createTypedCollaboratorsClient } from "../tools/CollaboratorsRolesAndAPITokens/collaboratorsClient.js";
/**
 * Client types available in the system
 */
export var ClientType;
(function (ClientType) {
    ClientType["DEFAULT"] = "default";
    ClientType["RECORDS"] = "records";
    ClientType["COLLABORATORS"] = "collaborators";
})(ClientType || (ClientType = {}));
/**
 * Unified client manager that handles client creation, caching, and lifecycle management
 */
export class UnifiedClientManager {
    /**
     * Gets the cache key for a client configuration
     * @param config Client configuration
     * @returns A unique cache key
     */
    static getCacheKey(config) {
        const { apiToken, environment = 'primary', clientType = ClientType.DEFAULT } = config;
        return `${apiToken}:${environment}:${clientType}`;
    }
    /**
     * Creates a new client instance of the specified type
     * @param config Client configuration
     * @returns A new client instance
     */
    static createClient(config) {
        const { apiToken, environment, clientType = ClientType.DEFAULT } = config;
        // Create the base DatoCMS client
        const clientParameters = environment ? { apiToken, environment } : { apiToken };
        const baseClient = buildClient(clientParameters);
        // Create and return the appropriate client type
        switch (clientType) {
            case ClientType.RECORDS:
                return new TypedRecordsClient(apiToken, environment);
            case ClientType.COLLABORATORS:
                return createTypedCollaboratorsClient(baseClient);
            case ClientType.DEFAULT:
            default:
                return baseClient;
        }
    }
    /**
     * Gets a client instance, creating it if it doesn't exist in the cache
     * @param config Client configuration
     * @returns A client instance
     */
    static getClient(config) {
        const cacheKey = this.getCacheKey(config);
        // Check if the client already exists in the cache
        if (this.clientCache.has(cacheKey)) {
            return this.clientCache.get(cacheKey);
        }
        // Create a new client and cache it
        const client = this.createClient(config);
        this.clientCache.set(cacheKey, client);
        return client;
    }
    /**
     * Gets a default DatoCMS client
     * @param apiToken DatoCMS API token
     * @param environment Optional environment name
     * @returns A default DatoCMS client
     */
    static getDefaultClient(apiToken, environment) {
        return this.getClient({
            apiToken,
            environment,
            clientType: ClientType.DEFAULT
        });
    }
    /**
     * Gets a typed records client
     * @param apiToken DatoCMS API token
     * @param environment Optional environment name
     * @returns A typed records client
     */
    static getRecordsClient(apiToken, environment) {
        return this.getClient({
            apiToken,
            environment,
            clientType: ClientType.RECORDS
        });
    }
    /**
     * Gets a typed collaborators client
     * @param apiToken DatoCMS API token
     * @param environment Optional environment name
     * @returns A typed collaborators client
     */
    static getCollaboratorsClient(apiToken, environment) {
        return this.getClient({
            apiToken,
            environment,
            clientType: ClientType.COLLABORATORS
        });
    }
    /**
     * Clears the client cache
     * Use this method carefully, as it will invalidate all cached clients
     */
    static clearCache() {
        this.clientCache.clear();
    }
    /**
     * Removes a specific client from the cache
     * @param config Client configuration
     * @returns True if the client was removed, false if it wasn't in the cache
     */
    static removeClient(config) {
        const cacheKey = this.getCacheKey(config);
        return this.clientCache.delete(cacheKey);
    }
}
// Static cache of clients to avoid recreating clients for the same API token
UnifiedClientManager.clientCache = new Map();
/**
 * Legacy compatibility function for getClient
 * @deprecated Use UnifiedClientManager.getDefaultClient instead
 */
export function getClient(apiToken, environment) {
    return UnifiedClientManager.getDefaultClient(apiToken, environment);
}
