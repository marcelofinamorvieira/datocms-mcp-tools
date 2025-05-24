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
import { SimpleSchemaTypes } from "@datocms/cma-client-node";

/**
 * Handler for renaming a DatoCMS environment
 * 
 * Debug features:
 * - Tracks API call duration to DatoCMS
 * - Logs environment ID changes
 * - Provides execution trace for troubleshooting
 * - Sanitizes sensitive data (API tokens) in debug output
 */
export const renameEnvironmentHandler = createUpdateHandler<any, SimpleSchemaTypes.Environment>({
  domain: 'environments',
  schemaName: 'rename',
  schema: environmentSchemas.rename,
  entityName: 'Environment',
  idParam: 'environmentId',
  successMessage: (result) => `Environment renamed successfully to '${result.id}'.`,
  clientAction: async (client, args) => {
    const { environmentId, newId } = args;
    
    // Use the standard DatoCMS client to rename the environment
    const environment = await client.environments.rename(environmentId, {
      id: newId
    });
    
    return environment;
  }
});