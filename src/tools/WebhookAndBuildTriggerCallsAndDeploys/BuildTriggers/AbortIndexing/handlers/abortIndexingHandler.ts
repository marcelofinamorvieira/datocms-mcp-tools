import { createCustomHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { ClientType, UnifiedClientManager } from "../../../../../utils/unifiedClientManager.js";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { buildTriggerSchemas } from "../../../schemas.js";

/**
 * Aborts site search spidering and marks it as failed
 * 
 * @param params Parameters for aborting site search indexing
 * @returns Response indicating success or failure
 */
export const abortIndexingHandler = createCustomHandler({
  domain: "webhooks.buildTriggers",
  schemaName: "abortIndexing",
  schema: buildTriggerSchemas.abortIndexing,
  errorContext: {
    operation: "abortIndexing"
  }
}, async (args: any) => {
  const { apiToken, environment, buildTriggerId } = args;
  
  // Initialize client
  const client = UnifiedClientManager.getDefaultClient(apiToken, environment);
  
  // Abort the site search indexing
  await client.buildTriggers.abortIndexing(buildTriggerId);

  // Return success response
  const result = {
    success: true,
    message: `Site search indexing aborted successfully for build trigger ID: ${buildTriggerId}`,
    buildTriggerId
  };
  
  return createResponse(JSON.stringify(result, null, 2));
});