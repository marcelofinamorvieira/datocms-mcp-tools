import { createRetrieveHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { webhookSchemas } from "../../../schemas.js";

/**
 * Retrieves a single webhook by ID
 * 
 * @param params Parameters for retrieving a webhook
 * @returns Response with the webhook details
 */
export const retrieveWebhookHandler = createRetrieveHandler({
  domain: "webhooks.webhooks",
  schemaName: "retrieve",
  schema: webhookSchemas.retrieve,
  entityName: "Webhook",
  idParam: "webhookId",
  clientAction: async (client, args) => {
    return await client.webhooks.find(args.webhookId);
  }
});