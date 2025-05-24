/**
 * @file promoteEnvironmentHandler.ts
 * @description Handler for promoting a DatoCMS environment to primary status
 */

import { createCustomHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { createResponse } from "../../../../utils/responseHandlers.js";
import { environmentSchemas } from "../../schemas.js";
import { UnifiedClientManager } from "../../../../utils/unifiedClientManager.js";

/**
 * Handler for promoting a DatoCMS environment to primary status
 */
export const promoteEnvironmentHandler = createCustomHandler({
  domain: "environments",
  schemaName: "promote",
  schema: environmentSchemas.promote,
  errorContext: {
    operation: "promote",
    resourceType: "Environment",
    handlerName: "promoteEnvironmentHandler"
  }
}, async (args) => {
  const { apiToken, environmentId } = args;
  
  // Initialize DatoCMS client
  const client = UnifiedClientManager.getDefaultClient(apiToken);
  
  // Promote the environment to primary
  const environment = await client.environments.promote(environmentId);
  
  if (!environment) {
    throw new Error(`Failed to promote environment with ID '${environmentId}' to primary.`);
  }
  
  return createResponse(JSON.stringify(environment, null, 2));
});