/**
 * Client manager for CollaboratorsRolesAndAPITokens module.
 * Creates and manages typed client instances.
 */

import { getClient } from '../../utils/clientManager.js';
import { CollaboratorsClient, createTypedCollaboratorsClient } from './collaboratorsClient.js';

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
  const client = getClient(apiToken, environment);
  return createTypedCollaboratorsClient(client);
}