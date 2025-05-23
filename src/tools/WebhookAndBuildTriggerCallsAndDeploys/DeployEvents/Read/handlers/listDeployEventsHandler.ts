import { createListHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { deployEventSchemas } from "../../../schemas.js";
import { UnifiedClientManager } from "../../../../../utils/unifiedClientManager.js";

/**
 * Retrieves a list of deploy events for a build trigger
 * 
 * @param params Parameters for listing deploy events
 * @returns Response with the list of deploy events
 */
export const listDeployEventsHandler = createListHandler({
  domain: "webhooks.deployEvents",
  schemaName: "list",
  schema: deployEventSchemas.list,
  entityName: "Deploy Event",
  clientAction: async (client, args) => {
    // Fetch deploy events for the specific build trigger with optional filters
    const deployEvents = await client.deployEvents.list({
      "filter[build_trigger_id][eq]": args.buildTriggerId
    });
    return deployEvents;
  }
});