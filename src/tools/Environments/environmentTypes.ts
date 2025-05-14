/**
 * @file environmentTypes.ts
 * @description Type definitions for DatoCMS environments operations
 * Provides types for environment entities and operations
 */

import type { Response } from '../../utils/responseHandlers.js';
import type { DatoCMSApiError } from '../../utils/errorHandlers.js';

/**
 * Environment status values
 */
export type EnvironmentStatus = 'creating' | 'ready' | 'destroying';

/**
 * Core properties of a DatoCMS environment
 */
export interface Environment {
  id: string;
  type: 'environment';
  meta: EnvironmentMeta;
  primary?: boolean;
}

/**
 * Metadata about an environment
 */
export interface EnvironmentMeta {
  /**
   * Environment creation date
   */
  created_at: string;
  
  /**
   * Date of last data change
   * Might not be returned by the API in all cases, but we require it for consistency
   */
  updated_at: string;
  
  /**
   * Current status of the environment
   */
  status: EnvironmentStatus;
  
  /**
   * Progress of fork operation if in progress (0-100)
   */
  fork_progress?: number;
  
  /**
   * Whether the environment is in maintenance mode
   */
  maintenance_mode?: boolean;
}

/**
 * Represents an environment as returned directly from the API
 * This matches the actual structure from the DatoCMS API
 */
export interface ApiEnvironment {
  id: string;
  type: string;
  meta?: {
    created_at?: string;
    status?: string;
    fork_progress?: number;
    maintenance_mode?: boolean;
  };
  primary?: boolean;
}

/**
 * Converts an API environment to our internal Environment type
 */
export function adaptApiEnvironment(apiEnv: ApiEnvironment): Environment {
  return {
    id: apiEnv.id,
    type: 'environment',
    meta: {
      created_at: apiEnv.meta?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(), // Add this since it's required in our type
      status: (apiEnv.meta?.status as EnvironmentStatus) || 'ready',
      fork_progress: apiEnv.meta?.fork_progress,
      maintenance_mode: apiEnv.meta?.maintenance_mode
    },
    primary: apiEnv.primary
  };
}

/**
 * Parameters for renaming an environment
 */
export interface RenameEnvironmentParams {
  /**
   * The new ID for the environment
   */
  id: string;
}

/**
 * Parameters for forking an environment
 */
export interface ForkEnvironmentParams {
  /**
   * The ID for the new environment
   */
  id: string;
  
  /**
   * If true, creates a faster but incomplete fork 
   * (without copying records)
   */
  fast?: boolean;
  
  /**
   * If true, forces the operation even with warnings
   */
  force?: boolean;
}

/**
 * Success response for environment operations
 */
export type EnvironmentResponse = Response;

/**
 * Error specific to environment operations
 */
export interface EnvironmentError extends DatoCMSApiError {
  /**
   * Environment-specific error codes
   */
  code?: 'ENVIRONMENT_NOT_FOUND' | 'INVALID_ENVIRONMENT_ID' | 'MAINTENANCE_MODE_ACTIVE' | 'FORK_IN_PROGRESS' | 'PRIMARY_ENVIRONMENT_DELETION';
}

/**
 * Type guard to check if an error is an environment-specific error
 */
export function isEnvironmentError(error: unknown): error is EnvironmentError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as EnvironmentError).code === 'string' &&
    [
      'ENVIRONMENT_NOT_FOUND',
      'INVALID_ENVIRONMENT_ID',
      'MAINTENANCE_MODE_ACTIVE',
      'FORK_IN_PROGRESS',
      'PRIMARY_ENVIRONMENT_DELETION'
    ].includes((error as EnvironmentError).code as string)
  );
}

/**
 * MCP response type
 */
export type McpResponse = Response;

/**
 * Type for DatoCMS client operations related to environments
 */
export interface EnvironmentsClient {
  /**
   * List all environments
   */
  list: () => Promise<Environment[]>;
  
  /**
   * Find an environment by ID
   */
  find: (id: string) => Promise<Environment>;
  
  /**
   * Rename an environment
   */
  rename: (id: string, data: RenameEnvironmentParams) => Promise<Environment>;
  
  /**
   * Fork an environment
   */
  fork: (id: string, data: ForkEnvironmentParams) => Promise<Environment>;
  
  /**
   * Promote an environment to primary
   */
  promote: (id: string) => Promise<Environment>;
  
  /**
   * Delete an environment
   */
  destroy: (id: string) => Promise<void>;
  
  /**
   * Get maintenance mode status
   */
  getMaintenanceMode: () => Promise<{maintenance_mode: boolean}>;
  
  /**
   * Activate maintenance mode
   */
  activateMaintenanceMode: (force?: boolean) => Promise<{maintenance_mode: boolean}>;
  
  /**
   * Deactivate maintenance mode
   */
  deactivateMaintenanceMode: () => Promise<{maintenance_mode: boolean}>;
}