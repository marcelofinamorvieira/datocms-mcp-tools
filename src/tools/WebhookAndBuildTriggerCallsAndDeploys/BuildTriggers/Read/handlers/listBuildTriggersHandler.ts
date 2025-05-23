import { createListHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { buildTriggerSchemas } from "../../../schemas.js";
import { UnifiedClientManager } from "../../../../../utils/unifiedClientManager.js";

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
  listGetter: async (client, args) => {
    return await client.buildTriggers.list();
  },
  countGetter: async (client) => {
    const buildTriggers = await client.buildTriggers.list();
    return buildTriggers.length;
  }
});