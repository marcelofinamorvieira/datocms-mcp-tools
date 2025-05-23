import { createCreateHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { webhookSchemas } from "../../../schemas.js";
import { UnifiedClientManager } from "../../../../../utils/unifiedClientManager.js";
import type { CreateWebhookParams as ClientCreateParams } from "../../../webhookAndBuildTriggerTypes.js";

/**
 * Creates a new webhook in DatoCMS
 * 
 * @param params Parameters for creating a webhook
 * @returns Response with the created webhook details
 */
export const createWebhookHandler = createCreateHandler({
  domain: "webhooks.webhooks",
  schemaName: "create",
  schema: webhookSchemas.create,
  entityName: "Webhook",
  clientAction: async (client, args) => {
    const { name, url, headers, events } = args;

    // Create the webhook with the provided parameters using our typed client
    const createParams: ClientCreateParams = {
      name,
      url,
      headers: headers || {},
      events
    };

    // Create the webhook with proper typing
    return await client.webhooks.create(createParams);
  }
});