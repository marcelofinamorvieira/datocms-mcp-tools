/**
 * @file forkEnvironmentHandler.ts
 * @description Handler for forking a DatoCMS environment
 */

import { createCustomHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { environmentSchemas } from "../../schemas.js";
import { UnifiedClientManager } from "../../../../utils/unifiedClientManager.js";
import { createResponse } from "../../../../utils/responseHandlers.js";

/**
 * Handler for forking a DatoCMS environment
 */
export const forkEnvironmentHandler = createCustomHandler({
  domain: "environments",
  schemaName: "fork",
  schema: environmentSchemas.fork,
  errorContext: {
    operation: "fork",
    resourceType: "Environment",
    handlerName: "forkEnvironmentHandler"
  }
}, async (args) => {
  const { apiToken, environmentId, newId, fast = false, force = false } = args;
  
  // Initialize DatoCMS client
  const client = UnifiedClientManager.getDefaultClient(apiToken, environmentId);
  
  // Fork the environment with immediate_return set to false
  // to wait for the completion of the fork operation
  const forkOptions = {
    id: newId,
    immediate_return: false,
    fast,
    force
  };
  
  const environment = await client.environments.fork(environmentId, forkOptions);
  
  if (!environment) {
    throw new Error(`Failed to fork environment with ID '${environmentId}'.`);
  }
  
  return createResponse(JSON.stringify(environment, null, 2));
});