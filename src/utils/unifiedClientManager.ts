/**
 * @file unifiedClientManager.ts
 * @description Unified client management system for DatoCMS MCP handlers
 * Provides centralized client creation, caching, and lifecycle management
 */

import { buildClient, Client } from "@datocms/cma-client-node";
import { TypedRecordsClient } from "../tools/Records/typedClient.js";
import { CollaboratorsClient, createTypedCollaboratorsClient } from "../tools/CollaboratorsRolesAndAPITokens/collaboratorsClient.js";

/**
 * Client types available in the system
 */
export enum ClientType {
  DEFAULT = 'default',
  RECORDS = 'records',
  COLLABORATORS = 'collaborators',
}

/**
 * Client configuration for creating clients
 */
export interface ClientConfig {
  /** DatoCMS API token */
  apiToken: string;
  /** Optional environment name */
  environment?: string;
  /** Optional client type */
  clientType?: ClientType;
}

/**
 * Unified client manager that handles client creation, caching, and lifecycle management
 */
export class UnifiedClientManager {
  // Static cache of clients to avoid recreating clients for the same API token
  private static clientCache: Map<string, any> = new Map();

  /**
   * Gets the cache key for a client configuration
   * @param config Client configuration
   * @returns A unique cache key
   */
  private static getCacheKey(config: ClientConfig): string {
    const { apiToken, environment = 'primary', clientType = ClientType.DEFAULT } = config;
    return `${apiToken}:${environment}:${clientType}`;
  }

  /**
   * Creates a new client instance of the specified type
   * @param config Client configuration
   * @returns A new client instance
   */
  private static createClient(config: ClientConfig): any {
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
  public static getClient<T = Client>(config: ClientConfig): T {
    const cacheKey = this.getCacheKey(config);
    
    // Check if the client already exists in the cache
    if (this.clientCache.has(cacheKey)) {
      return this.clientCache.get(cacheKey) as T;
    }
    
    // Create a new client and cache it
    const client = this.createClient(config);
    this.clientCache.set(cacheKey, client);
    
    return client as T;
  }

  /**
   * Gets a default DatoCMS client
   * @param apiToken DatoCMS API token
   * @param environment Optional environment name
   * @returns A default DatoCMS client
   */
  public static getDefaultClient(apiToken: string, environment?: string): Client {
    return this.getClient<Client>({
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
  public static getRecordsClient(apiToken: string, environment?: string): TypedRecordsClient {
    return this.getClient<TypedRecordsClient>({
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
  public static getCollaboratorsClient(apiToken: string, environment?: string): CollaboratorsClient {
    return this.getClient<CollaboratorsClient>({
      apiToken,
      environment,
      clientType: ClientType.COLLABORATORS
    });
  }

  /**
   * Clears the client cache
   * Use this method carefully, as it will invalidate all cached clients
   */
  public static clearCache(): void {
    this.clientCache.clear();
  }

  /**
   * Removes a specific client from the cache
   * @param config Client configuration
   * @returns True if the client was removed, false if it wasn't in the cache
   */
  public static removeClient(config: ClientConfig): boolean {
    const cacheKey = this.getCacheKey(config);
    return this.clientCache.delete(cacheKey);
  }
}

/**
 * Legacy compatibility function for getClient
 * @deprecated Use UnifiedClientManager.getDefaultClient instead
 */
export function getClient(apiToken: string, environment?: string): Client {
  return UnifiedClientManager.getDefaultClient(apiToken, environment);
}