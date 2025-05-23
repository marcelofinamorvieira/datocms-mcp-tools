import { createCustomHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { buildTriggerSchemas } from "../../../schemas.js";
import { UnifiedClientManager } from "../../../../../utils/unifiedClientManager.js";

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
  entityName: "Build Trigger",
  operation: "trigger",
  clientAction: async (client, args) => {
    // Trigger the build with proper typing
    const deployEvent = await client.buildTriggers.trigger(args.buildTriggerId);

    // Return success response with typed data
    return {
      success: true,
      message: `Build triggered successfully for build trigger ID: ${args.buildTriggerId}`,
      deploy_event: deployEvent
    };
  }
});