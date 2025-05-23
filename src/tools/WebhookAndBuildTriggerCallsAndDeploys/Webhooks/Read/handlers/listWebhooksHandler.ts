import { createListHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { webhookSchemas } from "../../../schemas.js";
import { UnifiedClientManager } from "../../../../../utils/unifiedClientManager.js";

/**
 * Retrieves a list of all webhooks in the DatoCMS project
 * 
 * @param params Parameters for listing webhooks
 * @returns Response with the list of webhooks
 */
export const listWebhooksHandler = createListHandler({
  domain: "webhooks.webhooks",
  schemaName: "list",
  schema: webhookSchemas.list,
  entityName: "Webhook",
  clientAction: async (client, args) => {
    return await client.webhooks.list();
  }
});