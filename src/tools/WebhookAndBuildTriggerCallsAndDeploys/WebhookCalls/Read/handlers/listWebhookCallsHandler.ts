import { createListHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { webhookCallSchemas } from "../../../schemas.js";

/**
 * Retrieves a list of webhook call logs for a specific webhook
 * 
 * @param params Parameters for listing webhook call logs
 * @returns Response with the list of webhook call logs
 */
export const listWebhookCallsHandler = createListHandler({
  domain: "webhooks.webhookCalls",
  schemaName: "list",
  schema: webhookCallSchemas.list,
  entityName: "Webhook Call",
  clientAction: async (client, args) => {
    // Fetch webhook call logs for the specific webhook with proper typing
    const webhookCalls = await client.webhookCalls.list({
      "filter[webhook_id][eq]": args.webhookId
    });
    return webhookCalls;
  }
});