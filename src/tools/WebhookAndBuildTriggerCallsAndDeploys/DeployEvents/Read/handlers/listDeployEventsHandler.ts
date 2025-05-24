import { createListHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { deployEventSchemas } from "../../../schemas.js";
import { SimpleSchemaTypes } from "@datocms/cma-client-node";

/**
 * Retrieves a list of deploy events for a build trigger
 * 
 * @param params Parameters for listing deploy events
 * @returns Response with the list of deploy events
 */
export const listDeployEventsHandler = createListHandler<any, SimpleSchemaTypes.BuildEvent>({
  domain: "webhooks.deployEvents",
  schemaName: "list",
  schema: deployEventSchemas.list,
  entityName: "Deploy Event",
  clientAction: async (client, args) => {
    // Fetch deploy events for the specific build trigger with optional filters
    const deployEvents = await client.buildEvents.list({
      "filter[build_trigger][eq]": args.buildTriggerId
    });
    return deployEvents;
  }
});