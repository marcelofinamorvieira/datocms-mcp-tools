import { createCustomHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { ClientType, UnifiedClientManager } from "../../../../../utils/unifiedClientManager.js";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { buildTriggerSchemas } from "../../../schemas.js";

/**
 * Aborts a build trigger and marks the deploy as failed
 * 
 * @param params Parameters for aborting a build
 * @returns Response indicating success or failure
 */
export const abortBuildHandler = createCustomHandler({
  domain: "webhooks.buildTriggers",
  schemaName: "abort",
  schema: buildTriggerSchemas.abort,
  errorContext: {
    operation: "abort"
  }
}, async (args: any) => {
  const { apiToken, environment, buildTriggerId } = args;
  
  // Initialize client
  const client = UnifiedClientManager.getDefaultClient(apiToken, environment);
  
  // Abort the build trigger
  await client.buildTriggers.abort(buildTriggerId);

  // Return success response
  const result = {
    success: true,
    message: `Build trigger aborted successfully for ID: ${buildTriggerId}`,
    buildTriggerId
  };
  
  return createResponse(JSON.stringify(result, null, 2));
});