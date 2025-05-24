import { createCustomHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { UnifiedClientManager } from "../../../../../utils/unifiedClientManager.js";
import { buildTriggerSchemas } from "../../../schemas.js";

/**
 * Triggers site search reindexing for a build trigger
 * 
 * @param params Parameters for reindexing site search
 * @returns Response indicating success or failure
 */
export const reindexHandler = createCustomHandler({
  domain: "webhooks.buildTriggers",
  schemaName: "reindex",
  schema: buildTriggerSchemas.reindex,
  errorContext: {
    operation: "reindex"
  }
}, async (args: any) => {
  const { apiToken, environment, buildTriggerId } = args;
  
  // Initialize client
  const client = UnifiedClientManager.getDefaultClient(apiToken, environment);
  
  // Trigger site search reindexing
  const result = await client.buildTriggers.reindex(buildTriggerId);

  // Return success response
  const response = {
    success: true,
    message: `Site search reindexing triggered successfully for build trigger ID: ${buildTriggerId}`,
    buildTriggerId,
    result
  };
  
  return createResponse(JSON.stringify(response, null, 2));
});