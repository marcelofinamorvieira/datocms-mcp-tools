import { createRetrieveHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { deployEventSchemas } from "../../../schemas.js";
import { SimpleSchemaTypes } from "@datocms/cma-client-node";

/**
 * Retrieves a specific deploy event by ID
 * 
 * @param params Parameters for retrieving a deploy event
 * @returns Response with the deploy event details
 */
export const retrieveDeployEventHandler = createRetrieveHandler<any, SimpleSchemaTypes.BuildEvent>({
  domain: "webhooks.deployEvents",
  schemaName: "retrieve",
  schema: deployEventSchemas.retrieve,
  entityName: "Deploy Event",
  idParam: "eventId",
  clientAction: async (client, args) => {
    return await client.buildEvents.find(args.eventId);
  }
});