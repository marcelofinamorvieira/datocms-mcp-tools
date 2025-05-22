/**
 * @file renameEnvironmentHandler.ts
 * @description Handler for renaming a DatoCMS environment
 * 
 * This handler uses the enhanced factory pattern which provides:
 * - Automatic debug tracking when DEBUG=true
 * - Performance monitoring
 * - Standardized error handling
 * - Schema validation
 */

import { createUpdateHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { environmentSchemas } from "../../schemas.js";
import { createEnvironmentClient } from "../../environmentClient.js";

/**
 * Handler for renaming a DatoCMS environment
 * 
 * Debug features:
 * - Tracks API call duration to DatoCMS
 * - Logs environment ID changes
 * - Provides execution trace for troubleshooting
 * - Sanitizes sensitive data (API tokens) in debug output
 */
export const renameEnvironmentHandler = createUpdateHandler({
  domain: 'environments',
  schemaName: 'rename',
  schema: environmentSchemas.rename,
  entityName: 'Environment',
  idParam: 'environmentId',
  successMessage: (result: any) => `Environment renamed successfully from '${result.id}' to '${result.id}'.`,
  clientAction: async (client, args) => {
    const { apiToken, environmentId, newId } = args;
    
    // Initialize our type-safe environment client
    const environmentClient = createEnvironmentClient(apiToken);
    
    // Rename the environment using our type-safe client
    const environment = await environmentClient.renameEnvironment(environmentId, {
      id: newId
    });
    
    return environment;
  }
});