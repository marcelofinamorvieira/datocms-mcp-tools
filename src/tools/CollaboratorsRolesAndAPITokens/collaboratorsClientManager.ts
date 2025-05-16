/**
 * Client manager for CollaboratorsRolesAndAPITokens module.
 * Creates and manages typed client instances.
 */

import { UnifiedClientManager } from '../../utils/unifiedClientManager.js';
import { CollaboratorsClient } from './collaboratorsClient.js';

/**
 * Creates a typed collaborators client from an API token and optional environment.
 * 
 * @param apiToken The DatoCMS API token
 * @param environment Optional environment name
 * @returns A TypedCollaboratorsClient instance
 */
export function createTypedCollaboratorsClientFromToken(
  apiToken: string,
  environment?: string
): CollaboratorsClient {
  return UnifiedClientManager.getCollaboratorsClient(apiToken, environment);
}