/**
 * @file getProjectInfoHandler.ts
 * @description Handler for retrieving DatoCMS project information
 * 
 * This handler uses the enhanced factory pattern which provides:
 * - Automatic debug tracking when DEBUG=true
 * - Performance monitoring
 * - Standardized error handling
 * - Schema validation
 */

import { createCustomHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { createResponse } from "../../../../utils/responseHandlers.js";
import { projectSchemas } from "../../schemas.js";
import { createProjectClient } from "../../projectClient.js";

/**
 * Handler for retrieving DatoCMS project information
 * 
 * Debug features:
 * - Tracks API call duration to DatoCMS
 * - Provides execution trace for troubleshooting
 * - Sanitizes sensitive data (API tokens) in debug output
 */
export const getProjectInfoHandler = createCustomHandler({
  domain: 'project',
  schemaName: 'get_info',
  schema: projectSchemas.get_info,
  errorContext: {
    operation: 'retrieve',
    resourceType: 'Site',
    handlerName: 'getProjectInfoHandler'
  }
}, async (args) => {
  const { apiToken, environment } = args;
  
  // Initialize DatoCMS typed client
  const projectClient = createProjectClient(apiToken, environment);
  
  // Retrieve the project information using the typed client
  const site = await projectClient.findSite();
  
  // Return success response with the site data
  return createResponse(JSON.stringify({
    success: true,
    data: site
  }, null, 2));
});
