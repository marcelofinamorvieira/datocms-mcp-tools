import { createCustomHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { UnifiedClientManager } from "../../../../../utils/unifiedClientManager.js";
import { buildTriggerSchemas } from "../../../schemas.js";

/**
 * Triggers a build for a specific build trigger
 * 
 * @param params Parameters for triggering a build
 * @returns Response indicating success or failure
 */
export const triggerBuildHandler = createCustomHandler({
  domain: "webhooks.buildTriggers",
  schemaName: "trigger",
  schema: buildTriggerSchemas.trigger,
  errorContext: {
    operation: "trigger"
  }
}, async (args: any) => {
  const { apiToken, environment, buildTriggerId } = args;
  
  // Initialize client
  const client = UnifiedClientManager.getDefaultClient(apiToken, environment);
  
  // Trigger the build with proper typing
  const deployEvent = await client.buildTriggers.trigger(buildTriggerId);

  // Return success response with typed data
  const result = {
    success: true,
    message: `Build triggered successfully for build trigger ID: ${buildTriggerId}`,
    deploy_event: deployEvent
  };
  
  return createResponse(JSON.stringify(result, null, 2));
});