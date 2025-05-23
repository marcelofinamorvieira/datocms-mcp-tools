import { createRetrieveHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { buildTriggerSchemas } from "../../../schemas.js";
import { UnifiedClientManager } from "../../../../../utils/unifiedClientManager.js";

/**
 * Retrieves a specific build trigger by ID
 * 
 * @param params Parameters for retrieving a build trigger
 * @returns Response with the build trigger details
 */
export const retrieveBuildTriggerHandler = createRetrieveHandler({
  domain: "webhooks.buildTriggers",
  schemaName: "retrieve",
  schema: buildTriggerSchemas.retrieve,
  entityName: "Build Trigger",
  idParam: "buildTriggerId",
  clientAction: async (client, args) => {
    return await client.buildTriggers.find(args.buildTriggerId);
  }
});