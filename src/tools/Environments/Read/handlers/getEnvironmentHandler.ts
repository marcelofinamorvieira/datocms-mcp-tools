/**
 * @file getEnvironmentHandler.ts
 * @description Handler for retrieving DatoCMS environment information
 * @module tools/Environments/Read
 * 
 * This handler uses the enhanced factory pattern which provides:
 * - Automatic debug tracking when DEBUG=true
 * - Performance monitoring
 * - Standardized error handling
 * - Schema validation
 */

import { createRetrieveHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { environmentSchemas } from "../../schemas.js";

/**
 * Handler for retrieving a specific DatoCMS environment by ID
 * 
 * Debug features:
 * - Tracks API call duration to DatoCMS
 * - Provides execution trace for troubleshooting
 * - Sanitizes sensitive data (API tokens) in debug output
 */
export const getEnvironmentHandler = createRetrieveHandler({
  domain: 'environments',
  schemaName: 'retrieve',
  schema: environmentSchemas.retrieve,
  entityName: 'Environment',
  idParam: 'environmentId',
  clientAction: async (client, args) => {
    // Fetch environment information
    const environment = await client.environments.find(args.environmentId as string);
    
    return environment;
  }
});