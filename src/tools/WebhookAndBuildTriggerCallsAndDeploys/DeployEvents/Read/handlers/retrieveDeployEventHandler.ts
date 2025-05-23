import { createRetrieveHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { deployEventSchemas } from "../../../schemas.js";
import { UnifiedClientManager } from "../../../../../utils/unifiedClientManager.js";

/**
 * Retrieves a specific deploy event by ID
 * 
 * @param params Parameters for retrieving a deploy event
 * @returns Response with the deploy event details
 */
export const retrieveDeployEventHandler = createRetrieveHandler({
  domain: "webhooks.deployEvents",
  schemaName: "retrieve",
  schema: deployEventSchemas.retrieve,
  entityName: "Deploy Event",
  idParam: "eventId",
  clientAction: async (client, args) => {
    return await client.deployEvents.find(args.eventId);
  }
});