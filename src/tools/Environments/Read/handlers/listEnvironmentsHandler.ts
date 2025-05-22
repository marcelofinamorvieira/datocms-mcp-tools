/**
 * @file listEnvironmentsHandler.ts
 * @description Handler for listing all DatoCMS environments
 * 
 * This handler uses the enhanced factory pattern which provides:
 * - Automatic debug tracking when DEBUG=true
 * - Performance monitoring
 * - Standardized error handling
 * - Schema validation
 */

import { createListHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { environmentSchemas } from "../../schemas.js";

/**
 * Handler for listing all DatoCMS environments
 * 
 * Debug features:
 * - Tracks API call duration to DatoCMS
 * - Logs number of environments returned
 * - Provides execution trace for troubleshooting
 * - Sanitizes sensitive data (API tokens) in debug output
 */
export const listEnvironmentsHandler = createListHandler({
  domain: 'environments',
  schemaName: 'list',
  schema: environmentSchemas.list,
  entityName: 'Environment',
  clientAction: async (client, args) => {
    // List all environments
    const environments = await client.environments.list();
    
    // Return empty array if no environments found
    return environments || [];
  }
});