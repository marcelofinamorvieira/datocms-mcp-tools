/**
 * Project Module Typed Client
 * 
 * This file provides a type-safe client for interacting with DatoCMS Project/Site
 * entities.
 */

import { getClient } from "../../utils/clientManager.js";
import {
  Site,
  SiteUpdateParams,
  adaptApiSite
} from "./projectTypes.js";

/**
 * Interface for the Project Client
 */
export interface ProjectClient {
  // Site operations
  findSite(): Promise<Site>;
  updateSite(data: SiteUpdateParams): Promise<Site>;
}

/**
 * Implementation of the Project Client interface
 */
export class TypedProjectClient implements ProjectClient {
  private client: any;
  
  constructor(apiToken: string, environment?: string) {
    this.client = getClient(apiToken, environment);
  }
  
  // Site operations
  async findSite(): Promise<Site> {
    const apiSite = await this.client.site.find();
    return adaptApiSite(apiSite);
  }
  
  async updateSite(data: SiteUpdateParams): Promise<Site> {
    const apiSite = await this.client.site.update(data);
    return adaptApiSite(apiSite);
  }
}

/**
 * Factory function to create a typed project client
 */
export function createProjectClient(apiToken: string, environment?: string): ProjectClient {
  return new TypedProjectClient(apiToken, environment);
}