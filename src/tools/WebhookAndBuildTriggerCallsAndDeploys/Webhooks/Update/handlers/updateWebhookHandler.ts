import { createUpdateHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { webhookSchemas } from "../../../schemas.js";
import { UnifiedClientManager } from "../../../../../utils/unifiedClientManager.js";
import type { UpdateWebhookParams as ClientUpdateParams } from "../../../webhookAndBuildTriggerTypes.js";

/**
 * Updates an existing webhook in DatoCMS
 * 
 * @param params Parameters for updating a webhook
 * @returns Response with the updated webhook details
 */
export const updateWebhookHandler = createUpdateHandler({
  domain: "webhooks.webhooks",
  schemaName: "update",
  schema: webhookSchemas.update,
  entityName: "Webhook",
  idParam: "webhookId",
  clientAction: async (client, args) => {
    const { webhookId, name, url, headers, events } = args;

    // Build update payload with only the provided parameters
    const updatePayload: ClientUpdateParams = {};
    
    if (name !== undefined) updatePayload.name = name;
    if (url !== undefined) updatePayload.url = url;
    if (headers !== undefined) updatePayload.headers = headers;
    if (events !== undefined) updatePayload.events = events;

    // Update the webhook with proper typing
    return await client.webhooks.update(webhookId, updatePayload);
  }
});