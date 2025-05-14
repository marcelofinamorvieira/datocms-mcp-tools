/**
 * @file environmentClient.ts
 * @description Type-safe client for working with DatoCMS environments
 * Provides a consistent interface for environment operations
 */

import { getClient } from '../../utils/clientManager.js';
import type {
  Environment,
  ApiEnvironment,
  RenameEnvironmentParams,
  ForkEnvironmentParams
} from './environmentTypes.js';
import { adaptApiEnvironment } from './environmentTypes.js';

/**
 * Type-safe client for DatoCMS environment operations
 */
export class EnvironmentClient {
  private client: any;

  /**
   * Creates a new environment client
   * 
   * @param apiToken - DatoCMS API token
   * @param environment - Optional environment to target
   */
  constructor(apiToken: string, environment?: string) {
    this.client = getClient(apiToken, environment);
  }

  /**
   * Lists all environments
   * 
   * @returns Array of environments
   */
  async listEnvironments(): Promise<Environment[]> {
    const apiEnvironments = await this.client.environments.list() as ApiEnvironment[];
    return apiEnvironments.map(apiEnv => adaptApiEnvironment(apiEnv));
  }

  /**
   * Retrieves a specific environment by ID
   * 
   * @param id - Environment ID
   * @returns The environment
   */
  async getEnvironment(id: string): Promise<Environment> {
    const apiEnvironment = await this.client.environments.find(id) as ApiEnvironment;
    return adaptApiEnvironment(apiEnvironment);
  }

  /**
   * Renames an environment
   * 
   * @param id - Environment ID
   * @param data - New environment ID
   * @returns The updated environment
   */
  async renameEnvironment(id: string, data: RenameEnvironmentParams): Promise<Environment> {
    const apiEnvironment = await this.client.environments.rename(id, data) as ApiEnvironment;
    return adaptApiEnvironment(apiEnvironment);
  }

  /**
   * Forks an environment
   * 
   * @param id - Environment ID to fork
   * @param data - Fork parameters
   * @returns The new environment
   */
  async forkEnvironment(id: string, data: ForkEnvironmentParams): Promise<Environment> {
    const apiEnvironment = await this.client.environments.fork(id, data) as ApiEnvironment;
    return adaptApiEnvironment(apiEnvironment);
  }

  /**
   * Promotes an environment to primary
   * 
   * @param id - Environment ID
   * @returns The updated environment
   */
  async promoteEnvironment(id: string): Promise<Environment> {
    const apiEnvironment = await this.client.environments.promote(id) as ApiEnvironment;
    return adaptApiEnvironment(apiEnvironment);
  }

  /**
   * Deletes an environment
   * 
   * @param id - Environment ID
   * @returns Promise that resolves when the environment is deleted
   */
  async deleteEnvironment(id: string): Promise<void> {
    await this.client.environments.destroy(id);
  }

  /**
   * Gets the maintenance mode status
   * 
   * @returns Whether maintenance mode is active
   */
  async getMaintenanceMode(): Promise<boolean> {
    const response = await this.client.environments.getMaintenanceMode();
    return Boolean(response.maintenance_mode);
  }

  /**
   * Activates maintenance mode
   * 
   * @param force - Whether to force activation even with active jobs
   * @returns Whether maintenance mode is active
   */
  async activateMaintenanceMode(force = false): Promise<boolean> {
    const response = await this.client.environments.activateMaintenanceMode(force);
    return Boolean(response.maintenance_mode);
  }

  /**
   * Deactivates maintenance mode
   * 
   * @returns Whether maintenance mode is active
   */
  async deactivateMaintenanceMode(): Promise<boolean> {
    const response = await this.client.environments.deactivateMaintenanceMode();
    return Boolean(response.maintenance_mode);
  }
}

/**
 * Creates a type-safe environment client
 * 
 * @param apiToken - DatoCMS API token
 * @param environment - Optional environment to target
 * @returns Environment client instance
 */
export function createEnvironmentClient(apiToken: string, environment?: string): EnvironmentClient {
  return new EnvironmentClient(apiToken, environment);
}