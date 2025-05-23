import { createCreateHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { buildTriggerSchemas } from "../../../schemas.js";
import { UnifiedClientManager } from "../../../../../utils/unifiedClientManager.js";

/**
 * Creates a new build trigger in DatoCMS
 * 
 * @param params Parameters for creating a build trigger
 * @returns Response with the created build trigger details
 */
export const createBuildTriggerHandler = createCreateHandler({
  domain: "webhooks.buildTriggers",
  schemaName: "create",
  schema: buildTriggerSchemas.create,
  entityName: "Build Trigger",
  clientAction: async (client, args) => {
    const { name, adapter, adapter_settings, indexing_enabled } = args;
    
    // Create the build trigger with the provided parameters
    const buildTrigger = await client.buildTriggers.create({
      name,
      adapter: adapter as any, // Safe cast since it's validated by zod schema
      adapter_settings,
      indexing_enabled: indexing_enabled ?? false,
    });

    return buildTrigger;
  }
});