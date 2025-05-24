import { createListHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { buildTriggerSchemas } from "../../../schemas.js";

/**
 * Retrieves a list of all build triggers in the DatoCMS project
 * 
 * @param params Parameters for listing build triggers
 * @returns Response with the list of build triggers
 */
export const listBuildTriggersHandler = createListHandler({
  domain: "webhooks.buildTriggers",
  schemaName: "list",
  schema: buildTriggerSchemas.list,
  entityName: "Build Trigger",
  clientAction: async (client, _args) => {
    return await client.buildTriggers.list();
  }
});