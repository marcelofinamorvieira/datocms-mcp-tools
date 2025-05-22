/**
 * @file deleteEnvironmentHandler.ts
 * @description Handler for deleting a DatoCMS environment
 * 
 * This handler uses the enhanced factory pattern which provides:
 * - Automatic debug tracking when DEBUG=true
 * - Performance monitoring
 * - Standardized error handling
 * - Schema validation
 */

import { createDeleteHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { environmentSchemas } from "../../schemas.js";

/**
 * Handler for deleting a DatoCMS environment
 * 
 * Debug features:
 * - Tracks API call duration to DatoCMS
 * - Logs deleted environment ID
 * - Provides execution trace for troubleshooting
 * - Sanitizes sensitive data (API tokens) in debug output
 */
export const deleteEnvironmentHandler = createDeleteHandler({
  domain: 'environments',
  schemaName: 'delete',
  schema: environmentSchemas.delete,
  entityName: 'Environment',
  idParam: 'environmentId',
  successMessage: (id: any) => `Environment '${id}' has been deleted successfully`,
  clientAction: async (client, args) => {
    // Delete the environment
    // Note: Don't pass environmentId when initializing client to avoid
    // issues with trying to use the environment we're deleting
    await client.environments.destroy(args.environmentId);
  }
});