import { createRetrieveHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { webhookCallSchemas } from "../../../schemas.js";
import { UnifiedClientManager } from "../../../../../utils/unifiedClientManager.js";

/**
 * Retrieves a specific webhook call log by ID
 * 
 * @param params Parameters for retrieving a webhook call log
 * @returns Response with the webhook call log details
 */
export const retrieveWebhookCallHandler = createRetrieveHandler({
  domain: "webhooks.webhookCalls",
  schemaName: "retrieve",
  schema: webhookCallSchemas.retrieve,
  entityName: "Webhook Call",
  idParam: "callId",
  clientAction: async (client, args) => {
    return await client.webhookCalls.find(args.callId);
  }
});