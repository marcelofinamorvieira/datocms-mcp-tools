import { createUpdateHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { buildTriggerSchemas } from "../../../schemas.js";
import { UnifiedClientManager } from "../../../../../utils/unifiedClientManager.js";
import type { UpdateBuildTriggerParams as ClientUpdateParams } from "../../../webhookAndBuildTriggerTypes.js";

/**
 * Updates an existing build trigger in DatoCMS
 * 
 * @param params Parameters for updating a build trigger
 * @returns Response with the updated build trigger details
 */
export const updateBuildTriggerHandler = createUpdateHandler({
  domain: "webhooks.buildTriggers",
  schemaName: "update",
  schema: buildTriggerSchemas.update,
  entityName: "Build Trigger",
  idParam: "buildTriggerId",
  clientAction: async (client, args) => {
    const { buildTriggerId, name, adapter_settings, indexing_enabled } = args;

    // Build update payload with only the provided parameters
    const updatePayload: ClientUpdateParams = {};
    
    if (name !== undefined) updatePayload.name = name;
    if (adapter_settings !== undefined) updatePayload.adapter_settings = adapter_settings;
    if (indexing_enabled !== undefined) updatePayload.indexing_enabled = indexing_enabled;

    // Update the build trigger with proper typing
    return await client.buildTriggers.update(buildTriggerId, updatePayload);
  }
});